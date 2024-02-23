import React, { createContext } from "react";

import type { VerifiableCredential } from "../../sdk/goodid/types";
import { createCredentialsDb, useCredentials } from "../../sdk/goodid";

type IGoodIdContext = {
  createCredential?: (credential: VerifiableCredential) => Promise<void>;
  getActiveCredentials?: () => Promise<VerifiableCredential[] | undefined>;
  db: any;
};

export const GoodIdContext = createContext<IGoodIdContext>({
  db: undefined
});

interface IGoodIdContextProvider {
  children: any;
  localDb?: any; //todo: define db interface for wallet
}

export const GoodIdContextProvider = ({ children, localDb }: IGoodIdContextProvider) => {
  const db = localDb ? new localDb() : createCredentialsDb();

  const { createCredential, getActiveCredentials } = useCredentials(db);

  return (
    <GoodIdContext.Provider
      value={{
        createCredential,
        getActiveCredentials,
        db
      }}
    >
      {children}
    </GoodIdContext.Provider>
  );
};