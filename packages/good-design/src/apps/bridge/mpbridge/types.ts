import { BigNumber } from "ethers";

export type BridgeProvider = "axelar" | "layerzero";

export type BridgeTransaction = {
  id: string;
  transactionHash: string;
  sourceChain: string;
  targetChain: string;
  amount: string;
  bridgeProvider: "axelar" | "layerzero";
  status: "completed" | "pending" | "failed" | "bridging";
  date?: Date;
  chainId: number;
};

export interface IMPBLimits {
  [chain: string]: {
    minAmount: BigNumber;
    maxAmount: BigNumber;
  };
}

export interface IMPBFees {
  [chain: string]: {
    nativeFee: BigNumber;
    zroFee: BigNumber;
  };
}

export interface MPBBridgeProps {
  useCanMPBBridge: (chain: string, amountWei: string) => { isValid: boolean; reason: string };
  onSetChain?: (chain: string) => void;
  originChain: [string, (chain: string) => void];
  targetChainState: [string, (chain: string) => void];
  inputTransaction: [string, (amount: string) => void];
  pendingTransaction: [any, (transaction: any) => void];
  protocolFeePercent?: number;
  limits?: IMPBLimits;
  fees?: IMPBFees;
  bridgeStatus?: {
    status?: string;
    errorMessage?: string;
    transaction?: { hash: string };
  };
  onBridgeStart?: (sourceChain: string, targetChain: string) => Promise<void>;
  onBridgeFailed?: (error: Error) => void;
  onBridgeSuccess?: () => void;
  bridgeProvider?: BridgeProvider;
  onBridgeProviderChange?: (provider: BridgeProvider) => void;
}
