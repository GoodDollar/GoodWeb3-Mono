import React from "react";

import { Text } from "native-base";
import BasicStyledModal, { ModalFooterCtaX } from "./BasicStyledModal";

interface RedirectModalProps {
  open: boolean;
  url: string;
  onClose: () => void;
}

const RedirectCopy = `By accessing this link you are leaving
gooddapp.org and are being redirected to a 
third-party, independent website.`;

export const RedirectModal = ({ open, url, onClose, ...props }: RedirectModalProps) => (
  <BasicStyledModal
    {...props}
    type="ctaX"
    show={open}
    onClose={onClose}
    title="Redirect Notice"
    body={<Text variant="sm-grey-650">{RedirectCopy}</Text>}
    footer={<ModalFooterCtaX extUrl={url} buttonText="Go to website" />}
    withOverlay="dark"
    withCloseButton
  />
);
