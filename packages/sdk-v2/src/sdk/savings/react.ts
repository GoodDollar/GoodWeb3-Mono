import React, { useMemo, useContext, useEffect } from 'react'
import { useCall, useContractFunction, useCalls, QueryParams, useGasPrice} from '@usedapp/core'
// import { QueryParams } from '@usedapp/core'
import { useGetContract, useReadOnlySDK } from '../base/react'
import { ethers, BigNumber, FixedNumber } from 'ethers'
import { EnvKey } from '../base'
import { SavingsSDK } from './sdk'
import { GoodDollarStaking, IGoodDollar } from '@gooddollar/goodprotocol/types'
import usePromise from 'react-use-promise'

// interface StakerInfo {
//   deposit: BigNumber,
//   shares: BigNumber,
//   rewardsPaid: BigNumber, 
//   rewardsDonated: BigNumber,
//   avgDonationRatio: BigNumber
// }

// export type StakerInfo = {
//   g$Deposit: CurrencyAmount<Currency> | any,
//   //shares,
//   pendingEarned: {G$: CurrencyAmount<Currency>, GOOD: CurrencyAmount<Currency>} | any,
//   totalDonated: CurrencyAmount<Currency> | any
//   avgDonationRatio: Percent | any

// }

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

  const dono = ethers.utils.defaultAbiCoder.encode(["uint32"], [50])

  const transfer = (amount: string, donation: number) => send(gdStaking.address, amount, dono).then((res) => {
    console.log('transfer send . . .')
    return res
  })

  useEffect(() => {
    console.log('contractFunction -- state -->', {state})
  }, [state])
  
  return { transfer }
}

export const useWithdrawSavings = (env?: EnvKey) => {
  const contract = useGetContract("GoodDollarStaking", true, "savings", env) as GoodDollarStaking
  const {state, send} = useContractFunction(contract, "withdrawStake", {transactionName: "Withdraw from savings"})
  const gasPrice = useGasPrice()

  console.log('gasPrice -->', {gasPrice})

  const override = {
    gasLimit: '250000'
  }


  const withdraw = (amount: string) => send(amount).then((res) => {
    console.log('withdrawing stake . . .')
    return res
  })

  return { withdraw}
}

export const useStakerInfo = (refresh: QueryParams["refresh"] = "never", account:string, env?: EnvKey) => {
  const contract = useGetContract("GoodDollarStaking", true, "savings", env) as GoodDollarStaking
  const { value, error } = useCall({
    contract: contract,
    method: 'stakersInfo',
    args: [account]
  }, {refresh}) ?? {}
  // console.log('value -->', {value})
  // console.log('value -->', {error})
  
  if (value) {
    const [deposit, shares, rewardsPaid, rewardsDonated, avgDonationRatio] = value
    const depositAmount = parseInt(deposit.toFixed(2));
    const donationRatio = parseInt(avgDonationRatio.toFixed(18))
    const stakerInfo = {
      deposit: depositAmount,
      shares: shares.toString(),
      rewardsPaid: rewardsPaid.toString(),
      rewardsDonated: rewardsDonated.toString(),
      avgDonationRatio: donationRatio,
    }

    return {
      stakerInfo: stakerInfo
    }
  } else {
    return {
      stakerInfo: error
    }
  }
}
