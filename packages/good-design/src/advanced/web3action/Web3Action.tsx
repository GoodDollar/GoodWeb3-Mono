import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { ITextProps } from "native-base";
import { useEthers } from "@usedapp/core";
import { StyleSheet, ViewStyle } from "react-native";
import { noop } from "lodash";

import BaseButton, { BaseButtonProps } from "../../core/buttons/BaseButton";
import { withTheme } from "../../theme/hoc/withTheme";

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
  connect: /*i18n*/ "Connecting wallet...",
  switch: /*i18n*/ "Switching network...",
  action: /*i18n*/ "Sign transaction..."
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
// styles overwrite due to conflicts with tailwind conflicting with native-base styles
const styles = StyleSheet.create({
  baseButton: {
    backgroundColor: "#7A88A5", // goodGrey.400
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#00AEFF", // borderBlue
    height: 43,
    paddingHorizontal: 16,
    textAlign: "center"
  },
  roundButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingHorizontal: 10,
    borderRadius: 120,
    backgroundColor: "#00AEFF", // main
    width: 175,
    textAlign: "center"
  },
  mobileButton: {
    backgroundColor: "#00AFFF", // gdPrimary
    width: "100%",
    maxWidth: "none",
    height: 75,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    paddingVertical: 17,
    paddingTop: 20,
    transitionProperty: "background",
    transitionDuration: "0.25s"
  },
  outlinedButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#00AEFF", // borderBlue
    height: 43,
    padding: "12px 16px",
    transitionProperty: "background",
    transitionDuration: "0.25s"
  },
  baseInnerText: {
    fontSize: 30, // xl
    fontWeight: "bold",
    color: "white"
  },
  roundInnerText: {
    fontFamily: "Montserrat",
    fontSize: 24, // l
    width: 175,
    lineHeight: 26.4,
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1
  },
  mobileInnerText: {
    fontSize: 20, // md
    fontFamily: "Roboto",
    lineHeight: 25
  },
  outlinedInnerText: {
    color: "#00AFFF", // gdPrimary
    fontSize: 16, // sm
    fontFamily: "Roboto",
    lineHeight: 19
  },
  interactionStyles: {
    backgroundColor: "#0075AC", // primaryHoverDark
    transition: "background 0.25s"
  }
});

export const Web3ActionButton: FC<Web3ActionProps> = withTheme({
  name: "Web3ActionButton",
  skipProps: "supportedChains"
})(({ text, supportedChains, switchChain, web3Action, handleConnect, onEvent = noop, ...buttonProps }) => {
  const { account, switchNetwork, chainId, activateBrowserWallet } = useEthers();
  const [runningFlow, setRunningFlow] = useState(false);
  const [actionText, setActionText] = useState<string | undefined>(undefined);
  const timerRef = useRef<any>(null);

  const resetText = useCallback(() => setActionText(undefined), []);

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

  // Mapping for button styles based on variant
  const buttonStylesMap = {
    round: styles.roundButton,
    mobile: styles.mobileButton,
    outlined: styles.outlinedButton,
    default: styles.baseButton
  };

  // Mapping for text styles based on variant
  const textStylesMap = {
    round: styles.roundInnerText,
    mobile: styles.mobileInnerText,
    outlined: styles.outlinedInnerText,
    default: styles.baseInnerText
  };

  const getStyle = (type: "button" | "text") => {
    const variant = buttonProps.variant as keyof typeof buttonStylesMap;
    const map = type === "button" ? buttonStylesMap : textStylesMap;
    return (map[variant] as ViewStyle) || map.default;
  };

  return (
    <BaseButton
      text={actionText ?? text}
      onPress={startFlow}
      style={getStyle("button")}
      {...(runningFlow
        ? {
            _focus: { style: { ...styles.interactionStyles } },
            _hover: { style: { ...styles.interactionStyles } }
          }
        : {})}
      {...buttonProps}
    ></BaseButton>
  );
});
