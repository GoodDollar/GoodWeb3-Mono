import React, { useCallback, useEffect, useRef } from "react";
import { HStack, Spinner, Heading } from "native-base";
import { useEthers } from "@gooddollar/web3sdk-v2";
import { isBoolean } from 'lodash'
import { BaseButton, BaseButtonProps } from "../../core/buttons";

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

const ButtonSteps = {
  connect: "Connecting wallet...",
  switch: "Switching network...",
  action: "Awaiting confirmation..."
};

const wrapChainCall =async asyncFn => {
  try {
    const result = await asyncFn()

    return isBoolean(result) ? result : true
  } catch (e) {
    if (e.code === 4001) {
      return false
    }

    throw e
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
  handleConnect,
}: Web3ActionProps): JSX.Element => {
  const { isWeb3, account, switchNetwork, chainId, activateBrowserWallet } = useEthers();
  const [loading, setLoading] = useState(false)
  const [actionText, setActionText] = useState("")
  const chainRef = useRef(chainId)

  const connectToChain = useCallback(chain => wrapChainCall(async () => {
    if (handleConnect) {
      await handleConnect(chain)
      return
    }

    await activateBrowserWallet()
  }), [handleConnect, activateBrowserWallet])

  const switchToChain = useCallback(async chain => {
    const switchFn = switchChain || switchNetwork
    const isDefaultFn = !switchChain

    return wrapChainCall(async () => {
      const result = await switchFn(chain)

      if (!isDefaultFn && !result) {
        return false
      }
    })
  }, [switchNetwork, switchChain])

  const handleAction = useCallback(async () => {
    let cancelled = false
    let timeout

    const reset = () => {
      cancelled = true
      setActionText("")
      setLoading(false)
      clearTimeout(timeout)
    }

    timeout = setTimeout(reset, 60000)
    setLoading(true)

    if (!account) {
      setActionText(ButtonSteps.connect)

      const connected = await connectToChain(requiredChain)

      if (!connected || cancelled) {
        reset()
        return
      }
    }

    // handleConnect accepts chain id so it could connect to the target chain
    // for this case we need to handle chainId changes in the separate effect
    // then read latest value from the ref here once we've awaited for connected
    if (chainRef.current !== requiredChain) {
      setActionText(ButtonSteps.switch)

      const switched = await switchNetwork(requiredChain)

      if (!switched || cancelled) {
        reset()
        return
      }
    }

    setActionText(ButtonSteps.action)

    try {
      await web3Action()
    } finally {
      reset()
    }
  }, [account, requiredChain, connectToChain, switchChain, web3Action])

  useEffect(() => {
    chainRef.current = chainId
  }, [chainId])

  if (!isWeb3) {
    return null
  }

  return (
    <BaseButton text={loading ? "" : text} onPress={handleAction}>
      {loading && <StepIndicator text={actionText} />}
    </BaseButton>
  );
};
