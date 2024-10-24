import { BigNumber, Contract } from "ethers";

export type PoolDetails = {
  isRegistered: boolean;
  nextClaimTime: Date;
  claimAmount: BigNumber;
  contract: Contract;
  hasClaimed: boolean;
  address: string;
  contractName: string;
  poolName: string;
  isPool?: boolean;
};
