import { BigNumber, Contract, ethers } from "ethers";
import { ContractCallContext, ContractCallResults, Multicall } from "ethereum-multicall";
import { PoolDetails } from "../types";

export const getContractsFromClaimPools = (poolsDetails: PoolDetails[]) => {
  return poolsDetails.reduce((acc, pool) => {
    const [poolName] = Object.keys(pool);
    const { [poolName]: poolDetail } = pool;

    if ("contract" in poolDetail[0]) {
      acc.push(poolDetail[0].contract);
    }
    return acc;
  }, [] as Contract[]);
};

export const getMemberPools = async (account: string, factory: any, library: any) => {
  if (!library || !account || !factory) return [];

  const ubiPoolFactory = new Contract(factory.address, factory.abi, library);
  return await ubiPoolFactory.getMemberPools(account);
};

export const getPoolsDetails = async (poolAddresses: string[], pool: any, library: any, account: string) => {
  const multicall = new Multicall({ ethersProvider: library, tryAggregate: true });

  const contractCallContext: ContractCallContext[] = poolAddresses.map(addr => ({
    reference: `pool_${addr}`,
    contractAddress: addr,
    abi: pool.abi,
    calls: [
      {
        reference: "isRegistered",
        methodName: "hasRole",
        methodParameters: [ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MEMBER_ROLE")), account]
      },
      {
        reference: "claimTime",
        methodName: "nextClaimTime",
        methodParameters: []
      },
      {
        reference: "claimAmount",
        methodName: "checkEntitlement(address)",
        methodParameters: [account]
      }
    ]
  }));

  const { results }: ContractCallResults = await multicall.call(contractCallContext);

  if (!results) throw new Error("Failed to fetch pool results");

  return Object.entries(results).map(([poolAddr, { callsReturnContext: poolDetails }]) => {
    const poolAddress = poolAddr.split("_")[1];
    const poolName = "RedTent";

    const details = poolDetails.reduce(
      (acc, { returnValues, reference }) => {
        if (returnValues[0].type === "BigNumber") {
          acc[poolName][0][reference] = BigNumber.from(returnValues[0]);
        } else {
          acc[poolName][0][reference] = returnValues[0];
        }

        return acc;
      },
      { [poolName as string]: [{}] } as PoolDetails
    );

    const contract = new Contract(poolAddress, pool.abi, library);

    details[poolName][0]["address"] = poolAddress;
    details[poolName][0]["contract"] = contract;
    details[poolName][0]["hasClaimed"] = details[poolName][0]["claimAmount"].isZero();

    return details;
  });
};
