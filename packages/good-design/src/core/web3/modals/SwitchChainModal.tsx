import React, { FC, Fragment, PropsWithChildren, useEffect, useState } from "react";
import { useConfig } from "@usedapp/core";
import { useSwitchNetwork } from "@gooddollar/web3sdk-v2";
import { Text } from "native-base";

import BasicStyledModal from "./BasicStyledModal";
import { LearnButton } from "../../buttons";

const SwitchChainBody = ({ networkName }: { networkName: string | undefined }) => (
  <Text>To complete this action, switch to {networkName} in your wallet.</Text>
);

/**
 * A modal to wrap your component or page with and show a modal re-active to switchChain requests
 * it assumes you have already wrapped your app with the Web3Provider out of the @gooddollar/sdk-v2 package
 * @param {boolean} switching indicating if there is a pending switch request triggered
 * @param children
 * @returns JSX.Element
 */
export const SwitchChainModal: FC<PropsWithChildren> = ({ children, ...props }) => {
  const config = useConfig();
  const [requestedChain, setRequestedChain] = useState(0);
  const { setOnSwitchNetwork } = useSwitchNetwork();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (setOnSwitchNetwork) {
      setOnSwitchNetwork(() => async (chainId: number, afterSwitch: any) => {
        if (afterSwitch) {
          setShow(false);
        } else {
          setRequestedChain(chainId);
          setShow(true);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setOnSwitchNetwork, setShow]);

  const { chainName: networkName } = config.networks?.find(({ chainId }) => chainId === requestedChain) ?? {};

  return (
    <Fragment>
      <BasicStyledModal
        {...props}
        title="Action Required"
        body={<SwitchChainBody networkName={networkName} />}
        show={show}
        onClose={() => setShow(false)}
        type="learn"
        footer={<LearnButton type={"network"} />}
        withCloseButton
      />
      {children}
    </Fragment>
  );
};
