import { Certificate } from "../types";

export * from "./createDb";

export interface CertificateRecord extends Certificate {
  primary_idx: string;
  type_subject_idx: string[];
}
