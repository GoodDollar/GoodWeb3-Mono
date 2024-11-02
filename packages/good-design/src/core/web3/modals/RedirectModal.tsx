import React from "react";

import BasicStyledModal, { ModalFooterCtaX } from "./BasicStyledModal";
import { TransText } from "../../layout";

interface RedirectModalProps {
  open: boolean;
  url: string;
  onClose: () => void;
}

const redirectCopy =
  /*i18n*/ "By accessing this link you are leaving \n gooddapp.org and are being redirected to a \n third-party, independent website.";

export const RedirectModal = ({ open, url, onClose, ...props }: RedirectModalProps) => (
  <BasicStyledModal
    {...props}
    type="ctaX"
    show={open}
    onClose={onClose}
    title={/*i18n*/ "Redirect Notice"}
    body={<TransText t={redirectCopy} />}
    footer={<ModalFooterCtaX extUrl={url} buttonText={/*i18n*/ "Go to website"} />}
    withOverlay="dark"
    withCloseButton
  />
);
