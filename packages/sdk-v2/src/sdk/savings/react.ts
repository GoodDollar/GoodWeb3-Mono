import React, { useMemo, useContext, useEffect } from 'react'
import { useCall, useContractFunction, useCalls, QueryParams, useGasPrice} from '@usedapp/core'
// import { QueryParams } from '@usedapp/core'
import { useGetContract, useReadOnlySDK } from '../base/react'
import { ethers, BigNumber, FixedNumber } from 'ethers'
import { EnvKey } from '../base'
import { SavingsSDK } from './sdk'
import { GoodDollarStaking, IGoodDollar } from '@gooddollar/goodprotocol/types'
import usePromise from 'react-use-promise'
import { Currency, CurrencyAmount, Fraction, Percent, Token } from '@uniswap/sdk-core'

//TODO: update to proper types
export interface StakerInfo {
  deposit: number,
  shares: string,
  earnedRewards: number,
  earnedAfterDonation: number,
  totalToDonate: number
  rewardsPaid: number,
  rewardsDonated: number,
  avgDonationRatio: number,
  principle: CurrencyAmount<Currency> | any
}

// Savings definition
// note: Do we show global stats anywhere? (couldn't find it in the figma tbh)
// export type Stats = {
//   lastUpdatedBlock: number,
//   totalStaked: CurrencyAmount<Currency> | any,
//   totalShares: Fraction | any,
//   avgDonationRatio: Percent | any
// -- -- uint128 totalRewardsPaid;
// -- -- uint128 totalRewardsDonated;
// -- -- uint128 avgDonationRatio; note: where to 
// }

// export type GlobalStats = {

// }

//TODO: why is it possible to send transaction with a RO library?
export const useTransferAndCall = (env?: EnvKey) => {
  const gooddollar = useGetContract("GoodDollar", true, "savings", env) as IGoodDollar; 
  const gdStaking = useGetContract("GoodDollarStaking", true, "savings", env) as GoodDollarStaking;

  const {state, send} = useContractFunction(gooddollar, "transferAndCall")

  const transfer = (amount: string, donation: string) => send(gdStaking.address, amount, donation).then((res) => {
    return res
  })
  
  return { transfer, state }
}

export const useWithdrawSavings = (env?: EnvKey) => {
  const contract = useGetContract("GoodDollarStaking", true, "savings", env) as GoodDollarStaking
  const {state, send} = useContractFunction(contract, "withdrawStake", {transactionName: "Withdraw from savings"})
  // const gasPrice = useGasPrice()

  const withdraw = (amount: string) => send(amount).then((res) => {
    return res
  })

  return { withdraw, state }
}

export const useStakerInfo = (refresh: QueryParams["refresh"] = "never", account:string, env?: EnvKey) => {
  const contract = useGetContract("GoodDollarStaking", true, "savings", env) as GoodDollarStaking
  // console.log('useStakerInfo refresh -->', {refresh})

  const results = useCalls(
    [
      {
        contract: contract,
        method: 'stakersInfo',
        args: [account]
      },
      {
        contract: contract,
        method: 'getPrinciple',
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
    const [deposit, shares, rewardsPaid, rewardsDonated, avgDonationRatio] = results[0]?.value
    const [balance] = results[1]?.value; //note: balance is principle or deposit, whichever is greater
    const [earnedRewards, earnedRewardsAfterDonation] = results[2]?.value //q: any significant different over stakersInfo and this?
    // console.log('earned/earnedAfterDono -->', {earnedRewards: earnedRewards.toString(), afterDono: earnedRewardsAfterDonation.toString(),})
    // note: just for initial testing
    const depositAmount = parseInt(deposit) / 1e2;
    const donationRatio = parseInt(avgDonationRatio) / 1e18;
    const paidRewards = parseInt(rewardsPaid) / 1e2;
    const donatedRewards = parseInt(rewardsDonated) / 1e2;
    const rewardsEarned = parseInt(earnedRewards) / 1e2;
    const earnedAfterDonation = parseInt(earnedRewardsAfterDonation) / 1e2;
    const totalToDonate = rewardsEarned - (parseInt(earnedRewardsAfterDonation) / 1e2);

    const stakerInfo:StakerInfo = {
      deposit: depositAmount,
      shares: shares.toString(),
      earnedRewards: rewardsEarned,
      earnedAfterDonation: earnedAfterDonation,
      totalToDonate: totalToDonate, 
      rewardsPaid: paidRewards,
      rewardsDonated: donatedRewards,
      avgDonationRatio: donationRatio,
      principle: '0'
    }

    return {
      stats: stakerInfo,
      error: undefined
    }
  } else {
    return {
      stats: undefined,
      error: {
        stakersInfo: results[0]?.error,
        principle: results[1]?.error
      }
   }
  }
}
