import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { HStack, Spinner, Text, ITextProps } from "native-base";
import { useEthers } from "@usedapp/core";
import BaseButton, { BaseButtonProps } from "../../core/buttons/BaseButton";
import { withTheme } from "../../theme/hoc/withTheme";
import { noop } from "lodash";

export interface Web3ActionProps extends Omit<BaseButtonProps, "onPress"> {
  /** list of supported chains, first in list will be used as default */
  supportedChains: number[];
  innerIndicatorText?: ITextProps;
  web3Action: () => Promise<void> | void;
  switchChain?: (requiredChain: number) => Promise<any>;
  handleConnect?: () => Promise<any> | void;
  /** callback to be used for receiving the events: start,finish,connect,switch,action
   *
   * 'connect/switch' will send suffixed 'start' and 'success'
   *
   * 'action' only has a suffixed '_start',
   * final 'finish' indicating action has been done
   */
  onEvent?: (event: string) => void;
}

const ButtonSteps = {
  connect: "Connecting wallet...",
  switch: "Switching network...",
  action: "Sign transaction..."
};

const throwIfCancelled = (e: any) => {
  if (e.code === 4001) {
    throw e;
  }
};

const throwCancelled = () => {
  const e = new Error("User cancelled");

  (e as any).code = 4001;
  throw e;
};

const StepIndicator: FC<{ text?: string } & ITextProps> = withTheme({ name: "StepIndicator" })(
  ({ text, color, fontSize }) => (
    <HStack space={2} alignItems="flex-start" flexDirection="row" padding="0">
      <Spinner color={color as string} size="sm" accessibilityLabel="Waiting on wallet confirmation" />
      <Text color={color} fontSize={fontSize} fontFamily="subheading" alignItems="flex-start" padding={0}>
        {text}
      </Text>
    </HStack>
  )
);

export const Web3ActionButton: FC<Web3ActionProps> = withTheme({
  name: "Web3ActionButton",
  skipProps: "supportedChains"
})(
  ({
    text,
    supportedChains,
    switchChain,
    web3Action,
    handleConnect,
    onEvent = noop,
    innerIndicatorText,
    ...buttonProps
  }) => {
    const { account, switchNetwork, chainId, activateBrowserWallet } = useEthers();
    const [runningFlow, setRunningFlow] = useState(false);
    const [actionText, setActionText] = useState("");
    const timerRef = useRef<any>(null);

    const resetText = useCallback(() => setActionText(""), []);

    const finishFlow = useCallback(() => {
      resetText();
      setRunningFlow(false);
      onEvent("finish");
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }, []);

    const startFlow = useCallback(() => {
      onEvent("start");
      setRunningFlow(true);
      timerRef.current = setTimeout(finishFlow, 60000);
    }, []);

    //todo-fix: flow breaks with local activateBrowserWallet (not async)
    const connectWallet = useCallback(async () => {
      const connectFn = handleConnect || (activateBrowserWallet as any);
      const isConnected = await connectFn().catch(throwIfCancelled);

      if (!isConnected) {
        throwCancelled();
      }

      return isConnected;
    }, [handleConnect, activateBrowserWallet]);

    const switchToChain = useCallback(
      async (chain: number) => {
        const switchFn = switchChain || switchNetwork;
        const result = await switchFn(chain).catch(throwIfCancelled);

        if (switchChain && !result) {
          throwCancelled();
        }
      },
      [switchNetwork, switchChain]
    );

    // while button is in loading state (1 min), be reactive to external/manual
    // account/chainId changes and re-try to perform current step action
    useEffect(() => {
      const continueSteps = async () => {
        if (!account) {
          onEvent("connect_start");
          setActionText(ButtonSteps.connect);
          await connectWallet();
          onEvent("connect_success");
          return;
        }

        if (!supportedChains.includes(chainId ?? 0)) {
          onEvent("switch_start");
          setActionText(ButtonSteps.switch);
          await switchToChain(supportedChains[0]);
          onEvent("switch_success");
          return;
        }

        onEvent("action_start");
        setActionText(ButtonSteps.action);
        await web3Action();
        finishFlow();
      };

      if (runningFlow) {
        continueSteps().catch(finishFlow);
      }
    }, [runningFlow, account, chainId]);

    return (
      <BaseButton text={actionText ? "" : text} onPress={startFlow} {...buttonProps}>
        {actionText ? <StepIndicator text={actionText} {...innerIndicatorText} /> : null}
      </BaseButton>
    );
  }
);
