import { getValidTargetChains, getProviderSupportedPairs, isRouteSupportedByProvider } from "../utils";
import type { BridgeProvider } from "../types";

export const getDefaultTargetChain = (sourceChain: string): string => {
  if (sourceChain === "fuse") return "celo";
  if (sourceChain === "celo") return "mainnet";
  return "fuse";
};

export const handleSourceChainChange = (
  chain: string,
  bridgeProvider: BridgeProvider,
  bridgeFees: any,
  feesLoading: boolean,
  setSourceChain: (chain: string) => void,
  setTargetChain: (chain: string) => void,
  setBridgeAmount: (amount: string) => void,
  setToggleState: (fn: (prev: boolean) => boolean) => void,
  handleBridgeProviderChange: (provider: BridgeProvider) => void
) => {
  setBridgeAmount("0");
  setToggleState(prevState => !prevState);
  setSourceChain(chain);

  const validTargets = getValidTargetChains(chain, bridgeFees, bridgeProvider, feesLoading);
  if (validTargets.length > 0) {
    setTargetChain(validTargets[0]);
  } else {
    if (bridgeProvider === "axelar") {
      handleBridgeProviderChange("layerzero");
    }
    setTargetChain(getDefaultTargetChain(chain));
  }
};

export const handleProviderChange = (
  provider: BridgeProvider,
  sourceChain: string,
  targetChain: string,
  bridgeFees: any,
  feesLoading: boolean,
  setSourceChain: (chain: string) => void,
  setTargetChain: (chain: string) => void,
  onBridgeProviderChange?: (provider: BridgeProvider) => void,
  setLocalBridgeProvider?: (provider: BridgeProvider) => void
) => {
  if (onBridgeProviderChange) {
    onBridgeProviderChange(provider);
  } else if (setLocalBridgeProvider) {
    setLocalBridgeProvider(provider);
  }

  const routeSupported = isRouteSupportedByProvider(sourceChain, targetChain, provider);
  if (!routeSupported) {
    const pairs = getProviderSupportedPairs(provider);
    const preferred = pairs.find(([, dst]) => dst === (targetChain as any)) || pairs[0];
    if (preferred) {
      setSourceChain(preferred[0]);
      setTargetChain(preferred[1]);
    }
  } else {
    let validTargets = getValidTargetChains(sourceChain as any, bridgeFees, provider, feesLoading);
    if (validTargets.length === 0) {
      validTargets = getValidTargetChains(sourceChain as any, undefined as any, provider, true);
    }
    if (validTargets.length > 0) {
      const newTarget = validTargets.includes(targetChain as any) ? targetChain : validTargets[0];
      setTargetChain(newTarget);
    }
  }
};
