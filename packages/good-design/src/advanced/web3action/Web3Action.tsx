import React, { useCallback, useEffect, useReducer } from "react";
import { noop } from "lodash";
import { BaseButton, BaseButtonProps } from "../../core/buttons";
import { useEthers } from "@usedapp/core";
import { HStack, Spinner, Heading } from "native-base";

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
        ...initialButtonState,
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

const initialButtonState = {
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
  const [state, dispatch] = useReducer(reducer, { ...initialButtonState, baseText: text });

  useEffect(() => {
    console.log("prov changed");
    if (account) {
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
    if (!account && handleConnect === noop) {
      try {
        await activateBrowserWallet();
      } catch (e: any) {
        if (e.code === 4001) {
          // rejected
          dispatch({ type: "reset", payload: { baseText: text } });
        }
        return e;
      }
    } else if (!account) {
      // dapp provided connect
      // note: not tested yet
      const dappConnected = await handleConnect(requiredChain);
    }
  }, [account, chainId, library]);

  const handleSwitch = useCallback(async () => {
    try {
      if (switchChain) {
        // note: not working properly yet
        // dispatch({ type: "reset", payload: { baseText: text } }); // reset isLoading here to prevent infinite rerender
        // const switched = await switchChain(requiredChain);
        // if (switched) {
        //   dispatch({ type: "reset", payload: { baseText: text } });
        // } else {
        //   console.log("(sdk) not switched");
        // }
      } else {
        await switchNetwork(requiredChain);
      }
      // dispatch({ type: "switched" });
    } catch (e: any) {
      console.log("e -->", { e });
      if (e.code === 4001) {
        dispatch({ type: "reset", payload: { baseText: text } });
      }
      return e;
    }
  }, [account, chainId, library]);

  const handleAction = useCallback(async () => {
    try {
      await web3Action();
      dispatch({ type: "reset", payload: { baseText: text } });
    } catch (e: any) {
      // doesn't catch rpc error
      console.log("action failed -- e -->", { e });
      dispatch({ type: "reset", payload: { baseText: text } });
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
      }
    }
  }, [state, handleDefaultConnect, handleSwitch, handleAction]);

  return (
    <BaseButton text={state.baseText} onPress={() => dispatch({ type: "isPressed", payload: state })}>
      {state.isPressed && state.isLoading && !state.baseText && <StepIndicator text={state.actionText} />}
    </BaseButton>
  );
};
