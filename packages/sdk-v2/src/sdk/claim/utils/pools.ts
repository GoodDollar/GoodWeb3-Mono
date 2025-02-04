import ethers, { BigNumber, Contract } from "ethers";
import { PoolDetails } from "../types";

export const getContractsFromClaimPools = (poolsDetails: PoolDetails[]) =>
  poolsDetails.reduce((acc, pool) => {
    if ("contract" in pool && !pool.hasClaimed) {
      acc.push(pool.contract);
    }
    return acc;
  }, [] as Contract[]);

export const getPoolsDetails = (
  pools: { [key: string]: any },
  abi: ethers.ethers.ContractInterface,
  library: ethers.providers.JsonRpcProvider | ethers.providers.FallbackProvider
) =>
  pools.map((pool: PoolDetails) => {
    const { claimAmount, contract: c, nextClaimTime } = pool;
    const contract = typeof c === "string" ? new Contract(c, abi, library) : c;
    const details = pool;
    const amount = BigNumber.from(claimAmount);

    details.address = contract.address;
    details.claimAmount = amount;
    details.hasClaimed = amount.isZero();
    details.nextClaimTime = new Date(+nextClaimTime * 1000);
    details.isPool = true;
    details.contract = contract;
    details.contractName = "RedTent";

    return details as PoolDetails;
  });
