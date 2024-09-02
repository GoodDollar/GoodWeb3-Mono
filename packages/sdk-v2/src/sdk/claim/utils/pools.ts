import ethers, { BigNumber, Contract } from "ethers";
import { PoolDetails } from "../types";

export const getContractsFromClaimPools = (poolsDetails: PoolDetails[]) => {
  return poolsDetails.reduce((acc, pool) => {
    const [poolName] = Object.keys(pool);
    const { [poolName]: poolDetail } = pool;

    if ("contract" in poolDetail[0] && !poolDetail[0].hasClaimed) {
      acc.push(poolDetail[0].contract);
    }
    return acc;
  }, [] as Contract[]);
};

export const getPoolsDetails = (
  pools: any[],
  abi: any,
  library: ethers.providers.JsonRpcProvider | ethers.providers.FallbackProvider
) =>
  pools.map((pool: any) => {
    const { claimAmount, contract: address, isRegistered, nextClaimTime } = pool;
    const poolName = "RedTent";
    const contract = new Contract(address, abi, library);
    const details = { [poolName]: [{}] as any };

    details[poolName][0]["address"] = address;
    details[poolName][0]["contract"] = contract;
    details[poolName][0]["claimAmount"] = BigNumber.from(claimAmount);
    details[poolName][0]["hasClaimed"] = BigNumber.from(claimAmount).isZero();
    details[poolName][0]["isRegistered"] = isRegistered;
    details[poolName][0]["claimTime"] = nextClaimTime;
    details[poolName][0]["isPool"] = true;

    return details as PoolDetails;
  });
