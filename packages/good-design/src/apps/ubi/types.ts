import { Contract } from "ethers";
import { BigNumber } from "@ethersproject/bignumber";
import { INewsFeedProvider, PoolDetails, SupportedChains } from "@gooddollar/web3sdk-v2";
import { CurrencyValue } from "@usedapp/core";
import { Moment } from "moment";

export type ClaimDetails = {
  isWhitelisted: boolean;
  isRegistered?: boolean;
  claimAmount?: BigNumber;
  hasClaimed: boolean;
  nextClaimTime: Date;
  address?: string;
  contractName?: string;
  date?: Moment;
};

export type Transaction = {
  address: string;
  account: string;
  network: string;
  contractAddress: string;
  token: string;
  status: string;
  type: string;
  date?: Moment;
  contractName: string;
  displayName: string;
  tokenValue?: CurrencyValue;
  transactionHash?: string;
  isPool?: boolean;
};

export type ReceiveTransaction = Transaction & {
  type: "bridge-in" | "claim-start" | "claim-confirmed" | "receive";
};

export type SendTransaction = Transaction & {
  type: "bridge-out" | "send";
};

export interface ClaimContextProps {
  account: string | undefined;
  activePoolAddresses: { [key: string]: string };
  chainId: number | undefined;
  withSignModals: boolean;
  claimDetails: ClaimDetails;
  poolsDetails: PoolDetails[] | undefined;
  loading: boolean;
  poolContracts: Contract[] | undefined;
  claimPools: { totalAmount: CurrencyValue; transactionList: Transaction[] | undefined };
  claimFlowStatus: any;
  claimedAlt: { hasClaimed: boolean; altChain: string };
  error?: string;
  supportedChains: SupportedChains[];
  txDetails: { transaction: any; isOpen: boolean };
  withNewsFeed?: boolean;
  newsProps?: Omit<INewsFeedProvider, "children">;
  onNews: () => void;
  onReset: () => void;
  setTxDetails: (tx: any) => void;
  setError: (error: string | undefined) => void;
  onClaim: () => Promise<void>;
  onClaimSuccess: () => Promise<void>;
  onClaimFailed: () => Promise<void>;
  onUpgrade: () => void;
  switchChain: (network: string) => void;
  onTxDetailsPress?: (transaction: Transaction) => void;
  onConnect?: () => Promise<boolean>;
}
