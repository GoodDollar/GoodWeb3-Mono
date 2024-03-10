import React, { createContext } from "react";

import type { FC, PropsWithChildren } from "react";

import type { VerifiableCredential } from "../../sdk/goodid/types";
import { createCredentialsDb, useCredentials } from "../../sdk/goodid";

type IGoodIdContext = {
  createCredential?: (credential: VerifiableCredential) => Promise<void>;
  deleteCredential?: (credentialKeys: string[]) => Promise<void>;
  getActiveCredentials?: () => Promise<VerifiableCredential[] | undefined>;
  db: any;
};

export const GoodIdContext = createContext<IGoodIdContext>({
  db: undefined
});

interface IGoodIdContextProviderProps {
  localDb?: any; //todo: define db interface for wallet
}

export const GoodIdContextProvider: FC<PropsWithChildren<IGoodIdContextProviderProps>> = ({ children, localDb }) => {
  const db = localDb ? new localDb() : createCredentialsDb();

  const { createCredential, deleteCredential, getActiveCredentials } = useCredentials(db);

  return (
    <GoodIdContext.Provider
      value={{
        createCredential,
        deleteCredential,
        getActiveCredentials,
        db
      }}
    >
      {children}
    </GoodIdContext.Provider>
  );
};
