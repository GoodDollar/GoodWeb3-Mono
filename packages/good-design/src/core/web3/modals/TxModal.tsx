import React from "react";
import { noop } from "lodash";
import { Text } from "native-base";
import { TransactionStatus } from "@usedapp/core";

import BasicStyledModal from "./BasicStyledModal";
import withTranslations from "../../../theme/hoc/withMultiTranslations";
import { linksNew } from "../../constants";
import { LearnButton } from "../../buttons";

interface ITxModalProps {
  type: "send" | "sign" | "identity";
  isPending: boolean;
  onClose?: () => void;
  title?: string;
  content?: string;
  label?: string;
  learnTitle?: string;
  icon?: any;
  link?: string;
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

const TxModalContent = ({ content }: { content: string }) => <Text variant="sm-grey-650">{content}</Text>;

const TxModal: React.FC<ITxModalProps> = ({
  isPending,
  onClose = noop,
  title = "",
  content = "",
  learnTitle = "",
  label,
  icon,
  link,
  ...props
}) => (
  <BasicStyledModal
    {...props}
    type="learn"
    show={isPending}
    onClose={onClose}
    title={title}
    body={<TxModalContent content={content} />}
    footer={
      <LearnButton
        {...{
          icon,
          label,
          learnTitle,
          link
        }}
      />
    }
    withOverlay="dark"
    withCloseButton
  />
);

export const TxModalComponent = (props: ITxModalProps) => {
  const { title, content } = txModalCopy[props.type];
  const { link, label, icon } = linksNew[props.type];

  const translationIds = { title, content, label, learnTitle: /*i18n*/ "Learn" };
  const TxModalWithTranslations = withTranslations(TxModal, translationIds, { icon, link });

  return <TxModalWithTranslations {...props} />;
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
