import { useMemo, useEffect, useState } from "react";
import { useEthers } from "@usedapp/core";
import { ethers } from "ethers";
import { useGetContract, useGetEnvChainId } from "../../base/react";
import { useReadOnlyProvider } from "../../../hooks";
import { CONTRACT_TO_ABI } from "../../base/sdk";
import { IGoodDollar } from "@gooddollar/goodprotocol/types";
import { BRIDGE_CONSTANTS } from "../constants";
import { getMPBContractAddress } from "../types";
import { SupportedChains } from "../../constants";

export const getDeploymentName = (baseEnv: string, chainId: number): string => {
  if (chainId === SupportedChains.FUSE) return "fuse";
  if (chainId === SupportedChains.CELO) return "celo";
  if (chainId === SupportedChains.MAINNET) return "mainnet";
  return "mainnet";
};

export const useGetMPBContract = (chainId?: number, readOnly = false): ethers.Contract | null => {
  const effectiveChainId = chainId ?? BRIDGE_CONSTANTS.DEFAULT_CHAIN_ID;
  const sdkContract = useGetContract("MPBBridge", readOnly, "base", effectiveChainId);
  const { baseEnv } = useGetEnvChainId(effectiveChainId);
  const readOnlyProvider = useReadOnlyProvider(effectiveChainId);
  const { library } = useEthers();
  const mpbABI = CONTRACT_TO_ABI["MPBBridge"]?.abi ?? [];
  const deploymentName = getDeploymentName(baseEnv, effectiveChainId);
  const address = getMPBContractAddress(effectiveChainId, deploymentName);

  const fallbackContract = useMemo(() => {
    if (sdkContract) return null;
    const provider = readOnly ? readOnlyProvider : library;
    if (!provider || !address) return null;
    return new ethers.Contract(address, mpbABI, provider);
  }, [sdkContract, readOnly, readOnlyProvider, library, address, mpbABI]);

  return sdkContract ?? fallbackContract ?? null;
};

export const useMPBG$TokenContract = (chainId?: number, readOnly = false): IGoodDollar | null => {
  const { library } = useEthers();
  const bridgeContract = useGetMPBContract(chainId, readOnly);
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);
  const effectiveChainId = chainId ?? BRIDGE_CONSTANTS.DEFAULT_CHAIN_ID;
  const readOnlyProvider = useReadOnlyProvider(effectiveChainId);

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
