import React, { useCallback, useEffect, useReducer } from "react";
import { noop } from "lodash";
import { BaseButton, BaseButtonProps } from "../../core/buttons";
import { useEthers } from "@usedapp/core";
import { HStack, Spinner, Heading } from "native-base";
import { ethers } from "ethers";

export interface Web3ActionProps extends BaseButtonProps {
  /**
   * a text to be rendered in the component.
   */
  text: string;
  requiredChain: number;
  web3Action: () => Promise<void> | void;
  switchChain?: (requiredChain: number) => Promise<any>;
  handleConnect?: (requiredChain: number) => Promise<any> | void;
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

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case "init":
      return {
        ...buttonState,
        ...action.payload
      };
    case "isPressed":
      return {
        ...state,
        isPressed: true,
        isLoading: true,
        baseText: ""
      };
    case "reset": // reset used while isPressed is within its 1 minute polling window
      return {
        ...state,
        ...action.payload,
        isLoading: !state.isLoading
      };
    default:
      return {
        ...state,
        ...action.payload,
        action: action.type
      };
  }
};

const ButtonCopy = {
  connect: "Connecting wallet...",
  switch: "Switching network...",
  action: "Awaiting confirmation..."
};

const buttonState = {
  action: "connect",
  actionText: ButtonCopy.connect,
  isPressed: false,
  isLoading: false,
  baseText: ""
};

export const Web3ActionButton = ({
  text,
  requiredChain,
  switchChain,
  web3Action,
  handleConnect = noop
}: Web3ActionProps): JSX.Element => {
  const { account, switchNetwork, chainId, activateBrowserWallet, library } = useEthers();
  const initialButtonState = { ...buttonState, baseText: text };
  const [state, dispatch] = useReducer(reducer, { ...initialButtonState });
  const reset = (isLoading = false, baseText = text) => ({
    type: "reset",
    payload: { isLoading: isLoading, baseText: baseText }
  });

  useEffect(() => {
    const isWeb3 = library instanceof ethers.providers.Web3Provider;
    if (account && isWeb3) {
      const isRequiredChain = requiredChain === chainId;
      dispatch({
        type: isRequiredChain ? "action" : "switch",
        payload: { actionText: isRequiredChain ? ButtonCopy.action : ButtonCopy.switch, isLoading: true }
      });
    } else {
      dispatch({ type: "init", payload: { baseText: text, isLoading: true } });
    }
  }, [account, chainId]);

  const handleDefaultConnect = useCallback(async () => {
    try {
      if (!account && handleConnect === noop) {
        await activateBrowserWallet();
      } else {
        await handleConnect(requiredChain);
      }
    } catch (e: any) {
      if (e.code === 4001) {
        // rejected
        dispatch(reset());
      }
      return e;
    }
  }, [account, chainId, library]);

  const handleSwitch = useCallback(async () => {
    try {
      if (switchChain) {
        const switched = await switchChain(requiredChain);
        if (!switched) {
          dispatch(reset());
        }
      } else {
        await switchNetwork(requiredChain);
      }
    } catch (e: any) {
      console.log("e -->", { e });
      if (e.code === 4001) {
        dispatch(reset());
      }
      return e;
    }
  }, [account, chainId, library]);

  const handleAction = useCallback(async () => {
    try {
      await web3Action();
    } catch (e: any) {
      // doesn't catch rpc error
      console.log("action failed -- e -->", { e });
    } finally {
      dispatch(reset());
    }
  }, [account, chainId, library, web3Action]);

  useEffect(() => {
    //todo: add isPressed interval/timeout for 1 minute
    if (state.isPressed && state.isLoading) {
      switch (state.action) {
        case "connect":
          handleDefaultConnect();
          break;
        case "switch":
          handleSwitch();
          break;
        case "action":
          handleAction();
          break;
      }
    }
  }, [state]);

  return (
    <BaseButton text={state.baseText} onPress={() => dispatch({ type: "isPressed", payload: state })}>
      {state.isPressed && state.isLoading && !state.baseText && <StepIndicator text={state.actionText} />}
    </BaseButton>
  );
};
