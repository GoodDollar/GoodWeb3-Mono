import { Contract } from "ethers";

export type PoolDetails = {
  [key: string]: {
    isRegistered: boolean;
    claimTime: any;
    claimAmount: any;
    contract: Contract;
    hasClaimed: boolean;
    address: string;
    contractName: string;
    isPool?: boolean;
  };
  // ];
};
