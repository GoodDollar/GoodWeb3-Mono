import moment from "moment";
import { ethers } from "ethers";
import { isArray, shuffle } from "lodash";

//todo: add error handler

export const getRecentClaims = async (account: string, endpoint: string, library: any) => {
  if (!library) return [];
  const apiEndpoint = shuffle(endpoint.split(","))[0];
  const sender32 = ethers.utils.hexZeroPad(account, 32);

  //todo: add hash for additional pools
  //gd-claim-hash
  const claimHash = "0x89ed24731df6b066e4c5186901fffdba18cd9a10f07494aff900bdee260d1304";

  const unix30DaysAgo = moment().subtract(30, "days").unix();
  const blockNoUrl = `${apiEndpoint}&module=block&action=getblocknobytime&timestamp=${unix30DaysAgo}&closest=before`;
  const { result: blockNoStart } = await fetch(blockNoUrl).then(res => res.json());

  if (!blockNoStart) return [];
  const lastBlockNo = await library.getBlockNumber();

  const params = {
    module: "logs",
    action: "getLogs",
    page: "1",
    offset: "31",
    topic0: claimHash,
    topic1: sender32,
    // required for fuse explorer, optional for celoscan
    // blocknumber = fuse/blockscout, else we expect a <chain>scan.io aligned response
    fromBlock: blockNoStart.blockNumber ?? blockNoStart,
    toBlock: lastBlockNo,
    topic0_1_opr: "and"
  };

  const queryString = new URLSearchParams(params).toString();
  const apiUrl = `${apiEndpoint}${queryString}`;

  //todo: add error handler
  const { result } = await fetch(apiUrl).then(res => res.json());

  if (!isArray(result) || result?.length === 0) return [];

  const formatted = result.reverse().map((tx: any) => {
    const { address, data, timeStamp, transactionHash } = tx;
    const claimAmount = ethers.BigNumber.from(data);
    const date = moment(ethers.BigNumber.from(timeStamp).toNumber() * 1000).utc();
    return { address, claimAmount, date, transactionHash };
  });

  return formatted;
};
