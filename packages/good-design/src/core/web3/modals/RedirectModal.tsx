import React from "react";

import BasicStyledModal from "./BasicStyledModal";

interface RedirectModalProps {
  open: boolean;
  url: string;
  onClose: () => void;
}

const RedirectCopy = `By accessing this link you are leaving
gooddapp.org and are being redirected to a 
third-party, independent website.`;

export const RedirectModal = ({ open, url, onClose }: RedirectModalProps) => (
  <BasicStyledModal
    type="ctaX"
    extUrl={url}
    show={open}
    onClose={onClose}
    title="Redirect Notice"
    content={RedirectCopy}
    withOverlay="dark"
    buttonText="Go to website"
    withCloseButton
  />
);
