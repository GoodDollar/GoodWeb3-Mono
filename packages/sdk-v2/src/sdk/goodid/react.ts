/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useContext, useEffect, useState, useRef, useMemo } from "react";
import { size, filter } from "lodash";
import { Platform } from "react-native";
import GeoLocation from "@react-native-community/geolocation";

import { GoodIdContext } from "../../contexts/goodid/GoodIdContext";
import { Certificate, CertificateItem, CertificateRecord, CredentialType } from "./types";
import { requestIdentityCertificate, requestLocationCertificate } from "./sdk";

export interface AggregatedCertificate extends Partial<CertificateItem> {
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
    const certificateByType: Partial<{ [type in CredentialType]: CertificateItem }> = {};
    const typesCount = size(CredentialType);

    for (const item of certificates ?? []) {
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

    return Object.entries(CredentialType).map(([typeName, type]) => {
      const item = certificateByType[type];
      const key = filter([type, item?.id]).join("_");

      return { ...item, key, type, typeName } as AggregatedCertificate;
    });
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

export interface GeoLocation {
  location: [number, number] | null;
}

export const useGeoLocation = (): [location: GeoLocation, error: string | null] => {
  const [geoLocation, setGeoLocation] = useState<GeoLocation>({ location: null });
  const [error, setError] = useState<string | null>(null);

  const onError = error => {
    setError(error);
  };

  const getCurrentPosition = () => {
    // based on the platform getCurrentPosition will use the appropriate API
    GeoLocation.getCurrentPosition(
      (position: any) => {
        const { latitude, longitude } = position.coords;
        setGeoLocation({ location: [latitude, longitude] });
      },
      (error: any) => {
        onError(error);
      },
      {} // is optional but not made optional in the type definition
    );
  };

  useEffect(() => {
    if (Platform.OS === "web") {
      getCurrentPosition();
      return;
    }
    // requestAuthorization only is needed on native
    GeoLocation.requestAuthorization(getCurrentPosition, onError);
  }, []);

  return [geoLocation, error];
};

export const useIssueCertificates = (account: string | undefined, baseEnv: any) => {
  const { storeCertificate } = useCertificates(account ?? "");

  const issueCertificate = useCallback(
    async (account: string, geoLocation: GeoLocation | undefined, fvsig: string) => {
      const { location } = geoLocation ?? {};

      try {
        const promises: Promise<CertificateItem>[] = [];
        if (location) {
          promises.push(requestLocationCertificate(baseEnv, location, fvsig, account));
        }
        promises.push(requestIdentityCertificate(baseEnv, fvsig, account));
        const results = await Promise.all(promises);
        for (const result of results) {
          if (result && result.certificate) {
            await storeCertificate(result.certificate);
          }
        }
      } catch (e) {
        console.error("Failed to get certificates:", e);
        // should trigger error modal
      }
    },
    [baseEnv, storeCertificate]
  );

  return { issueCertificate };
};
