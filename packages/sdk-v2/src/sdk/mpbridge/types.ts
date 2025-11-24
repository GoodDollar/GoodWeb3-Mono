import { ethers } from "ethers";
import { TransactionStatus } from "@usedapp/core";
import bridgeContracts from "@gooddollar/bridge-contracts/release/mpb.json";
import { SupportedChains } from "../constants";

export enum BridgeService {
  AXELAR = 0,
  LAYERZERO = 1
}

/**
 * Proxy contract addresses for MPB contracts
 *
 * The proxy contract stores the actual data and delegates calls to the implementation contract.
 * The implementation contract defines the methods and events, but can be upgraded by pointing
 * the proxy to a new implementation.
 *
 * Structure: { chainId: { envName: proxyAddress } }
 *
 * NOTE: The proxy address is the same on all chains: 0xa3247276DbCC76Dd7705273f766eB3E8a5ecF4a5
 */
const MPB_PROXY_ADDRESSES: Record<number, Record<string, string>> = {
  [SupportedChains.FUSE]: {
    fuse: "0xa3247276DbCC76Dd7705273f766eB3E8a5ecF4a5" // Fuse proxy (same on all chains)
  },
  [SupportedChains.CELO]: {
    celo: "0xa3247276DbCC76Dd7705273f766eB3E8a5ecF4a5" // Celo mainnet proxy (same on all chains)
  },
  [SupportedChains.MAINNET]: {
    mainnet: "0xa3247276DbCC76Dd7705273f766eB3E8a5ecF4a5" // Ethereum mainnet proxy (same on all chains)
  }
};

/**
 * Helper function to get MPB contract address (proxy or implementation)
 *
 * Priority:
 * 1. Proxy contract address (if available) - stores data, delegates to implementation
 * 2. Implementation contract address from mpb.json - defines methods/events
 *
 * mpb.json is organized as: { chainId: [{ name: "envName", contracts: { MessagePassingBridge: { address: "0x..." } } }] }
 *
 * @param chainId - The chain ID to get the contract for
 * @param envName - The environment name (e.g., "fuse", "celo", "mainnet", "alfajores", "fuse_testnet")
 * @returns The contract address (proxy if available, otherwise implementation) or undefined if not found
 */
export const getMPBContractAddress = (chainId: number, envName: string): string | undefined => {
  // First, check for proxy address (proxy stores data, implementation defines methods)
  const proxyAddresses = MPB_PROXY_ADDRESSES[chainId];
  if (proxyAddresses && proxyAddresses[envName]) {
    console.log(`✅ Using MPB proxy contract for chain ${chainId}, env ${envName}: ${proxyAddresses[envName]}`);
    return proxyAddresses[envName];
  }

  // Fallback to implementation address from mpb.json
  const chainDeployments = (bridgeContracts as any)[chainId.toString()];

  if (!chainDeployments || !Array.isArray(chainDeployments)) {
    console.error(`No deployments found for chain ID ${chainId} in mpb.json`);
    return undefined;
  }

  // Find the deployment matching the environment name
  const deployment = chainDeployments.find((d: any) => d.name === envName);

  if (!deployment) {
    console.error(`No deployment found for environment "${envName}" on chain ${chainId}`);
    return undefined;
  }

  const contractAddress = deployment.contracts?.MessagePassingBridge?.address;

  if (!contractAddress) {
    console.error(`MessagePassingBridge address not found for ${envName} on chain ${chainId}`);
    return undefined;
  }

  console.log(`⚠️ Using MPB implementation contract for chain ${chainId}, env ${envName}: ${contractAddress}`);
  return contractAddress;
};

// Types
export type MPBBridgeData = {
  bridgeFees: { nativeFee: ethers.BigNumber | null; zroFee: ethers.BigNumber | null };
  bridgeLimits: { minAmount: ethers.BigNumber; maxAmount: ethers.BigNumber } | null;
  // Protocol fee taken by the bridge contract in basis points (bps) divided by 10000.
  // For example, 15 => 0.15%.
  protocolFeePercent: number | null;
  isLoading: boolean;
  error: string | null;
  validation: {
    isValid: boolean;
    reason: string;
    errorMessage?: string;
    canBridge: boolean;
    hasAllowance: boolean;
  };
};

export type BridgeRequest = {
  amount: string;
  sourceChainId: number;
  targetChainId: number;
  target?: string;
  bridging?: boolean;
};

export type BridgeHistoryItem = {
  data: {
    id: string;
    from: string;
    target: string;
    amount: ethers.BigNumber;
    sourceChainId: number;
    targetChainId: number;
    bridge: number;
    timestamp?: number;
  };
  executedEvent?: any;
  amount: string;
  sourceChain: string;
  targetChain: string;
  bridgeService: string;
  status: "Completed" | "Pending";
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
};

export type UseMPBBridgeReturn = {
  sendMPBBridgeRequest: (amount: string, sourceChain: string, targetChain: string, target?: string) => Promise<void>;
  bridgeRequestStatus: TransactionStatus;
  bridgeStatus: Partial<TransactionStatus> | undefined;
  bridgeRequest: BridgeRequest | undefined;
  isSwitchingChain: boolean;
};
