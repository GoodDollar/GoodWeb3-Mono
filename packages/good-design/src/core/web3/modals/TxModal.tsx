import React, { FC } from "react";
import { noop } from "lodash";
import { TransactionStatus } from "@usedapp/core";
import { VStack } from "native-base";

import { TransText } from "../../layout";
import BasicStyledModal from "./BasicStyledModal";
import { LearnButton } from "../../buttons";

interface ITxModalProps {
  type: "send" | "sign" | "signMultiClaim" | "identity" | "goodid";
  isPending: boolean;
  customTitle?: { title: { id: string; values: any } };
  onClose?: () => void;
  title?: string;
  content?: string;
}

const txModalCopy = {
  sign: {
    title: /*i18n*/ "Please sign with \n your wallet",
    content:
      /*i18n*/ "To complete this action, sign with your wallet. It can take a moment for a transaction to be validated."
  },
  signMultiClaim: {
    title: "",
    content: /*i18n*/ "To complete this action, sign with your wallet."
  },
  goodid: {
    title: /*i18n*/ "Please sign with \n your wallet",
    content:
      /*i18n*/ "To complete this action, sign with your wallet. It can take a moment for a transaction to be validated."
  },
  identity: {
    title: /*i18n*/ "Sign to Verify Uniqueness",
    content:
      /*i18n*/ "You’ll be asked to sign with your wallet to begin the verification.You may have to do this again from time to time."
  },
  send: {
    title: /*i18n*/ "Waiting for \n confirmation",
    content: /*i18n*/ "Please wait for the transaction to be validated."
  }
};

const TxModalContent = ({ content }: { content: string }) => (
  <TransText t={content} variant="sm-grey-650" paddingLeft={2} paddingRight={2} />
);

const TxContentMultiClaim = ({ content }: { content: string }) => (
  <VStack space={2} paddingX={2}>
    <TransText t={content} variant="sm-grey-650" />
    <TransText
      t={/*i18n*/ "It may take over a minute for transaction(s) to be signed."}
      variant="sm-grey-650"
      fontWeight="bold"
    />
  </VStack>
);

const TxContentIdentity = ({ content }: { content: string }) => (
  <VStack space={2} paddingX={2}>
    <TransText
      t={/*i18n*/ "You’re almost there! To claim G$, you need prove you are a unique human."}
      variant="sm-grey-650"
      fontWeight="bold"
    />
    <TransText t={content} variant="sm-grey-650" />
  </VStack>
);

const ContentComponent = {
  sign: TxModalContent,
  signMultiClaim: TxContentMultiClaim,
  identity: TxContentIdentity,
  send: TxModalContent,
  goodid: TxModalContent
};

export const TxModal: FC<ITxModalProps> = ({
  isPending,
  onClose = noop,
  customTitle,
  type,
  ...props
}: ITxModalProps) => {
  const { title, content } = txModalCopy[type];
  const Content = ContentComponent[type];

  return (
    <BasicStyledModal
      {...props}
      type="learn"
      show={isPending}
      onClose={onClose}
      title={customTitle ?? title}
      body={<Content content={content} />}
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
