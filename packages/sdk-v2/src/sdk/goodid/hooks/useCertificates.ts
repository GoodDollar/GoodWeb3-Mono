import { useCallback } from "react";
import type { Certificate } from "../types";

// This expects a single issuer (gd) for the mvp purpose
export const useCertificates = (db: any) => {
  const getCertificates: () => Promise<Certificate[] | undefined> = useCallback(async () => {
    return await db.transaction("r", [db.certificates_credentials, db.certificates], async () => {
      const certificateId = await db.certificates.primaryKeys();
      const credentialsList = await db.certificates_credentials.where({ certificates_id: certificateId }).toArray();
      return credentialsList;
    });
  }, [db]);

  const storeCertificate = async (certificate: Certificate) => {
    return await db.transaction("rw", [db.certificates, db.certificates_credentials], async () => {
      let certificateId: any;
      certificateId = await db.certificates.primaryKeys();

      if (!certificateId) {
        certificateId = await db.certificates.add({});
      }

      await db.certificates_credentials.put({ certificates_id: certificateId, ...certificate });
    });
  };

  const deleteCertificate = async (credentialKeys: string[]) => {
    return await db.certificates_credentials.bulkDelete(credentialKeys);
  };

  return { storeCertificate, deleteCertificate, getCertificates };
};
