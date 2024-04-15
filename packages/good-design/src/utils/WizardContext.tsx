import React, { useCallback, useState } from "react";

export type WizardContextValues = {
  data: { [key: string]: any };
  setDataValue: (key: string, value: any) => void;
};

export const WizardContext = React.createContext<WizardContextValues>({
  data: {},
  setDataValue: () => {
    return;
  }
});

export const WizardContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState({});

  const setDataValue = useCallback((key: string, value: any) => {
    setData(prevData => ({ ...prevData, [key]: value }));
  }, []);

  return <WizardContext.Provider value={{ data, setDataValue }}>{children}</WizardContext.Provider>;
};
