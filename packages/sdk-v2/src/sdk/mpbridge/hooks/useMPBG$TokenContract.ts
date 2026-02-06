import { useMemo, useEffect, useState } from "react";
import { useEthers } from "@usedapp/core";
import { ethers } from "ethers";
import { IGoodDollar } from "@gooddollar/goodprotocol/types";
import { useGetContract } from "../../base/react";
import { useReadOnlyProvider } from "../../../hooks";
import { BRIDGE_CONSTANTS } from "../constants";

export const useMPBG$TokenContract = (chainId?: number, readOnly = false): IGoodDollar | null => {
  const { library } = useEthers();
  const effectiveChainId = chainId ?? BRIDGE_CONSTANTS.DEFAULT_CHAIN_ID;
  const bridgeContract = useGetContract("MPBBridge", readOnly, "base", effectiveChainId);
  const readOnlyProvider = useReadOnlyProvider(effectiveChainId);
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!bridgeContract) {
      setTokenAddress(BRIDGE_CONSTANTS.PRODUCTION_GDOLLAR_ADDRESS);
      return;
    }

    if (typeof bridgeContract.nativeToken !== "function") {
      setTokenAddress(BRIDGE_CONSTANTS.PRODUCTION_GDOLLAR_ADDRESS);
      return;
    }

    bridgeContract
      .nativeToken()
      .then((address: string) => {
        if (isMounted) setTokenAddress(address);
      })
      .catch(() => {
        if (isMounted) setTokenAddress(BRIDGE_CONSTANTS.PRODUCTION_GDOLLAR_ADDRESS);
      });

    return () => {
      isMounted = false;
    };
  }, [bridgeContract]);

  return useMemo(() => {
    if (!tokenAddress) return null;
    const provider = readOnly ? readOnlyProvider : library;
    if (!provider) return null;

    const tokenABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function decimals() view returns (uint8)",
      "function transfer(address to, uint256 amount) returns (bool)",
      "function transferFrom(address from, address to, uint256 amount) returns (bool)"
    ];

    return new ethers.Contract(tokenAddress, tokenABI, provider) as IGoodDollar;
  }, [tokenAddress, library, readOnly, readOnlyProvider]);
};
