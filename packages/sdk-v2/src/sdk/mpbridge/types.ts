import { ethers } from "ethers";
import { TransactionStatus } from "@usedapp/core";
import bridgeContracts from "@gooddollar/bridge-contracts/release/mpb.json";

export enum BridgeService {
  LAYERZERO = 0,
  AXELAR = 1
}

/**
 * Helper function to get MPB contract address from mpb.json structure
 * mpb.json is organized as: { chainId: [{ name: "envName", contracts: { MessagePassingBridge: { address: "0x..." } } }] }
 *
 * @param chainId - The chain ID to get the contract for
 * @param envName - The environment name (e.g., "fuse", "celo", "mainnet", "alfajores", "fuse_testnet")
 * @returns The contract address or undefined if not found
 */
export const getMPBContractAddress = (chainId: number, envName: string): string | undefined => {
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
