import { ethers } from "ethers";
import { TransactionStatus } from "@usedapp/core";
import bridgeContracts from "@gooddollar/bridge-contracts/release/mpb.json";
import { SupportedChains } from "../constants";

export enum BridgeService {
  AXELAR = 0,
  LAYERZERO = 1
}

const MPB_PROXY_ADDRESSES: Record<number, Record<string, string>> = {
  [SupportedChains.FUSE]: {
    fuse: "0xa3247276DbCC76Dd7705273f766eB3E8a5ecF4a5"
  },
  [SupportedChains.CELO]: {
    celo: "0xa3247276DbCC76Dd7705273f766eB3E8a5ecF4a5"
  },
  [SupportedChains.MAINNET]: {
    mainnet: "0xa3247276DbCC76Dd7705273f766eB3E8a5ecF4a5"
  }
};

export const getMPBContractAddress = (chainId: number, envName: string): string | undefined => {
  // First, check for proxy address (proxy stores data, implementation defines methods)
  const proxyAddresses = MPB_PROXY_ADDRESSES[chainId];
  if (proxyAddresses && proxyAddresses[envName]) {
    return proxyAddresses[envName];
  }

  // Fallback to implementation address from mpb.json
  const chainDeployments = (bridgeContracts as any)[chainId.toString()];

  if (!chainDeployments || !Array.isArray(chainDeployments)) {
    return undefined;
  }

  // Find the deployment matching the environment name
  const deployment = chainDeployments.find((d: any) => d.name === envName);

  if (!deployment) {
    return undefined;
  }

  const contractAddress = deployment.contracts?.MessagePassingBridge?.address;

  if (!contractAddress) {
    return undefined;
  }

  return contractAddress;
};

// Types
export type MPBBridgeData = {
  bridgeFees: { nativeFee: ethers.BigNumber | null; zroFee: ethers.BigNumber | null };
  bridgeLimits: { minAmount: ethers.BigNumber; maxAmount: ethers.BigNumber } | null;

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
  allowance: ethers.BigNumber | undefined;
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
