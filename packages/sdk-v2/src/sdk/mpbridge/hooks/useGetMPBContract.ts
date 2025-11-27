import { useMemo, useEffect, useState } from "react";
import { useEthers } from "@usedapp/core";
import { ethers } from "ethers";
import { useGetEnvChainId } from "../../base/react";
import { useReadOnlyProvider } from "../../../hooks";
import { CONTRACT_TO_ABI } from "../../base/sdk";
import { IGoodDollar } from "@gooddollar/goodprotocol/types";
import { BRIDGE_CONSTANTS } from "../constants";
import { getMPBContractAddress } from "../types";
import { SupportedChains } from "../../constants";

export const getDeploymentName = (baseEnv: string, chainId: number): string => {
  // For Fuse chain (122)
  if (chainId === SupportedChains.FUSE) {
    return "fuse";
  }

  if (chainId === SupportedChains.CELO) {
    if (baseEnv === "production" || baseEnv === "staging") {
      return "celo";
    }
    return "celo";
  }

  if (chainId === SupportedChains.MAINNET) {
    return "mainnet";
  }

  console.warn(`Unknown chain ID ${chainId}, defaulting to mainnet deployment`);
  return "mainnet";
};

export const useGetMPBContract = (chainId?: number, readOnly = false) => {
  const { library } = useEthers();
  const { baseEnv } = useGetEnvChainId();
  const mpbABI = CONTRACT_TO_ABI["MPBBridge"]?.abi || [];
  const targetChainId = chainId || BRIDGE_CONSTANTS.DEFAULT_CHAIN_ID;
  const readOnlyProvider = useReadOnlyProvider(targetChainId);

  return useMemo(() => {
    const provider = readOnly ? readOnlyProvider : library;
    if (!provider) return null;

    // Get the deployment name for this chain and environment
    const deploymentName = getDeploymentName(baseEnv, targetChainId);

    // Get the contract address from mpb.json
    const contractAddress = getMPBContractAddress(targetChainId, deploymentName);

    if (!contractAddress) {
      console.error(
        `No MPB bridge contract found for chain ${targetChainId} in environment ${baseEnv} (deployment: ${deploymentName})`
      );
      return null;
    }

    console.log(`Using MPB bridge contract for chain ${targetChainId}, env ${baseEnv}: ${contractAddress}`);
    return new ethers.Contract(contractAddress, mpbABI, provider);
  }, [library, mpbABI, targetChainId, baseEnv, readOnly, readOnlyProvider]);
};

export const useNativeTokenContract = (chainId?: number, readOnly = false): IGoodDollar | null => {
  const { library } = useEthers();
  const bridgeContract = useGetMPBContract(chainId, readOnly);
  const [nativeTokenAddress, setNativeTokenAddress] = useState<string | null>(null);
  const readOnlyProvider = useReadOnlyProvider(chainId || BRIDGE_CONSTANTS.DEFAULT_CHAIN_ID);

  // Query the bridge contract's nativeToken address
  useEffect(() => {
    let isMounted = true;

    if (!bridgeContract) {
      console.warn(`⚠️ No bridge contract available for chain ${chainId}, using production G$ fallback`);
      // Use production G$ as fallback
      setNativeTokenAddress(BRIDGE_CONSTANTS.PRODUCTION_GDOLLAR_ADDRESS);
      return;
    }

    // Log bridge contract details for debugging
    console.log(`🔍 Bridge contract for chain ${chainId}:`, {
      address: bridgeContract.address,
      hasnativeTokenMethod: typeof bridgeContract.nativeToken === "function",
      availableFunctions: Object.keys(bridgeContract.functions || {})
        .filter(key => !key.includes("("))
        .slice(0, 10)
    });

    // Check if nativeToken method exists
    if (typeof bridgeContract.nativeToken !== "function") {
      console.error(` Bridge contract at ${bridgeContract.address} does not have nativeToken() method`);
      console.error(`Available methods:`, Object.keys(bridgeContract.functions || {}));
      setNativeTokenAddress(BRIDGE_CONSTANTS.PRODUCTION_GDOLLAR_ADDRESS);
      return;
    }

    bridgeContract
      .nativeToken()
      .then((address: string) => {
        if (isMounted) {
          console.log(`✅ Bridge contract nativeToken for chain ${chainId}: ${address}`);
          setNativeTokenAddress(address);
        }
      })
      .catch((error: any) => {
        console.error(
          `Failed to query bridge nativeToken on chain ${chainId}, using production G$ fallback: ${BRIDGE_CONSTANTS.PRODUCTION_GDOLLAR_ADDRESS}`
        );
        console.error(`Bridge contract address: ${bridgeContract.address}`);
        console.error(`Error details:`, {
          message: error.message,
          code: error.code,
          data: error.data,
          reason: error.reason,
          transaction: error.transaction
        });
        if (isMounted) {
          // Always fallback to production G$, never dev G$
          setNativeTokenAddress(BRIDGE_CONSTANTS.PRODUCTION_GDOLLAR_ADDRESS);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [bridgeContract, chainId]);

  return useMemo(() => {
    if (!nativeTokenAddress) return null;

    const provider = readOnly ? readOnlyProvider : library;
    if (!provider) return null;

    console.log(`💰 Using native token address for chain ${chainId}: ${nativeTokenAddress}`);

    const tokenABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function decimals() view returns (uint8)",
      "function transfer(address to, uint256 amount) returns (bool)",
      "function transferFrom(address from, address to, uint256 amount) returns (bool)"
    ];

    return new ethers.Contract(nativeTokenAddress, tokenABI, provider) as IGoodDollar;
  }, [nativeTokenAddress, library, readOnly, readOnlyProvider, chainId]);
};
