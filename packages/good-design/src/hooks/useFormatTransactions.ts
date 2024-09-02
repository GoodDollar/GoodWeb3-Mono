import { useMemo } from "react";
import { G$Amount, PoolDetails, SupportedChains, useGetEnvChainId } from "@gooddollar/web3sdk-v2";
import { BigNumber } from "ethers";

import { truncateMiddle } from "../utils";
import type { ClaimContextProps } from "../apps/ubi/types";

export const useFormatClaimTransactions = (
  pools: PoolDetails[],
  chainId: number | undefined,
  account: string
): ClaimContextProps["claimPools"] => {
  const { defaultEnv } = useGetEnvChainId();

  return useMemo(() => {
    if (!pools || pools.length === 0 || !chainId) return undefined;

    const formattedTransactions: any = { totalAmount: BigNumber.from("0"), transactionList: [] };

    //todo: fix typings
    pools?.map((pool: PoolDetails) => {
      const [poolName] = Object.keys(pool);
      const { [poolName]: poolDetail } = pool;

      poolDetail.map((transaction: any) => {
        const {
          address,
          claimAmount = BigNumber.from("0"),
          contractName,
          date = undefined,
          isPool = false,
          transactionHash = undefined
        } = transaction;

        const tokenValue = G$Amount("G$", claimAmount, chainId, defaultEnv);
        const trunAddr = truncateMiddle(address, 11);

        const name = contractName ?? poolName;
        const network = SupportedChains[chainId];
        const displayName = `${name} (${trunAddr})`.trim();

        formattedTransactions.totalAmount = formattedTransactions.totalAmount.add(claimAmount);
        formattedTransactions.transactionList.push({
          account, //todo: read from logs, but for now receiver is always the current account.
          contractAddress: address,
          token: "G$",
          tokenValue,
          contractName: name,
          displayName,
          network,
          date,
          type: date ? "claim-confirmed" : "claim-start",
          isPool,
          transactionHash
        });
      });
    });

    formattedTransactions.totalAmount = G$Amount("G$", formattedTransactions.totalAmount, chainId, defaultEnv);

    return formattedTransactions;
  }, [pools, chainId]);
};
