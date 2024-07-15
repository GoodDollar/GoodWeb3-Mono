import { TransactionStatus } from "@usedapp/core";
import { BigNumber } from "ethers";
import { Dispatch, SetStateAction } from "react";

export type OnBridge = (amount: string, sourceChain: string, target?: string) => Promise<void>;

export type ILimits = Record<
  string,
  { dailyLimit: BigNumber; txLimit: BigNumber; accountDailyLimit: BigNumber; minAmount: BigNumber }
>;

export type IFees = Record<string, { minFee: BigNumber; maxFee: BigNumber; fee: BigNumber }>;

export interface MicroBridgeProps {
  // onBridge: OnBridge;
  useCanBridge: (chain: "fuse" | "celo", amountWei: string) => { isValid: boolean; reason: string };
  onSetChain?: (chain: "fuse" | "celo") => void;
  originChain: ["fuse" | "celo", Dispatch<SetStateAction<"fuse" | "celo">>];
  inputTransaction: [string, Dispatch<SetStateAction<string>>];
  pendingTransaction: [any, Dispatch<SetStateAction<any>>];
  error?: string | null;
  limits?: ILimits;
  fees?: IFees;
  bridgeStatus?: TransactionStatus;
  relayStatus?: Partial<TransactionStatus>;
  selfRelayStatus?: Partial<TransactionStatus>;
  onBridgeStart?: () => void;
  onBridgeSuccess?: () => void;
  onBridgeFailed?: (e: Error) => void;
}
