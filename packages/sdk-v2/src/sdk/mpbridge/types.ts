import { ethers } from "ethers";
import { SupportedChains } from "../constants";

// Bridge Service enum values (LayerZero = 0, Axelar = 1)
export enum BridgeService {
  LAYERZERO = 0,
  AXELAR = 1
}

// MPB Contract ABI - Updated with actual contract ABI from mpb.json
export const MPBBridgeABI = [
  "function bridgeTo(address target, uint256 targetChainId, uint256 amount, uint8 bridge) external payable",
  "function bridgeLimits() external view returns (tuple(uint256 dailyLimit, uint256 txLimit, uint256 accountDailyLimit, uint256 minAmount, bool onlyWhitelisted))",
  "function canBridge(address from, uint256 amount) external view returns (bool)",
  "event BridgeRequest(uint256 indexed sourceChainId, uint256 indexed destinationChainId, address indexed sender, address target, uint256 amount, uint8 bridge, uint256 id)",
  "event ExecutedTransfer(uint256 indexed sourceChainId, uint256 indexed destinationChainId, address indexed target, uint256 amount, uint8 bridge, uint256 id)"
];

// MPB Contract addresses - Updated with actual deployed addresses from deployment.json
export const MPB_CONTRACTS = {
  [SupportedChains.FUSE]: "0x5B7cEfD0e7d952F7E400416F9c98fE36F1043822", // Fuse bridge
  [SupportedChains.CELO]: "0x165aEb4184A0cc4eFb96Cb6035341Ba2265bA564", // Celo bridge
  [SupportedChains.MAINNET]: "0x08fdf766694C353401350c225cAEB9C631dC3288" // Mainnet bridge
};

// Types
export type MPBBridgeData = {
  bridgeFees: { nativeFee: ethers.BigNumber | null; zroFee: ethers.BigNumber | null };
  bridgeLimits: { minAmount: ethers.BigNumber; maxAmount: ethers.BigNumber };
  isLoading: boolean;
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
