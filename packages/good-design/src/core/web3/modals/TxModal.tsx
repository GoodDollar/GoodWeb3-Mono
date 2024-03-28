import React from "react";
import { noop } from "lodash";

import { withTheme } from "../../../theme";
import BasicStyledModal, { ModalFooterLearn } from "./BasicStyledModal";

interface ITxModalProps {
  type: "send" | "sign" | "identity";
  isPending: boolean;
  onClose?: () => void;
}

const txModalCopy = {
  sign: {
    title: "Please sign with \n your wallet",
    content: "To complete this action, sign with your wallet."
  },
  identity: {
    title: "Please sign with \n your wallet",
    content: `We need to know youre you! Please sign\nwith your wallet to verify your identity.\n 
Don’t worry, no link is kept between your\nidentity record and your wallet address.`
  },
  send: {
    title: "Waiting for \n confirmation",
    content: "Please wait for the transaction to be validated."
  }
};

export const TxModal = withTheme({ name: "BasicStyledModal" })(
  ({ type, isPending, onClose = noop, ...props }: ITxModalProps) => {
    const { title, content } = txModalCopy[type];

    return (
      <BasicStyledModal
        {...props}
        type="learn"
        show={isPending}
        onClose={onClose}
        title={title}
        content={content}
        footer={<ModalFooterLearn source={type} />}
        withOverlay="dark"
        withCloseButton
      />
    );
  }
);
