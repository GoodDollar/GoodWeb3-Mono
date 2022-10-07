import React, { useCallback, useEffect, useState } from "react";
import { noop } from "lodash";
import { BaseButton } from "../../core/buttons";
import { useEthers } from "@usedapp/core";
import { TransactionReceipt } from "@ethersproject/providers";

//This is just a draft

export interface Web3ActionProps {
  /**
   * a text to be rendered in the component.
   */
  text: string;
  requiredChain: number;
  doAction: () => Promise<TransactionReceipt | undefined>;
  switchChain?: () => Promise<any>;
  handleConnect?: (requiredChain: number) => Promise<any> | void;
}

export const Web3ActionButton = ({
  text,
  requiredChain,
  switchChain,
  doAction,
  handleConnect = noop
}: Web3ActionProps): JSX.Element => {
  const { account, switchNetwork, chainId, library, activateBrowserWallet } = useEthers();

  const [isPressed, setIsPressed] = useState<boolean>(false);
  const [actionText, setActionText] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isPressed) {
      setTimeout(() => {
        setIsPressed(false);
      }, 1000);
    }
  }, [account, chainId, library, isPressed]);

  const onPress = useCallback(async () => {
    setIsPressed(true);
    console.log("account/onConnect -->", { account, handleConnect });

    if (!account && !handleConnect) {
      console.log("no account . . .");
      console.log("library/account/chainId -->", { library, account, chainId });
      activateBrowserWallet();
    }

    if (chainId !== requiredChain) {
      await switchNetwork(requiredChain);
      return doAction();
    }
  }, [account, chainId]);

  return <BaseButton text={text} onPress={onPress} />;
};
