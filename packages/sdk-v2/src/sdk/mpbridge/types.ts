import { ethers } from "ethers";
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
