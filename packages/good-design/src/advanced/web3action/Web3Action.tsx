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

  const startFlow = useCallback(() => setLoading(true), [])

  const resetFlow = useCallback(() => {
    setLoading(false);
    setActionText("");
  }, []);

  const connectWallet = useCallback(
    () => async () => {
      if (handleConnect) {
        await handleConnect();
        return;
      }

      await activateBrowserWallet();
    },
    [handleConnect, activateBrowserWallet]
  );

  const switchToChain = useCallback(
    async (chain: number) => {
      const switchFn = switchChain || switchNetwork;
      const isDefaultFn = !switchChain;
      const result = await switchFn(chain);

      if (!isDefaultFn && !result) {
        throw new Error('Rejected by user')
      }
    },
    [switchNetwork, switchChain]
  );

  useEffect(() => {
    let activeTimer: number

    if (loading) {
      activeTimer = setTimeout(resetFlow, 60000);
    }

    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer);
      }
    }
  }, [loading]);

  // while button is in loading state (1 min), be reactive to external/manual
  // account/chainId changes and re-try to perform current step action
  useEffect(() => {
    const continueSteps = async () => {
      if (!account || !isWeb3) {
        await connectWallet();
        return
      }

      if (requiredChain !== chainId) {
        await switchToChain(requiredChain)
        return
      }

      await web3Action();
      resetFlow();
    }

    if (!loading) {
      return
    }

    continueSteps().catch(resetFlow)
  }, [loading, account, isWeb3, chainId]);


  return (
    <BaseButton text={loading ? "" : text} onPress={startFlow}>
      {loading && <StepIndicator text={actionText} />}
    </BaseButton>
  );
};
