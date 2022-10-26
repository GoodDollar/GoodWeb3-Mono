import React, { useCallback, useEffect, useRef, useState } from "react";
import { HStack, Spinner, Heading } from "native-base";
import { useEthers } from "@gooddollar/web3sdk-v2";
import BaseButton, { BaseButtonProps } from "../../core/buttons/BaseButton";

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

const throwCancelled = (e: any) => {
  if (e.code === 4001) {
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
  const [runningFlow, setRunningFlow] = useState(false);
  const [actionText, setActionText] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetText = useCallback(() => setActionText(""), []);

  const finishFlow = useCallback(() => {
    resetText();
    setRunningFlow(false);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startFlow = useCallback(() => {
    setRunningFlow(true);
    timerRef.current = setTimeout(finishFlow, 60000);
  }, []);

  const connectWallet = useCallback(async () => {
    const connectFn = handleConnect || (activateBrowserWallet as any);

    return await connectFn().catch(throwCancelled);
  }, [handleConnect, activateBrowserWallet]);

  const switchToChain = useCallback(
    async (chain: number) => {
      const switchFn = switchChain || switchNetwork;
      const result = await switchFn(chain).catch(throwCancelled);

      if (switchChain && !result) {
        throw new Error("User cancelled");
      }
    },
    [switchNetwork, switchChain]
  );

  // while button is in loading state (1 min), be reactive to external/manual
  // account/chainId changes and re-try to perform current step action
  useEffect(() => {
    const continueSteps = async () => {
      if (!account || !isWeb3) {
        setActionText(ButtonSteps.connect);
        await connectWallet();
        return;
      }

      if (requiredChain !== chainId) {
        setActionText(ButtonSteps.switch);
        await switchToChain(requiredChain);
        return;
      }

      setActionText(ButtonSteps.action);
      await web3Action();
      finishFlow();
    };

    if (runningFlow) {
      continueSteps().catch(finishFlow);
    }
  }, [runningFlow, account, isWeb3, chainId]);

  return (
    <BaseButton text={actionText ? "" : text} onPress={startFlow}>
      {actionText && <StepIndicator text={actionText} />}
    </BaseButton>
  );
};
