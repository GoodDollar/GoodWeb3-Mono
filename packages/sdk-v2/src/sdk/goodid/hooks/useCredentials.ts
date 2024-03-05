import { useCallback } from "react";
import type { VerifiableCredential } from "../types";

// todo: create credential should consider update if already exists
// todo: add db updateCredential
// todo: add db deleteCredential

export const useCredentials = (db: any) => {
  const getActiveCredentials: () => Promise<VerifiableCredential[] | undefined> = useCallback(async () => {
    try {
      await db.open();
      const credentialsList = (await db.credentials.toArray()) as VerifiableCredential[];
      return credentialsList;
    } catch (error) {
      console.error("Failed to get active credentials:", error);
    } finally {
      await db.close();
    }
  }, [db]);

  const createCredential = async (credential: VerifiableCredential) => {
    try {
      await db.open();
      await db.credentials.put(credential, [credential.type[1]]);
    } catch (error) {
      console.error("Failed to create credential:", error);
    } finally {
      await db.close();
    }
  };

  const deleteCredential = async (credentialKeys: string[]) => {
    try {
      await db.open();
      await db.credentials.bulkDelete(credentialKeys);
    } catch (e) {
      console.error("Failed to delete credential:", e);
    } finally {
      await db.close();
    }
  };

  return { createCredential, deleteCredential, getActiveCredentials };
};
