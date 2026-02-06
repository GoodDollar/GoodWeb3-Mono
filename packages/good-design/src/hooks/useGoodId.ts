import {
  useAggregatedCertificates,
  useCertificatesSubject,
  useIdentityExpiryDate,
  useIsAddressVerified
} from "@gooddollar/web3sdk-v2";

export const useGoodId = (account: string) => {
  //todo: fetch full name (if applicable)
  const [result] = useIsAddressVerified(account);
  const isWhitelisted = result?.isVerified ?? false;
  const whitelistedRoot = result?.whitelistedRoot ?? null;
  const [expiryDate, , state] = useIdentityExpiryDate(account ?? "");
  const certificates = useAggregatedCertificates(account);
  const certificateSubjects = useCertificatesSubject(certificates);

  const expiryFormatted = state === "pending" ? "-" : expiryDate?.formattedExpiryTimestamp;

  return {
    certificates,
    certificateSubjects,
    expiryDate,
    expiryFormatted,
    isWhitelisted,
    whitelistedRoot
  };
};
