import { CredentialSubject, CredentialType } from "@gooddollar/web3sdk-v2";

import isoCountries from "i18n-iso-countries";
import { getKeyByValue } from "./enum";

// eslint-disable-next-line @typescript-eslint/no-var-requires
isoCountries.registerLocale(require("i18n-iso-countries/langs/en.json"));

const getCountryName = (countryCode: string): string => {
  const countryName = isoCountries.getName(countryCode, "en");
  return countryName || "Unverified-Location";
};

export interface FormattedCertificate {
  credentialSubject: CredentialSubject | undefined;
  typeName: CredentialType;
}

/* 
  This function formats the verified values of a gooddollar issued certificate.
  It takes a FormattedCertificate object and returns a string.
  If the credentialSubject is undefined, it returns "Unverified".
  Otherwise, it returns the formatted value of the credentialSubject.
*/
const formatCredentialMapper: { [key in CredentialType]: (cred: CredentialSubject) => string } = {
  [CredentialType.Age]: cred => `${cred.age.min}-${cred.age.max}`,
  [CredentialType.Gender]: cred => cred.gender,
  [CredentialType.Location]: cred => getCountryName(cred.countryCode),
  [CredentialType.Identity]: cred => `ID: ${cred.id}`
};

export const formatVerifiedValues = ({ credentialSubject, typeName }: FormattedCertificate) => {
  if (!credentialSubject) {
    const typeKey = getKeyByValue(CredentialType, typeName);
    return `Unverified-${typeKey}`;
  }

  return formatCredentialMapper[typeName](credentialSubject);
};
