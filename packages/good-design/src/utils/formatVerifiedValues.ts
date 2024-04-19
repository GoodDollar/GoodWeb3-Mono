export const formatVerifiedValues = ({ credentialSubject, typeName }: any) => {
  if (!credentialSubject) return "Unverified";

  switch (typeName) {
    case "Age":
      return `${credentialSubject.age.min}-${credentialSubject.age.max}`;
    case "Gender":
      return credentialSubject.gender;
    case "Location":
      return credentialSubject.countryCode;
  }
};
