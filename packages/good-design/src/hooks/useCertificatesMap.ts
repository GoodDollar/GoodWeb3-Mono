import { AggregatedCertificate, CredentialSubject } from "@gooddollar/web3sdk-v2";
import { useMemo } from "react";

export const useCertificatesMap = (certificates: AggregatedCertificate[]) => {
  return useMemo(() => {
    return certificates.reduce((acc, { certificate, typeName }) => {
      if (certificate) {
        acc[typeName] = certificate.credentialSubject;
      }

      return acc;
    }, {} as Record<string, CredentialSubject | undefined>);
  }, [certificates]);
};
