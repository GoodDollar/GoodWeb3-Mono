import Dexie from "dexie";

/**
 * Schema definition for the credentials collection
 * - `type`: should indicate the type of the credential
 * - Other fields are according to Veramo's Credential schema
 */

const schema = {
  credentials: "type, credentialSubject.id, issuer.id, issuanceDate"
};

export const createCredentialsDb = () => {
  const db = new Dexie("GoodIdCredentials", { autoOpen: false });
  db.version(1).stores(schema);
  return db;
};
