import { useMemo } from "react";
import { G$Amount, SupportedChains, useGetEnvChainId } from "@gooddollar/web3sdk-v2";
import { BigNumber } from "ethers";

import { truncateMiddle } from "../utils";

import { ClaimStats } from "../apps/ubi/types";

export const useFormatClaimTransactions = (transactionList: ClaimStats[], chainId: number | undefined): any[] => {
  const { defaultEnv } = useGetEnvChainId();

  return useMemo(() => {
    if (!transactionList || transactionList.length === 0 || !chainId) return [];

    const formattedTransactions: any = { totalAmount: BigNumber.from("0"), transactionList: [] };

    transactionList.map((transaction: ClaimStats) => {
      const { address, claimAmount = BigNumber.from("0"), contractName, hasClaimed, date = undefined } = transaction;

      console.log({ hasClaimed }); // temp for 'no-unused-vars' eslint rule

      const tokenValue = G$Amount("G$", claimAmount, chainId, defaultEnv);
      const trunAddr = truncateMiddle(address, 11);
      const name = contractName ?? "GoodDollar"; // ?? getContractName(address)
      const network = SupportedChains[chainId];
      const displayName = `${name} (${trunAddr})`.trim();

      formattedTransactions.totalAmount = formattedTransactions.totalAmount.add(claimAmount);
      formattedTransactions.transactionList.push({
        token: "G$",
        tokenValue,
        displayName,
        network,
        date,
        type: date ? "claim-confirmed" : "claim-start"
      });
    });

    formattedTransactions.totalAmount = G$Amount("G$", formattedTransactions.totalAmount, chainId, defaultEnv);

    return formattedTransactions;
  }, [transactionList, chainId]);
};
