import { BigNumber } from "@ethersproject/bignumber";
import { CurrencyValue } from "@usedapp/core";

export type ClaimStats = {
  isWhitelisted: boolean;
  claimAmount?: BigNumber;
  hasClaimed: boolean;
  claimTime: Date;
  claimCall: any;
  address?: string;
  contractName?: string;
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
  onTxDetails: (transaction: Transaction) => void;
  onClaim: () => Promise<boolean>;
  handleConnect?: () => Promise<boolean>;
}
