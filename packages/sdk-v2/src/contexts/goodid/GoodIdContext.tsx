import React, { createContext } from "react";

import type { FC, PropsWithChildren } from "react";

import type { Certificate } from "../../sdk/goodid/types";
import { createCertificatesDb, useCertificates } from "../../sdk/goodid";

type IGoodIdContext = {
  storeCertificate?: (credential: Certificate) => Promise<void>;
  deleteCertificate?: (credentialKeys: string[]) => Promise<void>;
  getCertificates?: () => Promise<Certificate[] | undefined>;
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

  const { storeCertificate, deleteCertificate, getCertificates } = useCertificates(db);

  return (
    <GoodIdContext.Provider
      value={{
        storeCertificate,
        deleteCertificate,
        getCertificates,
        db
      }}
    >
      {children}
    </GoodIdContext.Provider>
  );
};
