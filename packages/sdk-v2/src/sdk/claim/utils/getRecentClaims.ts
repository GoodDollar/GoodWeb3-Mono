import moment from "moment";
import { ethers } from "ethers";
import { isArray, orderBy, flatten, shuffle } from "lodash";
import { fallback } from "../../../utils/async";
import { AsyncStorage } from "../../storage";

//todo: add error handler

export interface RecentClaims {
  address: string;
  claimAmount: string;
  date: string;
  transactionHash: string;
}

export const getRecentClaims = async (
  account: string,
  endpoints: string,
  library: any,
  pools: Array<string>,
  withPools: boolean
): Promise<RecentClaims[] | undefined> => {
  if (!library || !account) return undefined;
  const { chainId } = await library.getNetwork();
  const cacheKey = `GD_RecentClaims_${account}_${chainId}_${withPools}_${pools}`;
  const { lastBlock = 0, claimsCache = [] } = (await AsyncStorage.getItem(cacheKey)) || {};
  const sender32 = ethers.utils.hexZeroPad(account, 32).toLowerCase();

  //gd-claim-hash
  const claimHash = "0x89ed24731df6b066e4c5186901fffdba18cd9a10f07494aff900bdee260d1304";
  const poolClaimHash = "0x1c0764b87f885ff7e1be5f7c06a0cc99c5bdc0f7b4884440e6ebe5b12bfd511d";

  const lastBlockNo = await library.getBlockNumber();
  const blockNoStart = Math.max(lastBlock, lastBlockNo - 12 * 60 * 24 * 30);

  const hashes = withPools ? [claimHash, poolClaimHash] : [claimHash];

  const fetchLogs = async (hash: string, pool: string) => {
    const params = {
      module: "logs",
      action: "getLogs",
      topic1: sender32,
      // below are required for fuse explorer, optional for <chain>scan.io
      // blocknumber = fuse/blockscout, else we expect a <chain>scan.io aligned response
      fromBlock: blockNoStart.toString(),
      toBlock: lastBlockNo.toString(),
      topic0_1_opr: "and",
      topic0: hash,
      address: pool
    };

    const apiCalls = shuffle(endpoints.split(",")).map(baseURL => async () => {
      const queryString = new URLSearchParams(params).toString();
      const apiUrl = `${baseURL}${queryString}`;

      const result = await fetch(apiUrl).then(res => res.json());
      if (result?.status !== "1") {
        throw new Error("Failed to fetch events from explorer");
      }
      return result.result;
    });
    const fallbackResult = await fallback(apiCalls);
    return fallbackResult;
  };

  const fetchLogsFromBlockchain = async (hash: string, pool: string) => {
    const result = await library.getLogs({
      address: pool,
      topics: [hash, sender32],
      fromBlock: "0x" + blockNoStart.toString(16),
      toBlock: "0x" + lastBlockNo.toString(16)
    });

    if (!isArray(result)) throw new Error("Failed to fetch events from rpc");

    const withTimestamp = await Promise.all(
      result.map(async log => {
        const b = await library.getBlock(log.blockNumber);
        log.timeStamp = b.timestamp;
        return log;
      })
    );
    return withTimestamp;
  };
  try {
    const results = await Promise.all(
      flatten(
        pools.map(pool =>
          hashes.map(hash =>
            fetchLogs(hash, pool).catch(() => {
              return fetchLogsFromBlockchain(hash, pool);
            })
          )
        )
      )
    );
    const callResults: any[] = flatten(results).filter(_ => _);

    const transactionsSorted = orderBy(callResults, ["blockNumber"], ["desc"]);

    const formatted = transactionsSorted.map((tx: any) => {
      const { address, data, timeStamp, transactionHash } = tx;

      const isGdPool = tx.topics[0] === claimHash;

      const claimAmount = data;
      const date = moment(ethers.BigNumber.from(timeStamp).toNumber() * 1000)
        .utc()
        .format();

      // todo: add utilty getContractName(address) to read pool name from registry
      // for now we assume its either GoodDollar or RedTent
      const contractName = isGdPool ? "GoodDollar" : "RedTent";

      return { address, claimAmount, contractName, date, transactionHash, isPool: !isGdPool };
    });

    const merged = formatted.concat(claimsCache);
    const onlyUnique = Array.from(new Map(merged.map(item => [item.transactionHash, item])).values());
    void AsyncStorage.setItem(cacheKey, { lastBlock: lastBlockNo, claimsCache: merged });

    return onlyUnique;
  } catch (e) {
    throw new Error(`getRecentClaims -- Failed to fetch recent-claims: ${e}`);
  }
};
