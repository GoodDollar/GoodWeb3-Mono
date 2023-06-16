import React, { useEffect } from "react";
import { useColorModeValue } from "native-base";
import { useNotifications } from "@usedapp/core";
import { useModal } from "../../../hooks/useModal";
import { ActionHeader } from "../../layout";
import { LearnButton } from "../../buttons";

export interface SignTxProps {
  children?: any;
}

/**
 * A modal to wrap your component or page with and show a modal re-active to calls from usedapp's useContractFunction
 * it assumes you have already wrapped your app with the Web3Provider out of the @gooddollar/sdk-v2 package
 * @param children
 * @returns JSX.Element
 */
export const SignTxModal = ({ children }: SignTxProps) => {
  const { notifications } = useNotifications();
  const textColor = useColorModeValue("goodGrey.500", "white");

  const { Modal, showModal, hideModal } = useModal();

  useEffect(() => {
    if (notifications.length > 0 && notifications[0].type === "transactionPendingSignature") {
      showModal();
    } else {
      hideModal();
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
