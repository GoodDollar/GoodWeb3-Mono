import { useCallback, useContext, useEffect, useState } from "react";
import { first } from "lodash";

import type { Certificate } from "../types";

import { GoodIdContext } from "../../../contexts";

const cleanupCertificate = (value: any) => {
  if (!value) return [];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { primary_idx, type_subject_idx, ...certificate } = value;
  return certificate;
};

const queryCertificates = async (db: any, account: string | undefined, types: string[] | null = null) => {
  if (!db || !account) {
    throw new Error("Certificates database not initialized");
  }

  const accountFilter = `did:ethr:${account}`;
  const queryField = types ? "type_subject_idx" : "credentialSubject.id";
  const queryValue = types ? types.map(type => `${accountFilter}_${type}`) : accountFilter;
  const queryOperator = types ? "anyOfIgnoreCase" : "equalsIgnoreCase";
  return db.certificates.where(queryField)[queryOperator](queryValue).reverse().sortBy("issuanceDate");
};

// set types to `false` explicitly to avoid loading on mount
// passign null or empty value will just load all certs without type filtering
export const useCertificates = (account: string | undefined, types: string[] | null | false = null) => {
  const [certificates, setCertificates] = useState<Certificate[]>();
  const { db } = useContext(GoodIdContext);

  const getCertificate = useCallback(
    async (type: string[]) =>
      queryCertificates(db, account, type)
        .then(first) // from lodash
        .then(cleanupCertificate),
    [account, db]
  );

  const storeCertificate = useCallback(
    async certificate => {
      const { type, credentialSubject } = certificate;
      const typeSubjectIdx = `${credentialSubject.id}_${type[1]}`;

      // unfortunately we need an additional manual-filled field for the index
      // because compound indexes cannot be combined with multi-entry ones
      // that's IndexedDB limitation (
      return db.certificates.add({ ...certificate, type_subject_idx: typeSubjectIdx });
    },
    [db]
  );

  const deleteCertificate = async (credentialKeys: string[]) => {
    return await db.certificates.bulkDelete(credentialKeys);
  };

  useEffect(() => {
    if (types === false || !account) {
      return;
    }

    if (!certificates) {
      void queryCertificates(db, account, types).then(certificates =>
        setCertificates(certificates.map(cleanupCertificate))
      );
    }
  }, [setCertificates, account, types]);

  return { certificates, getCertificate, storeCertificate, deleteCertificate };
};
