import { useMemo } from "react";
import { ethers } from "ethers";
import Contracts from "@gooddollar/goodprotocol/releases/deployment.json";
import { useReadOnlyProvider } from "../../../hooks/useMulticallAtChain";
import { CONTRACT_TO_ABI } from "../../base/sdk";
import { useGetEnvChainId } from "../../base/react";
import { BRIDGE_CONSTANTS } from "../constants";
import { MPBBridgeReadOnlyUrls } from "../types";

const TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

/**
 * Uses an MPB-specific URL when supplied and otherwise keeps the SDK's existing
 * read-only provider behavior. StaticJsonRpcProvider avoids an extra network
 * detection request because the chain id is already known.
 */
export const useMPBBridgeReadOnlyProvider = (chainId: number, readOnlyUrls?: MPBBridgeReadOnlyUrls) => {
  const fallbackProvider = useReadOnlyProvider(chainId);
  const overrideUrl = readOnlyUrls?.[chainId];

  const overrideProvider = useMemo(() => {
    if (!overrideUrl) {
      return;
    }

    return new ethers.providers.StaticJsonRpcProvider(overrideUrl, chainId);
  }, [chainId, overrideUrl]);

  // Keep the explicit bridge provider stable even if the app-level usedapp
  // configuration is recreated by a parent render.
  return overrideProvider || fallbackProvider;
};

/**
 * Creates the two read-only contracts needed by MPB Bridge. These instances are
 * intentionally separate from the signer-connected contracts used to submit
 * approval and bridge transactions.
 */
export const useMPBBridgeContracts = (chainId: number, readOnlyUrls?: MPBBridgeReadOnlyUrls) => {
  const { defaultEnv } = useGetEnvChainId(chainId);
  const provider = useMPBBridgeReadOnlyProvider(chainId, readOnlyUrls);
  const deployment = useMemo(
    () => Contracts[defaultEnv as keyof typeof Contracts] as { MpbBridge?: string; GoodDollar?: string } | undefined,
    [defaultEnv]
  );

  const bridgeContract = useMemo(() => {
    if (!provider || !deployment?.MpbBridge) {
      return null;
    }

    return new ethers.Contract(deployment.MpbBridge, CONTRACT_TO_ABI.MpbBridge.abi, provider);
  }, [deployment, provider]);

  const tokenContract = useMemo(() => {
    const tokenAddress =
      deployment?.GoodDollar ||
      BRIDGE_CONSTANTS.GDOLLAR_ADDRESSES[chainId as keyof typeof BRIDGE_CONSTANTS.GDOLLAR_ADDRESSES];

    if (!provider || !tokenAddress) {
      return null;
    }

    return new ethers.Contract(tokenAddress, TOKEN_ABI, provider);
  }, [chainId, deployment?.GoodDollar, provider]);

  return { provider, bridgeContract, tokenContract };
};
