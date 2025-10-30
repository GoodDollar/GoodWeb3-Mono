import { ethers } from "ethers";
import { TransactionStatus } from "@usedapp/core";
import { SupportedChains } from "../constants";
import bridgeContracts from "@gooddollar/bridge-contracts/release/deployment.json";

export enum BridgeService {
  LAYERZERO = 0,
  AXELAR = 1
}

// MPB Contract addresses - Imported from @gooddollar/bridge-contracts package
export const MPB_CONTRACTS = {
  [SupportedChains.FUSE]: bridgeContracts.fuse.fuseBridge,
  [SupportedChains.CELO]: bridgeContracts.fuse.celoBridge,
  [SupportedChains.MAINNET]: bridgeContracts.production.fuseBridge
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
