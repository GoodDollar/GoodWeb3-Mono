import React, { useEffect } from "react";
import { Box, Heading, useColorModeValue, useToast, Text } from "native-base";
import { useNotifications } from "@usedapp/core";
import type { TransactionReceipt, TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { useModal } from "../../../hooks/useModal";
import { ActionHeader } from "../../layout";
import { LearnButton } from "../../buttons";

// usedapp type definitions without walletConnected
type NotificationPayload = { submittedAt: number } & (
  | { type: "transactionPendingSignature"; transactionName?: string; transactionRequest?: TransactionRequest }
  | { type: "transactionStarted"; transaction: TransactionResponse; transactionName?: string }
  | {
      type: "transactionSucceed";
      transaction: TransactionResponse;
      receipt: TransactionReceipt;
      transactionName?: string;
      originalTransaction?: TransactionResponse;
    }
  | {
      type: "transactionFailed";
      transaction: TransactionResponse;
      receipt: TransactionReceipt;
      transactionName?: string;
      originalTransaction?: TransactionResponse;
    }
);

export type Notification = { id: string } & NotificationPayload;

//todo: add proper (customizable) styles
const SimpleTxToast = ({ title, desc }: { title: string; desc: string }) => (
  <Box backgroundColor="main" px={2} py={2}>
    <Heading>{title}</Heading>
    <Text> txName: {desc} </Text>
  </Box>
);

export type SignTxProps = {
  children?: any;
} & ({ withToast: boolean; onSubmit?: never } | { withToast?: never; onSubmit: () => void });

/**
 * A modal to wrap your component or page with and show a modal re-active to a
 * pending signature for a usedapp useContractFunction call
 * it assumes you have already wrapped your app with the Web3Provider out of the @gooddollar/sdk-v2 package
 * @param children
 * @param withToast - if true, will show a simple toast
 * @param onSubmitted - if withToast false, provide a callback to handle what happens after tx is submitted
 * @returns JSX.Element
 */
export const SignTxModal = ({ children, withToast, onSubmit }: SignTxProps) => {
  const doWithToast = withToast;
  const { notifications } = useNotifications();
  const toast = useToast();
  const textColor = useColorModeValue("goodGrey.500", "white");

  const { Modal, showModal, hideModal } = useModal();

  useEffect(() => {
    const localNotif = notifications as Notification[];
    if (localNotif[0]?.type.includes("transaction")) {
      const { type, transactionName = "" } = localNotif[0];
      switch (type) {
        case "transactionPendingSignature":
          showModal();
          break;
        case "transactionStarted":
          hideModal();
          if (doWithToast) {
            toast.show({
              render: () => <SimpleTxToast title="Transaction submitted" desc={transactionName} />,
              placement: "top-right"
            });
          } else {
            onSubmit?.();
          }
          break;
        default:
          hideModal();
          break;
      }
    }
  }, [notifications]);

  return (
    <React.Fragment>
      <Modal
        header={<ActionHeader textColor={textColor} actionText={`continue in your wallet`} />}
        body={<LearnButton source="signing" />}
        closeText="x"
      />
      {children}
    </React.Fragment>
  );
};
