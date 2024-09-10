import { useMemo } from "react";
import { G$Amount, PoolDetails, SupportedChains, RecentClaims, useGetEnvChainId } from "@gooddollar/web3sdk-v2";
import { BigNumber } from "ethers";

import { truncateMiddle } from "../utils";
import type { ClaimContextProps } from "../apps/ubi/types";

export const useFormatClaimTransactions = (
  pools: PoolDetails[] | RecentClaims[] | undefined,
  chainId: number | undefined,
  account: string
): ClaimContextProps["claimPools"] => {
  const { defaultEnv } = useGetEnvChainId();

  return useMemo(() => {
    if (!pools || pools.length === 0 || !chainId) return undefined;

    const formattedTransactions: any = { totalAmount: BigNumber.from("0"), transactionList: [] };

    pools?.map((pool: PoolDetails | RecentClaims) => {
      const [poolName] = Object.keys(pool);
      const poolDetail = Object.values(pool)[0];

      const formatTransaction = (transaction: any) => {
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
          account, // todo: read from logs, but for now receiver is always the current account.
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
      };

      if (Array.isArray(poolDetail)) {
        poolDetail.map((transaction: any) => formatTransaction(transaction));
      } else if (typeof poolDetail === "object" && poolDetail !== null) {
        formatTransaction(poolDetail);
      }
    });

    formattedTransactions.totalAmount = G$Amount("G$", formattedTransactions.totalAmount, chainId, defaultEnv);

    return formattedTransactions;
  }, [pools, chainId]);
};
