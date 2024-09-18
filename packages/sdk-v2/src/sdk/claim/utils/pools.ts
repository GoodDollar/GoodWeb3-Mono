import ethers, { BigNumber, Contract } from "ethers";
import { PoolDetails } from "../types";

export const getContractsFromClaimPools = (poolsDetails: PoolDetails[]) =>
  poolsDetails.reduce((acc, pool) => {
    const [poolName] = Object.keys(pool);
    const { [poolName]: poolDetail } = pool;

    if ("contract" in poolDetail && !poolDetail.hasClaimed) {
      acc.push(poolDetail.contract);
    }
    return acc;
  }, [] as Contract[]);

export const getPoolsDetails = (
  pools: any[],
  abi: ethers.ethers.ContractInterface,
  library: ethers.providers.JsonRpcProvider | ethers.providers.FallbackProvider
) =>
  pools.map((pool: any) => {
    const { claimAmount, contract: address, isRegistered, nextClaimTime } = pool;
    const poolName = "RedTent_" + address;
    const contract = new Contract(address, abi, library);
    const details = { [poolName]: {} as any };
    const hasClaimed = BigNumber.from(claimAmount).isZero();

    details[poolName].address = address;
    details[poolName].contract = contract;
    details[poolName].claimAmount = BigNumber.from(claimAmount);
    details[poolName].hasClaimed = hasClaimed;
    details[poolName].isRegistered = isRegistered;
    details[poolName].claimTime = new Date((nextClaimTime + (hasClaimed ? 86400 : 0)) * 1000);
    details[poolName].isPool = true;
    details[poolName].contractName = poolName.split("_")[0];

    return details as PoolDetails;
  });
