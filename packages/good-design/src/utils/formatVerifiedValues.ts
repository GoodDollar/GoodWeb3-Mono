export const formatVerifiedValues = ({ credentialSubject, typeName }: any) => {
  if (!credentialSubject) return "Unverified";

  switch (typeName) {
    case "Age":
      return `${credentialSubject.age.from}-${credentialSubject.age.to}`;
    case "Gender":
      return credentialSubject.gender;
    case "Location":
      return credentialSubject.countryCode;
  }
};
