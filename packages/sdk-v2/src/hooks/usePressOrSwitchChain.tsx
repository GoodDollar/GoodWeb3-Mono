import React, { useCallback, useContext, useEffect, useState } from "react";
import { useEthers } from "@usedapp/core";
import { useSwitchNetwork, Web3Context } from "../contexts/Web3Context";

type Props = { chainId: number; onPress: Function };

export const usePressOrSwitchChain = (props: Props) => {
  const [trigger, setTrigger] = useState(false);
  const { chainId } = useEthers();
  const { switchNetwork } = useSwitchNetwork();

  const onPress = useCallback(async () => {
    if (props.chainId !== chainId && switchNetwork) {
      await switchNetwork(props.chainId);
      // console.log("switched network?");
      setTrigger(true);
    } else {
      props.onPress();
    }
  }, [chainId, props, switchNetwork]);

  useEffect(() => {
    if (trigger && chainId === props.chainId) {
      props.onPress();
      setTrigger(false);
    }
  }, [trigger, chainId, props]);

  return onPress;
};
