/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useContext, useEffect, useState, useRef, useMemo } from "react";
import { filter, isEqual, omit, size } from "lodash";
import { Platform } from "react-native";
import GeoLocation from "@react-native-community/geolocation";
import usePromise from "react-use-promise";
import { useLiveQuery } from "dexie-react-hooks";
import { isEmpty } from "lodash";

import { AsyncStorage } from "../storage";
import { GoodIdContext } from "../../contexts/goodid/GoodIdContext";
import {
  Certificate,
  CertificateItem,
  CertificateRecord,
  CredentialSubjectsByType,
  CredentialType,
  PoolCriteria
} from "./types";
import { checkCriteriaMatch, requestIdentityCertificate, requestLocationCertificate } from "./sdk";
import { useSendAnalytics } from "@gooddollar/web3sdk-v2/src/sdk/analytics";

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

  const loadCertificates = useLiveQuery(
    async (types: CredentialType[] | null = null): Promise<CertificateItem[] | null> =>
      account
        ? queryCertificates(db, account, types).then(certificates => certificates.map(certificateRecordToItem))
        : null,
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

// aggregated list - one per type
export const useAggregatedCertificates = (account: string): AggregatedCertificate[] => {
  const { loadCertificates: certificates } = useCertificates(account);

  return useMemo(() => {
    // means certificates is not loaded yet, when loaded it is an empty array
    if (!certificates) return [];
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

/**
 * Request VerifiableCredentials from GoodDollar and store them in the local database
 * @param account - the evm address which was used to pass the FaceVerification of the gooddollar protocol
 * @param baseEnv
 * @returns
 */
export const useIssueCertificates = (account: string | undefined, baseEnv: any) => {
  const { storeCertificate } = useCertificates(account ?? "");
  const { track } = useSendAnalytics();

  return useCallback(
    async (account: string, geoLocation: GeoLocation | undefined, fvsig: string) => {
      const { location } = geoLocation ?? {};

      try {
        const promises: Promise<CertificateItem>[] = [];

        if (location) {
          promises.push(requestLocationCertificate(baseEnv, location, fvsig, account));
        }

        promises.push(requestIdentityCertificate(baseEnv, fvsig, account));

        const results = await Promise.allSettled(promises);

        for (const result of results) {
          if (result.status === "fulfilled" && result.value && result.value.certificate) {
            await storeCertificate(result.value.certificate);
          } else if (result.status === "rejected") {
            console.error("Failed to get a certificate:", result.reason);
            throw new Error(result.reason);
          }
        }
      } catch (e: any) {
        track("goodid_error", { error: "SEGMENTATION_FAILED", message: "Failed to request or store a certificate", e });
        console.error("Unexpected error:", e);
      }
    },
    [baseEnv, storeCertificate]
  );
};

/**
 * @param certificates
 * @returns the credential subjects from the certificates
 */
export const useCertificatesSubject = (certificates: AggregatedCertificate[]) =>
  useMemo(() => {
    return certificates.reduce((acc, { certificate, typeName }) => {
      if (certificate) {
        acc[typeName] = certificate.credentialSubject;
      }

      return acc;
    }, {} as CredentialSubjectsByType);
  }, [certificates]);

export interface CheckAvailableOffersProps {
  account: string;
  pools: PoolCriteria[];
  isDev: boolean;
  onDone?: (skipOffer: boolean) => void;
}

/**
 * Check if the user is eligible for any of the offers
 * @param account - the evm address which was used to pass the FaceVerification of the gooddollar protocol
 * @param pools - the list of offers to check against
 * @returns the list of offers the user is eligible for
 * @example
 */
export const useCheckAvailableOffers = ({ account, pools, isDev, onDone }: CheckAvailableOffersProps) => {
  const certificates = useAggregatedCertificates(account);
  const certificatesSubjects = useCertificatesSubject(certificates);

  const [hasPermission] = usePromise(
    () => AsyncStorage.getItem("goodid_permission").then(value => value === "true"),
    []
  );

  const [skipOffer] = usePromise(
    () => AsyncStorage.getItem("goodid_noOffersModalAgain").then(value => value === "true"),
    []
  );

  return useMemo(() => {
    // keep null until we have fetched everything
    if (isEmpty(certificates) || hasPermission === undefined) return null;

    if (!hasPermission || skipOffer) {
      onDone?.(true);
      return false;
    }

    return pools.filter(pool => {
      return Object.entries(omit(pool, "campaign")).every(([key, criteria]) => {
        const certificateSubject = certificatesSubjects[key];

        if (!certificateSubject) return false;

        if (
          isDev &&
          (key !== "Location" ||
            (certificatesSubjects.Gender?.gender === "Male" &&
              ["TH", "JP", "UA", "IL", "BR", "NG", "NL"].includes(certificateSubject.countryCode) &&
              (criteria as { countryCode: string }).countryCode === "CO") ||
            (certificatesSubjects.Gender?.gender === "Female" &&
              ["US", "IL", "ES", "CO"].includes(certificateSubject.countryCode) &&
              (criteria as { countryCode: string }).countryCode === "NG"))
        ) {
          return true;
        }

        return checkCriteriaMatch(certificateSubject, criteria, key as keyof PoolCriteria);
      });
    });
  }, [certificatesSubjects, certificates, hasPermission]);
};
