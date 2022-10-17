import React, { useCallback, useEffect, useState } from "react";
import { noop } from "lodash";
import { BaseButton, BaseButtonProps } from "../../core/buttons";
import { useEthers, useNetwork } from "@usedapp/core";
import { HStack, Spinner, Heading } from "native-base";

export interface Web3ActionProps extends BaseButtonProps {
  /**
   * a text to be rendered in the component.
   */
  text: string;
  requiredChain: number;
  web3Action: () => Promise<void> | void;
  switchChain?: () => Promise<any>;
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

export const Web3ActionButton = ({
  text,
  requiredChain,
  switchChain,
  web3Action,
  handleConnect = noop
}: Web3ActionProps): JSX.Element => {
  const _ = require("lodash");
  // todo: add check on account between RO provider address / actual connected account
  const { account, switchNetwork, chainId, library, activateBrowserWallet } = useEthers();
  const { network } = useNetwork();
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionText, setActionText] = useState<string | undefined>();
  const [baseText, setBaseText] = useState<string | undefined>(text);

  const buttonSequence = [0, 1, 2];
  const [steps, setSteps] = useState(_(buttonSequence));

  useEffect(() => {
    setBaseText(text);
  }, [text]);

  useEffect(() => {
    if (isPressed) {
      // todo: clear timeout function
      setTimeout(() => {
        setIsPressed(false);
        setBaseText(text);
        setSteps(_(buttonSequence));
      }, 60000);
    }
  }, [account, chainId, library, isPressed, network]);

  const onPress = useCallback(async () => {
    setIsPressed(true);
    setBaseText(undefined);
    continueSequence();
  }, [account, chainId, library, steps]);

  const resetButton = () => {
    setIsLoading(false);
    setBaseText(text);
  };

  const handleDefaultConnect = useCallback(async () => {
    if (!account && handleConnect === noop) {
      try {
        await activateBrowserWallet();
        steps.next();
        setIsLoading(false);
      } catch (e: any) {
        if (e.code === 4001) {
          // rejected
          resetButton();
        }
        return e;
      }
    } else if (!account) {
      // dapp provided connect
      const dappConnected = await handleConnect(requiredChain);
    } else {
      steps.next();
      setIsLoading(false);
    }
  }, [account, chainId, library]);

  const handleSwitch = useCallback(async () => {
    if (requiredChain === chainId) {
      steps.next();
      setIsLoading(false);
    } else {
      try {
        // todo: add dapp provided switch
        await switchNetwork(requiredChain);
        steps.next();
        setIsLoading(false);
      } catch (e: any) {
        console.log("e -->", { e });
        if (e.code === 4001) {
          resetButton();
        }
        return e;
      }
    }
  }, [chainId, library]);

  const handleAction = useCallback(async () => {
    try {
      await web3Action();
    } catch (e: any) {
      console.log("action failed -- e -->", { e });
    }
  }, [account, chainId, library]);

  useEffect(() => {
    if (!isLoading) {
      setIsLoading(true);
      if (!account) {
        setSteps(_(buttonSequence));
      } else if (steps.__index__ || steps.__index__ === 0) {
        switch (steps.__index__) {
          case 0:
            steps.next();
            if (requiredChain === chainId) {
              steps.next();
            }
            break;
          case 1:
            if (requiredChain === chainId) {
              steps.next();
            }
            break;
        }
      }
      setIsLoading(false);
    }

    if (isPressed && !isLoading) {
      continueSequence();
    }
  }, [account, chainId, library, handleAction]);

  const continueSequence = useCallback(async () => {
    setIsLoading(true);
    const currentStep = steps.__index__;
    switch (currentStep) {
      case 0:
        if (!account) {
          setActionText("Connecting wallet...");
        } else {
          steps.next();
          break;
        }
        const isNotConnected = await handleDefaultConnect();
        if (isNotConnected) {
          setSteps(_(buttonSequence));
        }
        break;
      case 1:
        setActionText("Switching network...");
        await handleSwitch();
        break;
      case 2:
        setActionText("awaiting confirmation");
        await handleAction();
        resetButton();
        setSteps(_(buttonSequence));
        break;
      default:
        setSteps(_(buttonSequence));
        break;
    }
  }, [account, chainId, steps]);

  return (
    <BaseButton text={baseText} onPress={onPress}>
      {isPressed && isLoading && !baseText && <StepIndicator text={actionText} />}
    </BaseButton>
  );
};
