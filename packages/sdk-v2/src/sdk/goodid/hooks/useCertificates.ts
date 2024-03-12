import { useCallback } from "react";
import { isEmpty } from "lodash";
import { CredentialTypes } from "../types";

import type { Certificate } from "../types";

// This expects a single issuer (gd) for the mvp purpose
export const useCertificates = (db: any) => {
  const getCertificates: (credentialTypes?: string[]) => Promise<Certificate[] | undefined> = useCallback(
    async credentialTypes => {
      const keys = credentialTypes ?? Object.keys(CredentialTypes);
      return await db.certificates.where("type").anyOf(keys).toArray();
    },
    [db]
  );

  const storeCertificate = async (certificate: Certificate) => {
    const existingCertificate = await getCertificates([certificate.type[1]]);
    if (!isEmpty(existingCertificate)) return;
    return await db.certificates.add(certificate);
  };

  const deleteCertificate = async (credentialKeys: string[]) => {
    return await db.certificates.bulkDelete(credentialKeys);
  };

  return { storeCertificate, deleteCertificate, getCertificates };
};
