import React, { createContext } from "react";

import type { FC, PropsWithChildren } from "react";
import { createCertificatesDb } from "../../sdk/goodid";

type IGoodIdContext = {
  db: any;
};

export const GoodIdContext = createContext<IGoodIdContext>({
  db: undefined
});

interface IGoodIdContextProviderProps {
  localDb?: any; //todo: define db interface for wallet
}

export const GoodIdContextProvider: FC<PropsWithChildren<IGoodIdContextProviderProps>> = ({ children, localDb }) => {
  const db = localDb ? new localDb() : createCertificatesDb();

  return (
    <GoodIdContext.Provider
      value={{
        db
      }}
    >
      {children}
    </GoodIdContext.Provider>
  );
};
