import React from "react";
import { noop } from "lodash";

import { withTheme } from "../../../theme";
import BasicStyledModal from "./BasicStyledModal";

interface ITxModalProps {
  type: "send" | "sign";
  isPending: boolean;
  onClose?: () => void;
}

const txModalCopy = {
  sign: {
    title: "Please sign with \n your wallet",
    content: "To complete this action, sign with your wallet."
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
        learnSource={type}
        show={isPending}
        onClose={onClose}
        title={title}
        content={content}
        withOverlay="dark"
        withCloseButton
      />
    );
  }
);
