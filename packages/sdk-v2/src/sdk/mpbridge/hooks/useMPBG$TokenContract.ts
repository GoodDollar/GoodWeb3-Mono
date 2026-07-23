import { useMemo } from "react";
import { useEthers } from "@usedapp/core";
import { ethers } from "ethers";
import { IGoodDollar } from "@gooddollar/goodprotocol/types";
import Contracts from "@gooddollar/goodprotocol/releases/deployment.json";
import { useGetEnvChainId } from "../../base/react";
import { BRIDGE_CONSTANTS } from "../constants";
import { MPBBridgeReadOnlyUrls } from "../types";
import { useMPBBridgeReadOnlyProvider } from "./useMPBBridgeContracts";

export const useMPBG$TokenContract = (
  chainId?: number,
  readOnly = false,
  readOnlyUrls?: MPBBridgeReadOnlyUrls
): IGoodDollar | null => {
  const { library } = useEthers();
  const effectiveChainId = chainId ?? BRIDGE_CONSTANTS.DEFAULT_CHAIN_ID;
  const { defaultEnv } = useGetEnvChainId(effectiveChainId);
  const readOnlyProvider = useMPBBridgeReadOnlyProvider(effectiveChainId, readOnlyUrls);
  const tokenAddress = useMemo(() => {
    const deployment = Contracts[defaultEnv as keyof typeof Contracts] as { GoodDollar?: string } | undefined;

    return (
      deployment?.GoodDollar ||
      BRIDGE_CONSTANTS.GDOLLAR_ADDRESSES[effectiveChainId as keyof typeof BRIDGE_CONSTANTS.GDOLLAR_ADDRESSES] ||
      BRIDGE_CONSTANTS.PRODUCTION_GDOLLAR_ADDRESS
    );
  }, [defaultEnv, effectiveChainId]);

  return useMemo(() => {
    const provider = readOnly ? readOnlyProvider : library;
    if (!provider) return null;

    // The deployment map already identifies the bridge token for each SDK
    // environment. Using it removes a redundant nativeToken() RPC read while
    // preserving development and production configurations.
    const tokenABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function decimals() view returns (uint8)",
      "function transfer(address to, uint256 amount) returns (bool)",
      "function transferFrom(address from, address to, uint256 amount) returns (bool)"
    ];

    return new ethers.Contract(tokenAddress, tokenABI, provider) as IGoodDollar;
  }, [library, readOnly, readOnlyProvider, tokenAddress]);
};
