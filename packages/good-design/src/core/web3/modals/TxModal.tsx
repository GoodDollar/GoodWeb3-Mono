import React from "react";
import { noop } from "lodash";
import { TransactionStatus } from "@usedapp/core";

import { TransText } from "../../layout";
import BasicStyledModal from "./BasicStyledModal";
import { LearnButton } from "../../buttons";

interface ITxModalProps {
  type: "send" | "sign" | "identity";
  isPending: boolean;
  customTitle?: { title: { id: string; values: any } };
  onClose?: () => void;
  title?: string;
  content?: string;
}

const txModalCopy = {
  sign: {
    title: /*i18n*/ "Please sign with \n your wallet",
    content: /*i18n*/ "To complete this action, sign with your wallet."
  },
  identity: {
    title: /*i18n*/ "Please sign with \n your wallet",
    content:
      /*i18n*/ "We need to know you’re you! Please sign\nwith your wallet to verify your identity.\n Don’t worry, no link is kept between your\nidentity record and your wallet address."
  },
  send: {
    title: /*i18n*/ "Waiting for \n confirmation",
    content: /*i18n*/ "Please wait for the transaction to be validated."
  }
};

const TxModalContent = ({ content }: { content: string }) => <TransText t={content} variant="sm-grey-650" />;

export const TxModal: React.FC<ITxModalProps> = ({
  isPending,
  onClose = noop,
  customTitle,
  type,
  ...props
}: ITxModalProps) => {
  const { title, content } = txModalCopy[type];
  return (
    <BasicStyledModal
      {...props}
      type="learn"
      show={isPending}
      onClose={onClose}
      title={customTitle ?? title}
      body={<TxModalContent content={content} />}
      footer={<LearnButton type={type} />}
      withOverlay="dark"
      withCloseButton={false}
    />
  );
};

export const TxModalStatus = ({
  txStatus,
  onClose
}: {
  txStatus: TransactionStatus | Partial<TransactionStatus>;
  onClose: () => void;
}) => {
  const { status } = txStatus;

  //todo: add onSuccess handler

  return status === "PendingSignature" || status === "CollectingSignaturePool" ? (
    <TxModal type="sign" isPending={status === "PendingSignature" || status === "CollectingSignaturePool"} />
  ) : status === "Mining" ? (
    <TxModal type="send" isPending={status === "Mining"} onClose={onClose} />
  ) : null;
};
