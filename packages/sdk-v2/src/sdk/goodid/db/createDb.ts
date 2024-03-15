import Dexie from "dexie";

/**
 * Schema definition for the certificates collection (A collection of credentials per issuer)

 * - field defined below are only the indexed fields
 * - Other fields are according to Veramo's/W3C Credential schema
 */

const schema = {
  certificates: "++primary_idx, *type_subject_idx, credentialSubject.id"
};

export const createCertificatesDb = () => {
  const db = new Dexie("GoodIdCertificates", { autoOpen: true });
  db.version(1).stores(schema);
  return db;
};
