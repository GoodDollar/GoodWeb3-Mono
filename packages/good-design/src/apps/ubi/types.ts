import { BigNumber } from "@ethersproject/bignumber";
import { SupportedChains } from "@gooddollar/web3sdk-v2";
import { CurrencyValue, TransactionStatus } from "@usedapp/core";
import { Moment } from "moment";

export type ClaimStats = {
  isWhitelisted: boolean;
  claimAmount?: BigNumber;
  hasClaimed: boolean;
  claimTime: Date;
  claimCall: any;
  address?: string;
  contractName?: string;
  date?: Moment;
};

export type Transaction = {
  network: string;
  contractAddr: string;
  token: string;
  tokenValue: CurrencyValue;
  status: "pending" | "confirmed" | "failed";
  type: string;
  hash?: string;
  date?: string;
};

export type ReceiveTransaction = Transaction & {
  type: "bridge-in" | "claim-start" | "claim-confirmed" | "receive";
};

export type SendTransaction = Transaction & {
  type: "bridge-out" | "send";
};

export interface ClaimContextProps {
  account: string | undefined;
  chainId: number | undefined;
  withSignModals: boolean;
  claimStats: Omit<ClaimStats, "claimCall">;
  claimPools: any;
  claimStatus: TransactionStatus;
  claimedAlt: { hasClaimed: boolean; altChain: string };
  error?: string;
  supportedChains: SupportedChains[];
  onClaim: () => Promise<void>;
  onClaimSuccess: () => Promise<void>;
  onClaimFailed: () => Promise<void>;
  onConnect?: () => Promise<boolean>;
  onTxDetails?: (transaction: string) => void;
  switchChain: () => void;
}
