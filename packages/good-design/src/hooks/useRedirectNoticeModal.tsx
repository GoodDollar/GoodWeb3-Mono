import React, { createContext, useState, useContext } from "react";
import { noop } from "lodash";

type RedirectNoticeContextProps = {
  goToExternal: (e: any, url: string) => void;
  modalProps: {
    open: boolean;
    url: string;
  };
};
const RedirectNoticeContext = createContext<RedirectNoticeContextProps>({
  goToExternal: () => noop,
  modalProps: { open: false, url: "" }
});

export const RedirectNoticeProvider = ({ children }: { children: any }) => {
  const [modalProps, setModalProps] = useState({ open: false, url: "", onClose: noop });

  const goToExternal = (e: any, url: string) => {
    e.preventDefault();
    setModalProps({ open: true, url, onClose: closeModal });
  };

  const closeModal = () => {
    setModalProps({ open: false, url: "", onClose: noop });
  };

  return (
    <RedirectNoticeContext.Provider value={{ goToExternal, modalProps }}>{children}</RedirectNoticeContext.Provider>
  );
};

export const useRedirectNotice = () => {
  const context = useContext(RedirectNoticeContext);
  if (!context) {
    throw new Error("useRedirectNotice must be used within a RedirectNoticeProvider");
  }
  return context;
};
