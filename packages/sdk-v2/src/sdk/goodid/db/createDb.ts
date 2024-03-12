import Dexie from "dexie";

/**
 * Schema definition for the certificates collection
 * - `id`: incrementing id linked to various verified credentials
 * Schema definition for the certificates collection (A collection of credentials per issuer)
 * - `type`: should indicate the types of the credential
 * - Other fields are according to Veramo's/W3C Credential schema
 */

const schema = {
  certificates: "++id",
  certificates_credentials: "++index, certificate_id, credentialSubject_id, issuer_id, type, issuanceDate"
};

export const createCertificatesDb = () => {
  const db = new Dexie("GoodIdCertificates", { autoOpen: true });
  db.version(1).stores(schema);
  return db;
};
