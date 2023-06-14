import { useColorModeValue } from "native-base";
import React from "react";
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
  const textColor = useColorModeValue("goodGrey.500", "white");

  const {
    Modal
    //showModal,
    //hideModal
  } = useModal();

  // todo: add trigger to show modal on any useDapp contract function execution

  return (
    <React.Fragment>
      <Modal
        header={<ActionHeader textColor={textColor} actionText={`continue in your wallet.`} />}
        body={<LearnButton source="signing" />}
        closeText="x"
      />
      {children}
    </React.Fragment>
  );
};
