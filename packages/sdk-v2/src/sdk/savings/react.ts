import React, { useCallback } from "react";
import { useContractFunction, useCalls, QueryParams, useEthers, CurrencyValue } from "@usedapp/core";
import { useGetContract, useGetEnvChainId } from "../base/react";
import { ethers } from "ethers";
import { GoodDollarStaking, IGoodDollar } from "@gooddollar/goodprotocol/types";
import { G$, GOOD, SupportedChains } from "../constants";
import useRefreshOrNever from "../../hooks/useRefreshOrNever";

export interface StakerInfo {
  claimable:
    | {
        g$Reward: CurrencyValue | any;
        goodReward: CurrencyValue | any;
      }
    | undefined;
  balance?: CurrencyValue | any;
  rewardsPaid?: {
    g$Minted: CurrencyValue | any;
    goodMinted: CurrencyValue | any;
  };
  deposit?: CurrencyValue | any;
  principle?: CurrencyValue | any;
  shares?: number | any;
  lastSharePrice?: number | any;
}

export interface SavingsStats {
  totalStaked: CurrencyValue | undefined;
  totalRewardsPaid: CurrencyValue | undefined;
  apy: number | undefined;
  lastUpdateBlock?: number;
  savings?: number;
}

export function useSavingsBalance(refresh: QueryParams["refresh"] = "never", requiredChainId: number) {
  const refreshOrNever = useRefreshOrNever(refresh);
  const { account } = useEthers();

  const gooddollar = useGetContract("GoodDollar", true, "savings") as IGoodDollar;
  const gdStaking = useGetContract("GoodDollarStaking", true, "savings") as GoodDollarStaking;

  const results = useCalls(
    [
      {
        contract: gooddollar,
        method: "balanceOf",
        args: [account]
      },
      {
        contract: gdStaking,
        method: "getSavings",
        args: [account]
      }
    ],
    {
      refresh: refreshOrNever,
      chainId: requiredChainId
    }
  );

  const [balance = { value: 0, error: undefined }, sBalance = { value: 0, error: undefined }] = results;

  return { g$Balance: balance, savingsBalance: sBalance };
}

// requiredChainId here to fix handling switch of network properly
export const useSavingsFunctions = () => {
  const gooddollar = useGetContract("GoodDollar", false, "savings") as IGoodDollar;
  const gdStaking = useGetContract("GoodDollarStaking", false, "savings") as GoodDollarStaking;

  const { state: transferState, send: sendTransfer } = useContractFunction(gooddollar, "transferAndCall", {
    transactionName: "Transfer to savings"
  });
  const { state: withdrawState, send: sendWithdraw } = useContractFunction(gdStaking, "withdrawStake", {
    transactionName: "Withdraw from savings"
  });
  const { state: claimState, send: sendClaim } = useContractFunction(gdStaking, "withdrawRewards", {
    transactionName: "Withdraw rewards from savings"
  });

  const transfer = useCallback(
    (amount: string) => {
      const callData = ethers.constants.HashZero;
      return sendTransfer(gdStaking.address, amount, callData);
    },
    [sendTransfer, gdStaking]
  );

  const withdraw = useCallback(
    async (amount: string, address?: string) => {
      const shares = address ? await gdStaking.sharesOf(address) : await gdStaking.amountToShares(amount); // sharesOf used to withdraw full amount
      return sendWithdraw(shares);
    },
    [sendWithdraw]
  );

  const claim = useCallback(() => sendClaim(), [sendClaim]);

  return { transfer, withdraw, claim, transferState, withdrawState, claimState };
};

export const useSavingsStats = (refresh: QueryParams["refresh"] = "never") => {
  const refreshOrNever = useRefreshOrNever(refresh);

  const { chainId, defaultEnv } = useGetEnvChainId();

  const gdStaking = useGetContract(
    "GoodDollarStaking",
    true,
    "savings",
    defaultEnv,
    SupportedChains.FUSE
  ) as GoodDollarStaking;

  const results = useCalls(
    [
      {
        contract: gdStaking,
        method: "stats",
        args: []
      },
      {
        contract: gdStaking,
        method: "getRewardsPerBlock",
        args: []
      },
      {
        contract: gdStaking,
        method: "numberOfBlocksPerYear",
        args: []
      }
    ],
    { refresh: refreshOrNever, chainId: SupportedChains.FUSE as number }
  );

  let globalStats: SavingsStats = {
    totalStaked: undefined,
    totalRewardsPaid: undefined,
    apy: undefined
  };

  if (results[0]?.error) {
    // one fails, all fails
    let errMessages: Array<any> = [];
    for (let i = 0; i < results.length; i++) {
      errMessages.push(results[i]?.error);
    }

    return {
      stats: undefined,
      error: errMessages
    };
  }

  if (results[0]) {
    const [lastUpdateBlock, totalStaked, totalRewardsPaid, savings] = results[0]?.value;
    const staked = CurrencyValue.fromString(G$(chainId, defaultEnv), totalStaked.toString());
    const rewardsPaid = CurrencyValue.fromString(G$(chainId, defaultEnv), totalRewardsPaid.toString());
    globalStats.totalStaked = staked;
    globalStats.totalRewardsPaid = rewardsPaid;
  }

  if (results[1] && results[2]) {
    const { _goodRewardPerBlock: grpb, _gdInterestRatePerBlock: gdIrpb } = results[1]?.value;
    const numberOfBlocksPerYear = results[2]?.value;
    const apy = (Math.pow(gdIrpb / 1e18, numberOfBlocksPerYear) - 1) * 100;

    globalStats.apy = apy;
  }

  return {
    stats: globalStats,
    error: undefined
  };
};

export const useStakerInfo = (refresh: QueryParams["refresh"] = "never", account: string) => {
  const refreshOrNever = useRefreshOrNever(refresh);

  const { chainId, defaultEnv } = useGetEnvChainId();
  const contract = useGetContract(
    "GoodDollarStaking",
    true,
    "savings",
    defaultEnv,
    SupportedChains.FUSE
  ) as GoodDollarStaking;
  const results = useCalls(
    [
      {
        contract: contract,
        method: "getUserPendingReward(address)",
        args: [account]
      },
      {
        contract: contract,
        method: "principle",
        args: [account]
      }
    ],
    { refresh: refreshOrNever, chainId: SupportedChains.FUSE as number }
  );

  let stakerInfo: StakerInfo = {
    claimable: undefined,
    principle: undefined
  };

  if (results[0]?.error) {
    let errMessages: Array<any> = [];
    for (let i = 0; i < results.length; i++) {
      errMessages.push(results[i]?.error);
    }

    return {
      stats: undefined,
      error: errMessages
    };
  }

  if (results[0]) {
    const [goodReward, g$Reward] = results[0]?.value;
    const claimableRewards = {
      g$Reward: CurrencyValue.fromString(G$(chainId, defaultEnv), g$Reward.toString()),
      goodReward: CurrencyValue.fromString(GOOD(chainId, defaultEnv), goodReward.toString())
    };
    stakerInfo.claimable = claimableRewards;
  }

  if (results[1]) {
    const [principle] = results[1]?.value; //note: original deposit
    const deposit = CurrencyValue.fromString(G$(chainId, defaultEnv), principle.toString());
    stakerInfo.principle = deposit;
  }

  return {
    stats: stakerInfo,
    error: undefined
  };
};
