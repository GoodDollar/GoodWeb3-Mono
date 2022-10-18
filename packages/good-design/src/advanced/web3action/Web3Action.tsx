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

const wrapChainCall = async (asyncFn: any) => {
  try {
    const result = await asyncFn();

    return isBoolean(result) ? result : true;
  } catch (e: any) {
    if (e.code === 4001) {
      return false;
    }

    throw e;
  }
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
  const [activeTimer, setActiveTimer] = useState<any>(undefined);

  useEffect(() => {
    if (!activeTimer && loading) {
      const timer = setTimeout(() => {
        setActiveTimer(undefined);
        reset();
      }, 60000);
      setActiveTimer(timer);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // while button is in loading state (1 min), be reactive to external/manual
  // account/chainId changes and re-try to perform current step action
  useEffect(() => {
    if (activeTimer) {
      continueSteps();
    }
  }, [account, chainId]);

  const connectWallet = useCallback(
    () =>
      wrapChainCall(async () => {
        if (handleConnect) {
          await handleConnect();
          return;
        }

        await activateBrowserWallet();
      }),
    [handleConnect, activateBrowserWallet]
  );

  const switchToChain = useCallback(
    async (chain: number) => {
      const switchFn = switchChain || switchNetwork;
      const isDefaultFn = !switchChain;

      return wrapChainCall(async () => {
        const result = await switchFn(chain);

        if (!isDefaultFn && !result) {
          return false;
        }
      });
    },
    [switchNetwork, switchChain]
  );

  const reset = () => {
    setLoading(false);
    setActionText("");
  };

  const continueSteps = useCallback(async () => {
    let cancelled = false;
    let stepConfirmed: boolean = false;

    // if there is no account always connect
    // if there is an account but its not a web3provider it mostly indicates a read-only provider
    const currentStep = !account || !isWeb3 ? "connect" : requiredChain !== chainId ? "switch" : "action";

    setActionText(ButtonSteps[currentStep]);
    setLoading(true);
    switch (currentStep) {
      case "connect":
        stepConfirmed = await connectWallet();
        break;
      case "switch":
        stepConfirmed = await switchToChain(requiredChain);
        break;
      case "action":
        try {
          await web3Action();
        } finally {
          reset();
        }
        break;
    }

    if (!stepConfirmed || cancelled) {
      reset();
      return;
    }
  }, [account, chainId]);

  return (
    <BaseButton text={loading ? "" : text} onPress={continueSteps}>
      {loading && <StepIndicator text={actionText} />}
    </BaseButton>
  );
};
