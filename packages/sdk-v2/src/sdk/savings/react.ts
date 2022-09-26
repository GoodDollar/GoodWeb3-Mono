import React, { useCallback } from 'react'
import { useContractFunction, useCalls, QueryParams, useEthers } from '@usedapp/core'
import { useGetContract } from '../base/react'
import { ethers } from 'ethers'
import { EnvKey } from '../base'
import { GoodDollarStaking, IGoodDollar } from '@gooddollar/goodprotocol/types'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { G$ } from '@gooddollar/web3sdk'
import { chainDefaultGasPrice } from '../constants'

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
  totalStaked: CurrencyAmount<Currency> | undefined,
  totalRewardsPaid: CurrencyAmount<Currency> | undefined,
  apy: number | undefined
  lastUpdateBlock?: number,
  savings?: number,
}

export function useSavingsBalance(refresh: QueryParams["refresh"] = "never", env?: EnvKey) {
  const { account } = useEthers()
  const gooddollar = useGetContract("GoodDollar", true, "savings", env) as IGoodDollar; 
  const gdStaking = useGetContract("GoodDollarStaking", true, "savings", env) as GoodDollarStaking;

  const results = useCalls(
    [
      {
        contract: gooddollar,
        method: 'balanceOf',
        args: [account]
      },
      {
        contract: gdStaking,
        method: 'getSavings',
        args: [account]
      }
    ]
  )

  const [balance = {value: 0, error:undefined}, sBalance = {value: 0, error: undefined}] = results
  
  return { g$Balance: balance, savingsBalance: sBalance }
}

export const useSavingsFunctions = (chainId: number, env?: EnvKey) => {
  const gooddollar = useGetContract("GoodDollar", false, "savings", env) as IGoodDollar;
  const gdStaking = useGetContract("GoodDollarStaking", false, "savings", env) as GoodDollarStaking;

  const {state: transferState, send: sendTransfer} = useContractFunction(gooddollar, "transferAndCall", {transactionName: "Transfer to savings"});
  const {state: withdrawState, send: sendWithdraw} = useContractFunction(gdStaking, "withdrawStake", {transactionName: "Withdraw from savings"});
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

export const useGlobalStats = (refresh: QueryParams["refresh"] = "never", chainId: number, env?: EnvKey) => {
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

  let globalStats:GlobalStats = {
    totalStaked: undefined,
    totalRewardsPaid: undefined,
    apy: undefined
  }


  if (results[0]?.error){ // one fails, all fails
    let errMessages: Array<any> = [];
    for (let i = 0; i < results.length; i++){
      errMessages.push(results[i]?.error)
    }

    return {
      stats: undefined,
      error: errMessages
    }
  }

  if (results[0]){
    const [lastUpdateBlock, totalStaked, totalRewardsPaid, savings] = results[0]?.value
    const staked = CurrencyAmount.fromRawAmount(G$[chainId], totalStaked)
    const rewardsPaid = CurrencyAmount.fromRawAmount(G$[chainId], totalRewardsPaid)
    globalStats.totalStaked = staked
    globalStats.totalRewardsPaid = rewardsPaid
  }

  if (results[1] && results[2]){
    const {_goodRewardPerBlock: grpb, _gdInterestRatePerBlock: gdIrpb} = results[1]?.value
    const numberOfBlocksPerYear = results[2]?.value
    const apy = (Math.pow((gdIrpb/1e18), numberOfBlocksPerYear) - 1) * 100

    globalStats.apy = apy
  }

  return {
    stats: globalStats,
    error: undefined
  }
}

export const useStakerInfo = (refresh: QueryParams["refresh"] = "never", account:string, chainId: number, env?: EnvKey) => {
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

  if (results[0]?.error){
    let errMessages: Array<any> = [];
    for (let i = 0; i < results.length; i++){
      errMessages.push(results[i]?.error)
    }

    return {
      stats: undefined,
      error: errMessages
    }
  }
  
  if (results[0]){
    const [goodReward, g$Reward ] = results[0]?.value
    const claimableRewards = {
      g$Reward: CurrencyAmount.fromRawAmount(G$[chainId], g$Reward),
      goodReward: CurrencyAmount.fromRawAmount(G$[chainId], goodReward).divide(1e16)
    }
    stakerInfo.claimable = claimableRewards
  }

  if (results[1]){
    const [principle] = results[1]?.value; //note: original deposit
    const deposit = CurrencyAmount.fromRawAmount(G$[chainId], principle)
    stakerInfo.principle = deposit
  }

  return {
    stats: stakerInfo,
    error: undefined
  }
}
