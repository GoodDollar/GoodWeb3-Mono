import React, { useCallback, useState } from "react";

export type WizardContextValues = {
  data: { [key: string]: any };
  setDataValue: (key: string, value: any) => void;
  updateDataValue: (baseKey: string, updateKey: string, value: any) => void;
};

export const WizardContext = React.createContext<WizardContextValues>({
  data: {},
  setDataValue: () => {
    return;
  },
  updateDataValue: () => {
    return;
  }
});

export const WizardContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState({} as { [key: string]: any });

  const setDataValue = useCallback((key: string, value: any) => {
    setData(prevData => ({ ...prevData, [key]: value }));
  }, []);

  const updateDataValue = useCallback((baseKey: string, updateKey: string, value: any) => {
    setData(prevData => {
      const baseValue = prevData[baseKey] || {};
      return {
        ...prevData,
        [baseKey]: {
          ...baseValue,
          [updateKey]: value
        }
      };
    });
  }, []);

  return <WizardContext.Provider value={{ data, setDataValue, updateDataValue }}>{children}</WizardContext.Provider>;
};
