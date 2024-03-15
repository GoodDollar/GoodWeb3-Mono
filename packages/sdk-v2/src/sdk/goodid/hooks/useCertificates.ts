/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useContext, useEffect, useState } from "react";
import { first } from "lodash";

import { GoodIdContext } from "../../../contexts/goodid/GoodIdContext";

const cleanupCertificate = ({ primary_idx, type_subject_idx, ...certificate }: any) => certificate;

const queryCertificates = async (db, account, types: string[] | null = null) => {
  if (!db) {
    throw new Error("Certificates database not initialized");
  }

  const accountFilter = `did:ethr:${account}`;
  const queryField = types ? "type_subject_idx" : "credentialSubject.id";
  const queryValue = types ? types.map(type => `${accountFilter}_${type}`) : accountFilter;
  const queryOperator = types ? "anyOfIgnoreCase" : "equalsIgnoreCase";

  return db.certificates.where(queryField)[queryOperator](queryValue).reverse().sortBy("issuanceDate");
};

// set types to `false` explicitly to avoid loading on mount
// passsign null or empty value will just load all certs without type filtering
export const useCertificates = (account: string, types: string[] | false | null = null) => {
  const [certificates, setCertificates] = useState<string[]>([]);
  const { db } = useContext(GoodIdContext);

  const getCertificate = useCallback(
    async type =>
      queryCertificates(db, account, [type])
        .then(first) // from lodash
        .then(cleanupCertificate),
    [account, db]
  );

  const storeCertificate = useCallback(
    async certificate => {
      const { type, credentialSubject } = certificate;
      const typeSubjectIdx = type.map(item => `${credentialSubject.id}_${item}`);

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
    if (types === false) {
      return;
    }

    void queryCertificates(db, account, types).then(certificates =>
      setCertificates(certificates.map(cleanupCertificate))
    );
  }, [db, account, types]);

  return { certificates, getCertificate, storeCertificate, deleteCertificate };
};
