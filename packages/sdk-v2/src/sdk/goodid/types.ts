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
export enum CredentialType {
  Age = "VerifiableAgeCredential",
  Gender = "VerifiableGenderCredential",
  Location = "VerifiableLocationCredential",
  Identity = "VerifiableIdentityCredential" // identity credential/certificate consists of Age/Gender/FaceVerification
}
export interface CertificateRecord extends Certificate {
  primary_idx: string;
  type_subject_idx: string[];
}
export interface CertificateItem {
  id: string;
  certificate: Certificate;
}

/**
 * Current available criteria for which an good-dollar certificate can be issued
 */
export interface PoolCriteria {
  Location?: { countryCode: string };
  Age?: { min: number; max: number };
  Gender?: string;
  Identity?: { unique: boolean };
}

export type CertificateSubject = {
  age?: { min: number; max: number };
  gender?: string;
  location?: { countryCode: string };
};
export type CredentialSubjectsByType = Record<string, CredentialSubject | undefined>;
