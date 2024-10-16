import React, { createContext, FC, PropsWithChildren, useContext, useEffect, useState } from "react";

import { I18nProvider as Locali18nProvider } from "@lingui/react";

import { setupI18n } from "@lingui/core";

import { defaultMessages } from "../locales";

const locali18n = setupI18n({ locale: "en", messages: defaultMessages.en });
locali18n.load(defaultMessages);

const LanguageContext = createContext<
  { language: string; setLanguage: (lang: string) => void; ci18n: typeof locali18n } | undefined
>(undefined);

export const useGoodUILanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const GoodUIi18nProvider: FC<PropsWithChildren<{ defaultLanguage?: string }>> = ({
  defaultLanguage = "en",
  children
}) => {
  const [language, setLanguage] = useState(defaultLanguage);

  useEffect(() => {
    locali18n.activate(language);
  }, [/*used*/ language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, ci18n: locali18n }}>
      <Locali18nProvider i18n={locali18n}>{children}</Locali18nProvider>
    </LanguageContext.Provider>
  );
};

export { locali18n };
