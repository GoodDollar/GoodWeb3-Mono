/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useContext, useEffect, useState, useRef, useMemo } from "react";
import { first, size } from "lodash";

import { GoodIdContext } from "../../../contexts/goodid/GoodIdContext";
import { Certificate, CredentialType } from "../types";
import { CertificateRecord } from "../db";

export interface CertificateItem {
  id: string
  certificate: Certificate
}

export interface AggregatedCertificate extends CertificateItem {
  key: string // composite unique key to be used for lists rendering
  type: CredentialType
  typeName: keyof typeof CredentialType
}

const cleanupCertificate = ({ primary_idx, type_subject_idx, ...certificate }: CertificateRecord) => certificate;

const certificateRecordToItem = (record: CertificateRecord): CertificateItem => ({
  id: record.primary_idx,
  certificate: cleanupCertificate(record)
})

const queryCertificates = async (db: any, account: string, types: CredentialType[] | null = null): Promise<CertificateRecord[]> => {
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
export const useCertificates = (account: string, onDatabaseUpdated: () => Promise<unknown> = async () => {}) => {
  const { db } = useContext(GoodIdContext);

  const loadCertificates = useCallback(async (types: CredentialType[] | null = null): Promise<CertificateItem[]> => 
    account ? queryCertificates(db, account, types).then(certificates => certificates.map(certificateRecordToItem)) : [],
    [db, account]
  );

  const getCertificate = useCallback(
    async (type: CredentialType): Promise<Certificate> =>
      queryCertificates(db, account, [type])
        .then(first) // from lodash
        .then(cleanupCertificate),
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
      await onDatabaseUpdated()
    },
    [db, onDatabaseUpdated]
  );

  const deleteCertificate = useCallback(async (primaryKeys: string[]) => {
    await db.certificates.bulkDelete(primaryKeys);
    await onDatabaseUpdated()
  }, [db, onDatabaseUpdated]);

  return { loadCertificates, getCertificate, storeCertificate, deleteCertificate };
};

// full list
export const useCertificatesList = (account: string, types: CredentialType[] | null = null): CertificateItem[] => {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const loadCertificatesRef = useRef() // solves circular callback deps issue
  
  const fetchCertificates = useCallback(
    async () => loadCertificatesRef?.current(types).then(setCertificates), 
    [types, setCertificates]
  );

  const { loadCertificates } = useCertificates(account, fetchCertificates)
  
  useEffect(() => void (loadCertificatesRef.current = loadCertificates), [loadCertificates])

  useEffect(() => {
    fetchCertificates()
  }, [fetchCertificates]);

  return certificates
};

// aggregated list - one per type
export const useAggregatedCertificates = (account: string): AggregatedCertificate[] => {
  const certificates = useCertificatesList(account)

  return useMemo(() => {
    const certificateByType: Partial<{ [type in CredentialType]: CertificateItem }> = {}
    const typesCount = size(CredentialType)

    for (const item of certificates) {
      if (size(certificateByType) >= typesCount) {
        break
      }

      const [, ...creds] = item.certificate.type

      for (const type of creds) {
        if (certificateByType[type]) {
          continue;
        }

        certificateByType[type] = item
      }
    }

    return Object.entries(certificateByType).map(([type, item]) => ({
      key: `${type}_${item.id}`,
      ...item,
      type,
      typeName: Object.keys(CredentialType).find(key => CredentialType[key] === type)
    }))

  }, [certificates])
}