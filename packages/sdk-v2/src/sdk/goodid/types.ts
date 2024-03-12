// Reference: https://veramo.io/docs/basics/verifiable_data
export interface CredentialProof {
  type: string;
  jwt: string;
}

export interface CredentialSubject {
  id: string;
  [key: string]: any;
}

export interface Issuer {
  id: string;
}

export interface Certificate {
  credentialSubject: CredentialSubject;
  issuer: Issuer;
  type: string[];
  "@context": string[];
  issuanceDate: string;
  proof: CredentialProof;
}

// Might change
export enum CredentialTypes {
  VerifiableAgeCredential = "Age",
  VerifiableGenderCredential = "Gender",
  VerifiableLocationCredential = "Location",
  VerifiableIdentityCredential = "Identity" // identity credential/certificate consists of Age/Gender/FaceVerification
}
