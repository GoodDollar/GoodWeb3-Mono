import Dexie from "dexie";

/**
 * Schema definition for the certificates collection (A collection of credentials per issuer)
 * - ',': primary key will be the hash of the credential set when storing it
 * - field defined below are only the indexed fields
 * - Other fields are according to Veramo's/W3C Credential schema
 */

const schema = {
  certificates: ",certificate,credentialSubject_id, type, issuer, issuanceDate"
};

export const createCertificatesDb = () => {
  const db = new Dexie("GoodIdCertificates", { autoOpen: true });
  db.version(1).stores(schema);
  return db;
};
