import moment from "moment";
import { ethers } from "ethers";
import { isArray, orderBy, sample } from "lodash";

//todo: add error handler

export interface RecentClaims {
  address: string;
  claimAmount: ethers.BigNumber;
  date: moment.Moment;
  transactionHash: string;
}

export const getRecentClaims = async (
  account: string,
  endpoints: string,
  library: any,
  withPools: boolean
): Promise<RecentClaims[]> => {
  if (!library) return [];
  const apiEndpoint = sample(endpoints.split(","));
  const sender32 = ethers.utils.hexZeroPad(account, 32);

  //gd-claim-hash
  const claimHash = "0x89ed24731df6b066e4c5186901fffdba18cd9a10f07494aff900bdee260d1304";
  const poolClaimHash = "0x1c0764b87f885ff7e1be5f7c06a0cc99c5bdc0f7b4884440e6ebe5b12bfd511d";

  const unix30DaysAgo = moment().subtract(30, "days").unix();
  const blockNoUrl = `${apiEndpoint}&module=block&action=getblocknobytime&timestamp=${unix30DaysAgo}&closest=before`;
  const { result: blockNoStart } = await fetch(blockNoUrl).then(res => res.json());

  if (!blockNoStart) return [];
  const lastBlockNo = await library.getBlockNumber();

  const params = {
    module: "logs",
    action: "getLogs",
    page: "1",
    offset: "100",
    topic1: sender32,
    // below are required for fuse explorer, optional for <chain>scan.io
    // blocknumber = fuse/blockscout, else we expect a <chain>scan.io aligned response
    fromBlock: blockNoStart.blockNumber ?? blockNoStart,
    toBlock: lastBlockNo,
    topic0_1_opr: "and"
  };

  const hashes = withPools ? [claimHash, poolClaimHash] : [claimHash];

  const fetchLogs = async (hash: string) => {
    params["topic0"] = hash;
    const endpoint = sample(endpoints.split(","));
    const queryString = new URLSearchParams(params).toString();
    const apiUrl = `${endpoint}${queryString}`;

    return fetch(apiUrl)?.then(res => res.json());
  };

  try {
    const results = await Promise.all(hashes.map(fetchLogs));

    let callResults: any[] = [];

    results.forEach(({ result }) => {
      if (isArray(result) && result.length > 0) {
        callResults = callResults.concat(result);
      }
    });

    if (callResults.length > 0) {
      const transactionsSorted = orderBy(callResults, ["timeStamp"], ["desc"]);

      const formatted = transactionsSorted.map((tx: any) => {
        const { address, data, timeStamp, transactionHash } = tx;

        const isGdPool = tx.topics[0] === claimHash;

        const claimAmount = ethers.BigNumber.from(data);
        const date = moment(ethers.BigNumber.from(timeStamp).toNumber() * 1000).utc();

        // todo: add utilty getContractName(address) to read pool name from registry
        // for now we assume its either GoodDollar or RedTent
        const contractName = isGdPool ? "GoodDollar" : "RedTent";

        return { address, claimAmount, contractName, date, transactionHash };
      });

      return formatted;
    }

    return callResults;
  } catch (e) {
    throw new Error(`getRecentClaims -- Failed to fetch recent-claims: ${e}`);
  }
};
