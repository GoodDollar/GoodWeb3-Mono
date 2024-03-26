/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useContext, useEffect, useState, useRef, useMemo } from "react";
import { isEmpty, size } from "lodash";
import { Platform } from "react-native";
import GeoLocation from "@react-native-community/geolocation";

import { GoodIdContext } from "../../contexts/goodid/GoodIdContext";
import { Certificate, CertificateRecord, CredentialType } from "./types";

export interface CertificateItem {
  id: string;
  certificate: Certificate;
}

export interface AggregatedCertificate extends CertificateItem {
  key: string; // composite unique key to be used for lists rendering
  type: CredentialType;
  typeName: keyof typeof CredentialType;
}

const cleanupCertificate = ({ primary_idx, type_subject_idx, ...certificate }: CertificateRecord) => certificate;

const certificateRecordToItem = (record: CertificateRecord): CertificateItem => ({
  id: record.primary_idx,
  certificate: cleanupCertificate(record)
});

const queryCertificates = async (
  db: any,
  account: string,
  types: CredentialType[] | null = null
): Promise<CertificateRecord[]> => {
  if (!db) {
    throw new Error("Certificates database not initialized");
  }

  const accountFilter = `did:ethr:${account}`;
  const queryField = types ? "type_subject_idx" : "credentialSubject.id";
  const queryValue = types ? types.map(type => `${accountFilter}_${type}`) : accountFilter;
  const queryOperator = types ? "anyOfIgnoreCase" : "equalsIgnoreCase";

  return db.certificates.where(queryField)[queryOperator](queryValue).reverse().sortBy("issuanceDate");
};

// core API
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const useCertificates = (account: string, onDatabaseUpdated: () => Promise<unknown> = async () => {}) => {
  const { db } = useContext(GoodIdContext);

  const loadCertificates = useCallback(
    async (types: CredentialType[] | null = null): Promise<CertificateItem[]> =>
      account
        ? queryCertificates(db, account, types).then(certificates => certificates.map(certificateRecordToItem))
        : [],
    [db, account]
  );

  const getCertificate = useCallback(
    async (type: CredentialType): Promise<Certificate | undefined> => {
      const [certificate] = await queryCertificates(db, account, [type]);

      if (certificate) {
        return cleanupCertificate(certificate);
      }
    },
    [account, db]
  );

  const storeCertificate = useCallback(
    async (certificate: Certificate) => {
      const { type, credentialSubject } = certificate;
      const typeSubjectIdx = type.map(item => `${credentialSubject.id}_${item}`);

      // unfortunately we need an additional manual-filled field for the index
      // because compound indexes cannot be combined with multi-entry ones
      // that's IndexedDB limitation (
      await db.certificates.add({ ...certificate, type_subject_idx: typeSubjectIdx });
      await onDatabaseUpdated();
    },
    [db, onDatabaseUpdated]
  );

  const deleteCertificate = useCallback(
    async (primaryKeys: string[]) => {
      await db.certificates.bulkDelete(primaryKeys);
      await onDatabaseUpdated();
    },
    [db, onDatabaseUpdated]
  );

  return { loadCertificates, getCertificate, storeCertificate, deleteCertificate };
};

// full list
export const useCertificatesList = (
  account: string,
  types: CredentialType[] | null = null
): CertificateItem[] | null => {
  const [certificates, setCertificates] = useState<CertificateItem[] | null>(null);
  const loadCertificatesRef = useRef<((types?: CredentialType[] | null) => Promise<CertificateItem[]>) | null>(null); // solves circular callback deps issue

  const fetchCertificates = useCallback(async () => {
    if (loadCertificatesRef?.current) {
      return loadCertificatesRef?.current(types).then(setCertificates);
    }
  }, [types, setCertificates]);

  const { loadCertificates } = useCertificates(account, fetchCertificates);

  useEffect(() => void (loadCertificatesRef.current = loadCertificates), [loadCertificates]);

  useEffect(() => {
    void fetchCertificates();
    // eslint-disable-next-line react-hooks-addons/no-unused-deps
  }, [fetchCertificates, account]);

  return certificates;
};

// aggregated list - one per type
export const useAggregatedCertificates = (account: string): AggregatedCertificate[] => {
  const certificates = useCertificatesList(account);

  return useMemo(() => {
    if (!certificates || isEmpty(account)) return [];
    const certificateByType: Partial<{ [type in CredentialType]: CertificateItem }> = {};
    const typesCount = size(CredentialType);

    for (const item of certificates) {
      if (size(certificateByType) >= typesCount) {
        break;
      }

      const [, ...creds] = item.certificate.type;

      for (const type of creds) {
        if (certificateByType[type]) {
          continue;
        }

        certificateByType[type] = item;
      }
    }

    return Object.entries(certificateByType).map(([type, item]) => ({
      key: `${type}_${item.id}`,
      ...item,
      type: type as CredentialType,
      typeName: Object.keys(CredentialType).find(key => CredentialType[key] === type) as keyof typeof CredentialType
    }));
  }, [certificates]);
};

// could be the configuration has to be set on the native side (on root-level)
// at least the permission android.permission.ACCESS_FINE_LOCATION has to be added
// in order for below hook to work

// GeoLocation.setRNConfiguration({
//   skipPermissionRequests: false,
//   authorizationLevel: "whenInUse",
//   locationProvider: "auto"
// });

interface LocationState {
  location: [number, number] | null;
  error?: string | null;
}

export const useLocation = () => {
  const [locationState, setLocationState] = useState<LocationState>({ location: null, error: null });

  const onError = error => {
    setLocationState({ location: null, error });
  };

  const getCurrentPosition = () => {
    // based on the platform getCurrentPosition will use the appropriate API
    GeoLocation.getCurrentPosition(
      (position: any) => {
        const { latitude, longitude } = position.coords;
        setLocationState({ location: [latitude, longitude] });
      },
      (error: any) => {
        onError(error);
      },
      {} // is optional but not made optional in the type definition
    );
  };

  useEffect(() => {
    console.log("platform", Platform.OS);
    if (Platform.OS === "web") {
      getCurrentPosition();
      return;
    }
    // requestAuthorization only is needed on native
    GeoLocation.requestAuthorization(getCurrentPosition, onError);
  }, []);

  return { locationState };
};
