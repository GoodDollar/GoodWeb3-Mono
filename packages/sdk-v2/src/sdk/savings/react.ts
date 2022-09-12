import React, { useCallback } from 'react'
import { useContractFunction, useCalls, QueryParams } from '@usedapp/core'
import { useGetContract } from '../base/react'
import { ethers } from 'ethers'
import { EnvKey } from '../base'
import { GoodDollarStaking, IGoodDollar } from '@gooddollar/goodprotocol/types'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { G$ } from '@gooddollar/web3sdk'

export interface StakerInfo {
  claimable: {
    g$Reward: CurrencyAmount<Currency> | any,
    goodReward: CurrencyAmount<Currency> | any
  } | undefined, 
  balance?: CurrencyAmount<Currency> | any,
  rewardsPaid?: {
    g$Minted: CurrencyAmount<Currency> | any,
    goodMinted: CurrencyAmount<Currency> | any,
  }
  deposit?: CurrencyAmount<Currency> | any,
  principle?: CurrencyAmount<Currency> | any
  shares?: number | any,
  lastSharePrice?: number | any
}

export interface GlobalStats {
  totalStaked: CurrencyAmount<Currency>,
  totalRewardsPaid: CurrencyAmount<Currency>,
  apy: number
  lastUpdateBlock?: number,
  savings?: number,
}


export const useSavingsFunctions = (env?: EnvKey) => {
  const gooddollar = useGetContract("GoodDollar", true, "savings", env) as IGoodDollar;
  const gdStaking = useGetContract("GoodDollarStaking", true, "savings", env) as GoodDollarStaking;

  const {state: transferState, send: sendTransfer} = useContractFunction(gooddollar, "transferAndCall", {transactionName: "Transfer to savings"});
  const {state: withdrawState, send: sendWithdraw} = useContractFunction(gdStaking, "withdrawStake", {transactionName: "withdraw from savings"});
  const {state: claimState, send: sendClaim} = useContractFunction(gdStaking, "withdrawRewards", {transactionName: 'Withdraw rewards from savings'});

  const transfer = useCallback((amount: string) => {
    const callData = ethers.constants.HashZero
    return sendTransfer(gdStaking.address, amount, callData)
  }, [sendTransfer, gdStaking]);

  const withdraw = useCallback(async(amount:string, address?: string) => {
    const shares = address ? await gdStaking.sharesOf(address) : await gdStaking.amountToShares(amount) // sharesOf used to withdraw full amount
    return sendWithdraw(shares)
  }, [sendWithdraw]);

  const claim = useCallback(() => sendClaim(), [sendClaim])

  return { transfer, withdraw, claim, transferState, withdrawState, claimState }
}

export const useGlobalStats = (refresh: QueryParams["refresh"] = "never", env?: EnvKey) => {
const gdStaking = useGetContract("GoodDollarStaking", true, "savings", env) as GoodDollarStaking;

const results = useCalls(
  [
    {
      contract: gdStaking,
      method: 'stats',
      args: [],
    },
    {
      contract: gdStaking,
      method: 'getRewardsPerBlock',
      args: []
    },
    {
      contract: gdStaking,
      method: 'numberOfBlocksPerYear',
      args: []
    }
  ],{ refresh });

  if (results[0]?.error || results[1]?.error){
    //TODO: test error handling
  }

  if (!results.includes(undefined)) {
    const [lastUpdateBlock, totalStaked, totalRewardsPaid, savings] = results[0]?.value
    const {_goodRewardPerBlock: grpb, _gdInterestRatePerBlock: gdIrpb} = results[1]?.value
    const numberOfBlocksPerYear = results[2]?.value
    const apy = (Math.pow((gdIrpb/1e18), numberOfBlocksPerYear) - 1) * 100
    const staked = CurrencyAmount.fromRawAmount(G$[122], totalStaked)
    const rewardsPaid = CurrencyAmount.fromRawAmount(G$[122], totalRewardsPaid)

    const globalStats:GlobalStats = {
      totalStaked: staked,
      totalRewardsPaid: rewardsPaid,
      apy: apy
    }

    return {
      stats: globalStats,
      error: undefined
    }
  } else {
    return {
      stats: undefined,
      error: results
    }
  }
}

export const useStakerInfo = (refresh: QueryParams["refresh"] = "never", account:string, env?: EnvKey) => {
  const contract = useGetContract("GoodDollarStaking", true, "savings", env) as GoodDollarStaking
  const results = useCalls(
    [
      {
        contract: contract,
        method: 'getUserPendingReward(address)',
        args: [account]
      },
      {
        contract: contract,
        method: 'principle',
        args: [account]
      },
    ], { refresh }
  );

  let stakerInfo:StakerInfo = {
    claimable: undefined,
    principle: undefined
  }
  
  if (results[0]){
    const [goodReward, g$Reward ] = results[0]?.value
    const claimableRewards = {
      g$Reward: CurrencyAmount.fromRawAmount(G$[122], g$Reward),
      goodReward: CurrencyAmount.fromRawAmount(G$[122], goodReward).divide(1e16)
    }
    stakerInfo.claimable = claimableRewards
  }

  if (results[1]){
    const [principle] = results[1]?.value; //note: original deposit
    const deposit = CurrencyAmount.fromRawAmount(G$[122], principle)
    stakerInfo.principle = deposit
  }

  return {
    stats: stakerInfo
  }
}



  // {
  //   contract: contract,
  //   method: 'stakersInfo',
  //   args: [account]
  // },
  // {
  //   contract: contract,
  //   method: 'getSavings',
  //   args: []
  // },
  // {
  //   contract: contract,
  //   method: 'goodStakerInfo',
  //   args: [account]
  // },
  // if (!results.includes(undefined)) {
  //   // const [lastSharePrice, rewardsPaid] = results[0]?.value
  //   // const [balance] = results[0]?.value // note: total withdrawable amount
  //   // const [userInfo] = results[3]?.value
  //   // const earned = results[4]?.value // pendingGD only
  //   // const deposit = parseInt(userStake) / 1e6

  //   // const withdrawBalance = CurrencyAmount.fromRawAmount(G$[122], balance)
  //       // const paidRewards = {
  //   //   g$Minted: CurrencyAmount.fromRawAmount(G$[122], rewardsPaid),
  //   //   goodMinted: CurrencyAmount.fromRawAmount(G$[122], userInfo.rewardMinted).divide(1e16)
  //   // }

  //   const [goodReward, g$Reward ] = results[0]?.value
  //   const [principle] = results[1]?.value; //note: original deposit
  //   const deposit = CurrencyAmount.fromRawAmount(G$[122], principle)

  //   const claimableRewards = {
  //     g$Reward: CurrencyAmount.fromRawAmount(G$[122], g$Reward),
  //     goodReward: CurrencyAmount.fromRawAmount(G$[122], goodReward).divide(1e16)
  //   }

  //   const stakerInfo:StakerInfo = {
  //     // balance: withdrawBalance,
  //     claimable: claimableRewards,
  //     // rewardsPaid: paidRewards,
  //     principle: deposit
  //   }

  //   console.log('stakerInfo (sdk) -->', {stakerInfo})

  //   return {
  //     stats: stakerInfo,
  //     error: undefined
  //   }
  // } else {
