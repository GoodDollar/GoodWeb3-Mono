import { TransactionStatus } from "@usedapp/core";
import { BigNumber } from "ethers";
import { Dispatch, SetStateAction } from "react";

export type OnMPBBridge = (amount: string, sourceChain: string, target?: string) => Promise<void>;

export interface IMPBFees {
  [key: string]: { nativeFee: BigNumber; zroFee: BigNumber };
  fuse: { nativeFee: BigNumber; zroFee: BigNumber };
  celo: { nativeFee: BigNumber; zroFee: BigNumber };
  mainnet: { nativeFee: BigNumber; zroFee: BigNumber };
}

export interface IMPBLimits {
  [key: string]: { minAmount: BigNumber; maxAmount: BigNumber };
  fuse: { minAmount: BigNumber; maxAmount: BigNumber };
  celo: { minAmount: BigNumber; maxAmount: BigNumber };
  mainnet: { minAmount: BigNumber; maxAmount: BigNumber };
}

export interface MPBBridgeProps {
  useCanMPBBridge: (chain: "fuse" | "celo" | "mainnet", amountWei: string) => { isValid: boolean; reason: string };
  onSetChain?: (chain: "fuse" | "celo" | "mainnet") => void;
  originChain: ["fuse" | "celo" | "mainnet", Dispatch<SetStateAction<"fuse" | "celo" | "mainnet">>];
  inputTransaction: [string, Dispatch<SetStateAction<string>>];
  pendingTransaction: [any, Dispatch<SetStateAction<any>>];
  error?: string | null;
  limits?: IMPBLimits;
  fees?: IMPBFees;
  bridgeStatus?: TransactionStatus;
  onBridgeStart?: () => void;
  onBridgeSuccess?: () => void;
  onBridgeFailed?: (e: Error) => void;
}
