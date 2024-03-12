import { useCallback } from "react";
import * as crypto from "crypto";

import type { Certificate } from "../types";

// This expects a single issuer (gd) for the mvp purpose
export const useCertificates = (db: any) => {
  const getCertificates: () => Promise<Certificate[] | undefined> = useCallback(async () => {
    return await db.certificates.toArray();
  }, [db]);

  const storeCertificate = async (certificate: Certificate) => {
    const certificateId = crypto.createHash("sha256").update(JSON.stringify(certificate)).digest("hex");
    return await db.certificates.put(certificate, [certificateId]);
  };

  const deleteCertificate = async (credentialKeys: string[]) => {
    return await db.certificates.bulkDelete(credentialKeys);
  };

  return { storeCertificate, deleteCertificate, getCertificates };
};
