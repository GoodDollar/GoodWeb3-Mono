import React, { createContext, FC, PropsWithChildren, useContext } from "react";

interface GoodIdProviderProps {
  onGoToClaim?: () => void;
}

const GoodIdProviderContext = createContext<GoodIdProviderProps | undefined>(undefined);

export const useGoodIdProvider = () => {
  const context = useContext(GoodIdProviderContext);
  if (!context) {
    throw new Error("useGoodIdContext must be used within a GoodIdProvider");
  }
  return context;
};

export const GoodIdProvider: FC<
  {
    onGoToClaim?: () => void;
  } & PropsWithChildren
> = ({ children, onGoToClaim }) => {
  return <GoodIdProviderContext.Provider value={{ onGoToClaim }}>{children}</GoodIdProviderContext.Provider>;
};
