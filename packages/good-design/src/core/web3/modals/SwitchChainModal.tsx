import { useColorModeValue } from "native-base";
import React, { useEffect, useState } from "react";
import { useConfig } from "@usedapp/core";
import { useSwitchNetwork } from "@gooddollar/web3sdk-v2";
import { find } from "lodash";
import { useModal } from "../../../hooks/useModal";
import { ActionHeader } from "../../layout";
import { LearnButton } from "../../buttons";

export interface SwitchChainProps {
  children?: any;
}

/**
 * A modal to wrap your component or page with and show a modal re-active to switchChain requests
 * it assumes you have already wrapped your app with the Web3Provider out of the @gooddollar/sdk-v2 package
 * @param children
 * @returns JSX.Element
 */
export const SwitchChainModal = ({ children }: SwitchChainProps) => {
  const config = useConfig();
  const [requestedChain, setRequestedChain] = useState(0);
  const { setOnSwitchNetwork } = useSwitchNetwork();
  const textColor = useColorModeValue("goodGrey.500", "white");

  const { Modal, showModal, hideModal } = useModal();

  useEffect(() => {
    if (setOnSwitchNetwork) {
      setOnSwitchNetwork(() => async (chainId: number, afterSwitch: any) => {
        if (afterSwitch) {
          hideModal();
        } else {
          setRequestedChain(chainId);
          showModal();
        }
      });
    }
  }, [setOnSwitchNetwork]);

  const networkName = find(config.networks, _ => _.chainId === requestedChain)?.chainName;

  return (
    <React.Fragment>
      <Modal
        header={<ActionHeader textColor={textColor} actionText={`switch to ${networkName} in your wallet`} />}
        body={<LearnButton source="network" />}
        closeText="x"
      />
      {children}
    </React.Fragment>
  );
};
