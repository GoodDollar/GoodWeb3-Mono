import React from "react";
import { noop } from "lodash";

import BasicStyledModal, { ModalFooterLearn } from "./BasicStyledModal";
import { Text } from "native-base";

interface ITxModalProps {
  type: "send" | "sign" | "identity";
  isPending: boolean;
  customTitle?: { title: string; content: string };
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

const TxModalContent = ({ content }: { content: string }) => <Text variant="sm-grey">{content}</Text>;

export const TxModal = ({ type, isPending, onClose = noop, customTitle, ...props }: ITxModalProps) => {
  const { title, content } = customTitle ?? txModalCopy[type];

  return (
    <BasicStyledModal
      {...props}
      type="learn"
      show={isPending}
      onClose={onClose}
      title={title}
      body={<TxModalContent content={content} />}
      footer={<ModalFooterLearn source={type} />}
      withOverlay="dark"
      withCloseButton={false}
    />
  );
};
