import React, { useCallback } from 'react'
import { useCall, useContractFunction, useCalls, QueryParams } from '@usedapp/core'
// import { QueryParams } from '@usedapp/core'
import { useGetContract, useReadOnlySDK } from '../base/react'
import { ethers, BigNumber, FixedNumber, Contract } from 'ethers'
import { EnvKey } from '../base'
import { SavingsSDK } from './sdk'
import { GoodDollarStaking, IGoodDollar } from '@gooddollar/goodprotocol/types'
import { Currency, CurrencyAmount, Fraction, Percent, Token } from '@uniswap/sdk-core'

//TODO: update to proper types
export interface StakerInfo {
  balance: number | any,
  earned: number | any, 
  rewardsPaid: number,
  deposit?: number | any,
  principle?: CurrencyAmount<Currency> | any
  shares?: number | any,
  lastSharePrice?: number | any
}

export interface GlobalStats {
  totalStaked: number,
  totalRewardsPaid: number,
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
  }

  if (!results.includes(undefined)) {
    const [lastUpdateBlock, totalStaked, totalRewardsPaid, savings] = results[0]?.value
    const {_goodRewardPerBlock: grpb, _gdInterestRatePerBlock: gdIrpb} = results[1]?.value
    const numberOfBlocksPerYear = results[2]?.value
    const apy = (Math.pow((gdIrpb/1e18), numberOfBlocksPerYear) - 1) * 100
    const staked = totalStaked / 1e2
    const rewardsPaid = totalRewardsPaid / 1e2

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
  //Todo: chop up to minimize failed calls
  //Todo: add goodStakerInfo
  const results = useCalls(
    [
      {
        contract: contract,
        method: 'stakersInfo',
        args: [account]
      },
      {
        contract: contract,
        method: 'principle',
        args: [account]
      },
      {
        contract: contract,
        method: 'getStaked',
        args: [account],
      },
      {
        contract: contract,
        method: 'getSavings',
        args: [account]
      },
      {
        contract: contract,
        method: 'earned',
        args: [account]
      }
    ], { refresh }
  );

  // console.log('stakerInfo -- useCalls-results -->', {results});
  if (results[0]?.error || results[1]?.error){
  }
  
  if (!results.includes(undefined)) {
    const [lastSharePrice, rewardsPaid] = results[0]?.value
    const [principle] = results[1]?.value; //note: original deposit
    const [userStake, totalStake] = results[2]?.value
    const [balance] = results[3]?.value // note: total withdrawable amount
    const earned = results[4]?.value // pending

    // const deposit = parseInt(userStake) / 1e6
    const withdrawBalance = parseInt(balance) / 1e2
    const earnedRewards = parseInt(earned) / 1e2 
    const paidRewards = parseInt(rewardsPaid) / 1e2

    const stakerInfo:StakerInfo = {
      balance: withdrawBalance,
      earned: earnedRewards,
      rewardsPaid: paidRewards
    }

    return {
      stats: stakerInfo,
      error: undefined
    }
  } else {
    return {
      stats: undefined,
      error: results
   }
  }
}
