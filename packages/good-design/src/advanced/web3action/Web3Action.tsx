import React, { useCallback, useEffect, useRef, useState } from "react";
import { HStack, Spinner, Heading } from "native-base";
import { useEthers } from "@gooddollar/web3sdk-v2";
import { isBoolean } from "lodash";
import { BaseButton, BaseButtonProps } from "../../core/buttons";

export interface Web3ActionProps extends BaseButtonProps {
  /**
   * a text to be rendered in the component.
   */
  text: string;
  requiredChain: number;
  web3Action: () => Promise<void> | void;
  switchChain?: (requiredChain: number) => Promise<any>;
  handleConnect?: () => Promise<any> | void;
}

const ButtonSteps = {
  connect: "Connecting wallet...",
  switch: "Switching network...",
  action: "Awaiting confirmation..."
};

const wrapCancelled = async asyncFn => {
  try {
    await asyncFn();
  } catch (e) {
    if (e.code !== 4001) {
      throw e
    }
  }
}

const StepIndicator = ({ text }: { text?: string | undefined }) => {
  return (
    <HStack space={2} alignItems="center" flexDirection={"row"}>
      <Spinner accessibilityLabel="Waiting on wallet confirmation" />
      <Heading color="primary.500" fontSize="md">
        {text}
      </Heading>
    </HStack>
  );
};

export const Web3ActionButton = ({
  text,
  requiredChain,
  switchChain,
  web3Action,
  handleConnect
}: Web3ActionProps): JSX.Element => {
  const { isWeb3, account, switchNetwork, chainId, activateBrowserWallet } = useEthers();
  const [loading, setLoading] = useState(false);
  const [actionText, setActionText] = useState("");
  const timerRef = useRef()

  const resetFlow = useCallback(() => {
    setLoading(false);
    setActionText("");

    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, []);

  const startFlow = useCallback(() => {
    if (loading) {
      return
    }

    setLoading(true)
    timerRef.current = setTimeout(resetFlow, 60000)
  }, [loading])

  const connectWallet = useCallback(
    async () => {
      const connectFn = handleConnect || activateBrowserWallet;

      return wrapCancelled(connectFn)
    },
    [handleConnect, activateBrowserWallet]
  );

  const switchToChain = useCallback(
    async (chain: number) => {
      const switchFn = switchChain || switchNetwork;

      return wrapCancelled(() => switchFn(chain))
    },
    [switchNetwork, switchChain]
  );

  // while button is in loading state (1 min), be reactive to external/manual
  // account/chainId changes and re-try to perform current step action
  useEffect(() => {
    const continueSteps = async () => {
      if (!account || !isWeb3) {
        setActionText(ButtonSteps.connect)
        await connectWallet();
        return
      }

      if (requiredChain !== chainId) {
        setActionText(ButtonSteps.switch)
        await switchToChain(requiredChain)
        return
      }

      setActionText(ButtonSteps.action)
      await web3Action();
      resetFlow();
    }

    if (loading) {
      continueSteps().catch(resetFlow)
    }
  }, [loading, account, isWeb3, chainId]);

  return (
    <BaseButton text={loading ? "" : text} onPress={startFlow}>
      {loading && <StepIndicator text={actionText} />}
    </BaseButton>
  );
};
