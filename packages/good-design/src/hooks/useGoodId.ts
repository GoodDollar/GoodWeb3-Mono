import {
  useAggregatedCertificates,
  useCertificatesSubject,
  useIdentityExpiryDate,
  useIsAddressVerified
} from "@gooddollar/web3sdk-v2";

export const useGoodId = (account: string) => {
  //todo: fetch full name (if applicable)
  const [isWhitelisted] = useIsAddressVerified(account);
  const [expiryDate, , state] = useIdentityExpiryDate(account ?? "");
  const certificates = useAggregatedCertificates(account);
  const certificateSubjects = useCertificatesSubject(certificates);

  const expiryFormatted = state === "pending" ? "-" : expiryDate?.formattedExpiryTimestamp;

  return {
    certificates,
    certificateSubjects,
    expiryDate,
    expiryFormatted,
    isWhitelisted
  };
};
