import { BigNumber } from "@ethersproject/bignumber";
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

export interface ClaimWizardProps {
  account: string | undefined;
  chainId: number | undefined;
  claimStats: Omit<ClaimStats, "claimCall">;
  claimPools: any;
  claimStatus: TransactionStatus;
  onTxDetails: (transaction: Transaction) => void;
  onClaim: () => Promise<void>;
  handleConnect?: () => Promise<boolean>;
  onTxUpdate?: (transaction: Transaction) => void;
}
