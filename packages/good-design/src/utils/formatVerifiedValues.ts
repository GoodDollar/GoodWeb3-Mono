import { CredentialSubject, CredentialType } from "@gooddollar/web3sdk-v2";

export interface FormattedCertificate {
  credentialSubject: CredentialSubject | undefined;
  typeName: CredentialType;
}

const formatCredentialMapper: { [key in CredentialType]: (cred: CredentialSubject) => string } = {
  [CredentialType.Age]: cred => `${cred.age.min}-${cred.age.max}`,
  [CredentialType.Gender]: cred => cred.gender,
  [CredentialType.Location]: cred => cred.countryCode,
  [CredentialType.Identity]: cred => `ID: ${cred.id}`
};

export const formatVerifiedValues = ({ credentialSubject, typeName }: FormattedCertificate) => {
  if (!credentialSubject) return "Unverified";
  return formatCredentialMapper[typeName](credentialSubject);
};
