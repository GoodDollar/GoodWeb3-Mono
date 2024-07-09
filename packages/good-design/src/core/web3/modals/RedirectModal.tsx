import React from "react";

import { Text } from "native-base";
import BasicStyledModal, { ModalFooterCtaX } from "./BasicStyledModal";
import withTranslations from "../../../theme/hoc/withMultiTranslations";

interface RedirectModalProps {
  open: boolean;
  url: string;
  buttonText: string;
  content: string;
  redirectCopy: string;
  onClose: () => void;
}

const redirectCopy =
  /*i18n*/ "By accessing this link you are leaving \n gooddapp.org and are being redirected to a \n third-party, independent website.";

export const RedirectModal = ({ open, url, buttonText, content, onClose, ...props }: RedirectModalProps) => (
  <BasicStyledModal
    {...props}
    type="ctaX"
    show={open}
    onClose={onClose}
    title="Redirect Notice"
    body={<Text variant="sm-grey-650">{content}</Text>}
    footer={<ModalFooterCtaX extUrl={url} buttonText={buttonText} />}
    withOverlay="dark"
    withCloseButton
  />
);

export const RedirectModalComponent = (props: any) => {
  const translationId = { buttonText: /*i18n*/ "Go to website", redirectCopy };
  const ModalWithTranslations = withTranslations(RedirectModal, translationId);

  return <ModalWithTranslations {...props} />;
};
