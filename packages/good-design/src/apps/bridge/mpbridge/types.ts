import { BigNumber } from "ethers";

export type BridgeProvider = "axelar" | "layerzero";

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
  inputTransaction: [string, (amount: string) => void];
  pendingTransaction: [any, (transaction: any) => void];
  limits?: IMPBLimits;
  fees?: IMPBFees;
  bridgeStatus?: {
    status?: string;
    errorMessage?: string;
    transaction?: { hash: string };
  };
  onBridgeStart?: () => void;
  onBridgeFailed?: (error: Error) => void;
  onBridgeSuccess?: () => void;
}
