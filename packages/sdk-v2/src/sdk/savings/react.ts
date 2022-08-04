import React, { useMemo, useContext, useEffect, useCallback } from 'react'
import { useCall, useContractFunction, useCalls, QueryParams, useGasPrice} from '@usedapp/core'
// import { QueryParams } from '@usedapp/core'
import { useGetContract, useReadOnlySDK } from '../base/react'
import { ethers, BigNumber, FixedNumber, Contract } from 'ethers'
import { EnvKey } from '../base'
import { SavingsSDK } from './sdk'
import { GoodDollarStaking, IGoodDollar } from '@gooddollar/goodprotocol/types'
import usePromise from 'react-use-promise'
import { Currency, CurrencyAmount, Fraction, Percent, Token } from '@uniswap/sdk-core'
import { send } from 'process'

//TODO: update to proper types
export interface StakerInfo {
  deposit: number | any, //note: total balance??? (+ not withdrawn rewards)???
  shares: number | any,
  earned?: number | any,
  lastSharePrice?: number | any,
  rewardsPaid?: number,
  principle?: CurrencyAmount<Currency> | any
}

export interface GlobalStats {
  lastUpdateBlock: number,
  totalStaked: number,
  totalRewardsPaid: number,
  savings: number,
}

// Savings definition
// export type Stats = {
//   lastUpdatedBlock: number,
//   totalStaked: CurrencyAmount<Currency> | any,
//   totalShares: Fraction | any,
//   avgDonationRatio: Percent | any
// -- -- uint128 totalRewardsPaid;
// -- -- uint128 totalRewardsDonated;
// -- -- uint128 avgDonationRatio; note: where to 
// }


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
  const withdraw = useCallback(async(amount: string) => {
    const shares = await gdStaking.amountToShares(amount)
    return sendWithdraw(shares)
  }, [sendWithdraw]);
  const claim = useCallback(() => sendClaim(), [sendClaim])

  return { transfer, withdraw, claim, transferState, withdrawState, claimState }
}

// export const useTransferAndCall = (env?: EnvKey) => {
//   const gooddollar = useGetContract("GoodDollar", true, "savings", env) as IGoodDollar; 
//   const gdStaking = useGetContract("GoodDollarStaking", true, "savings", env) as GoodDollarStaking;

//   const {state, send} = useContractFunction(gooddollar, "transferAndCall")
//   const callData = ethers.constants.HashZero

//   const transfer = useCallback((amount: string) => send(gdStaking.address, amount, callData), [send, gdStaking])
//   return { transfer, state }
// }

// export const useWithdrawSavings = (env?: EnvKey) => {
//   const contract = useGetContract("GoodDollarStaking", true, "savings", env) as GoodDollarStaking
//   const {state, send} = useContractFunction(contract, "withdrawStake", {transactionName: "Withdraw from savings"})

//   const withdraw = useCallback(async (amount: string) => {
//     const shares = await contract.amountToShares(amount)
//     return send(shares)
//   }, [send, contract])

//   return { withdraw, state }
// }

// export const useWithdrawRewards = (env?: EnvKey) => {
//   const contract = useGetContract("GoodDollarStaking", true, "savings", env) as GoodDollarStaking
//   const {state, send} = useContractFunction(contract, "withdrawRewards", {transactionName: "Withdraw from savings"})

//   const withdrawRewards = useCallback(() => send(), [send, contract])

//   return { withdrawRewards, state }
// }

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
        method: 'sharesOf',
        args: [account]
      },
      {
        contract: contract,
        method: 'earned',
        args: [account]
      },
      {
        contract: contract,
        method: 'stats', // global
        args: []
      }
    ], { refresh }
  );

  console.log('stakerInfo -- useCalls-results -->', {results});
  if (results[0]?.error || results[1]?.error){
  }
  
  if (!results.includes(undefined)) {
    // todo: map results
    const [lastSharePrice, rewardsPaid] = results[0]?.value
    const [balance] = results[1]?.value; //note: estimated original deposit
    const [userStake, totalStake] = results[2]?.value
    const sharesOf = results[3]?.value
    const earned = results[4]?.value

    // TODO: use mulDiv or seperate helper
    const shares = parseFloat((parseInt(sharesOf) / 1e18).toString()).toFixed(18).replace(/(\.0+|0+)$/, '')
    const deposit = parseFloat((parseInt(userStake) / 1e6).toString()).toFixed(2)
    const lSharePrice = parseInt(lastSharePrice) / 1e18
    const earnedRewards = parseFloat((parseInt(earned) / 1e2).toString()).toFixed(2)
    const paidRewards = parseFloat((parseInt(rewardsPaid) / 1e2).toString()).toFixed(2)

    // note: just for initial testing
    // const sharesTest = sharesOf.muldiv(1, 18).toFixed(18) //note: global bootstrap doesn't seem to work
    // console.log('sharesTest -->', {sharesTest})
    // const depositAmount = parseInt(deposit) / 1e2; //note: shows rewards which are not claimable
    // const paidRewards = parseInt(rewardsPaid) / 1e2;
    // const rewardsEarned = parseInt(earnedRewards) / 1e2;

    const stakerInfo:StakerInfo = {
      deposit: deposit,
      shares: shares,
      lastSharePrice:  lSharePrice,
      earned: earnedRewards,
      // rewardsPaid: paidRewards
      // principle: '0'
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
