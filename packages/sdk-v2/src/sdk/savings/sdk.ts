import React from 'react'
import Web3 from 'web3'
import { BigNumber, Contract, ethers } from "ethers";
import { providers, Signer } from "ethers";
import type {Web3Provider, JsonRpcSigner} from "@ethersproject/providers";
import { Currency, CurrencyAmount, Fraction, Percent, Token } from '@uniswap/sdk-core'
import { G$ContractAddresses } from '@gooddollar/web3sdk/dist/constants'

const mockStakingRewardsAbi = [
  // global ??
  'function sharePrice() view returns (uint256)',
  'function getRewardsDebts() view returns (uint256)',
  // staker
  'struct StakerInfo { ' +
  'uint128 deposit',
  'uint128 shares',
  'uint128 rewardsPaid',
  'uint128 rewardsDonated',
  'uint128 avgDonationRatio',
  ' } ',
  'function getPrinciple(address) view returns (uint256)',
  'mapping(address => StakerInfo) public returns stakerInfo'
]

const mockStakingAbi = [
  'function stake(uint256 _amount, uint32 _donationRatio)'
]

// notes
// --"for example APY=5% then per block = nroot(1+0.05,numberOfBlocksPerYear)"
// (avgDonoCalc) -- 50*stakeamount1+25*stakeamount2/(stakeamount1+stakeamount2)

// Contracts
// -- GoodDollarStaking
// -- -- 
// -- GoodDollarMintBurnWrapper
// -- --
// -- StakingRewardsFixedAPY
// -- -- globalStats {
// -- -- last block this staking contract was updated and rewards were calculated
// -- -- uint128 lastUpdateBlock; note: should this be shown?
// // total supply of active stakes
// -- -- uint128 totalStaked;
// -- -- uint128 totalShares;
// -- -- uint128 totalRewardsPaid;
// -- -- uint128 totalRewardsDonated;
// -- -- uint128 avgDonationRatio;
// -- -- uint256 principle; //total earning compounding interest; note: que?
// -- --}
// -- -- stakerStats {
// -- -- uint128 deposit; // the amount of user active stake
// -- -- uint128 shares;
// -- -- uint128 rewardsPaid; // rewards that accounted already so should be substracted
// -- -- uint128 rewardsDonated; //total rewards user has donated so far
// -- -- uint128 avgDonationRatio; //donation ratio per share
// -- --}

// Savings definition
// note: Do we show global stats anywhere? (couldn't find it in the figma tbh)
export type Stats = {
  lastUpdatedBlock: number,
  totalStaked: CurrencyAmount<Currency> | any,
  totalShares: Fraction | any,
  avgDonationRatio: Percent | any
// -- -- uint128 totalRewardsPaid;
// -- -- uint128 totalRewardsDonated;
// -- -- uint128 avgDonationRatio; note: where to 
}

// export type GlobalStats = {

// }

// TODO: remove any's, just for testing
export type StakerInfo = {
  g$Deposit: CurrencyAmount<Currency> | any,
  //shares,
  pendingEarned: {G$: CurrencyAmount<Currency>, GOOD: CurrencyAmount<Currency>} | any,
  totalDonated: CurrencyAmount<Currency> | any
  avgDonationRatio: Percent | any

}

export interface ProviderInterface {
  provider: Web3Provider,
  signer: JsonRpcSigner
}

export function wrapWeb3(web3: Web3): ProviderInterface {
  const provider = new ethers.providers.Web3Provider(web3.currentProvider as any)
  const signer = provider.getSigner()
  return {
    provider: provider,
    signer: signer
  }
}

export function getSavingsContracts(web3: Web3, name: string): Contract {
  const provider = wrapWeb3(web3);
  const savingsAddress = G$ContractAddresses(122, name)
  // todo: getABI
  let abi: string[] | undefined;
  switch(name) {
    case 'StakingRewardsFixedAPY':
      abi = mockStakingRewardsAbi
      break
    case 'GoodDollarStaking':
      abi = mockStakingAbi
      break;
  }

  if(abi){
    const contract = new ethers.Contract('0x00', abi, provider.signer) // note: signer or provider
    return contract
  } else {
    throw Error('Contract not found')
  }
}

export async function getSavingsStats(web3: Web3, network: string, chainId: number, account: string) {
  try {
    const contract = getSavingsContracts(web3, 'StakingRewardsFixedAPY')
    const result:any = []

    result.push(await getMyInfo(contract, account))
  
    return result
  } catch (e) {
    console.log(e)
  }
}


// getMyStats?
export async function getMyInfo(contract: Contract, account: string): Promise<StakerInfo> {
  const {0: deposit,
         1: shares,
         2: rewardsPaid,
         3: rewardsDonated,
         4: avgDonationRatio} = contract.stakerInfo(account)
  // note: not sure above or below
  // const stakerInfo = contract.stakerInfo(account);
  // const deposit = stakerInfo.deposit


  const result = {
    g$Deposit: '1m G$',
    pendingEarned: {G$: "500G$", GOOD: "200GOOD"},
    totalDonated: "250G$",
    avgDonationRatio: "50%"
  }

  return result
}

export function stake(web3: Web3, amount:string, donationRatio: Percent) {
  try {
    const contract = getSavingsContracts(web3, 'GoodDollarStaking')
  } catch (e) {
    console.log(e)
  }
}

export function transfer(web3: Web3, from: string, to: string) {
  const provider = wrapWeb3(web3)
}

export function withdraw(web3: Web3) {
  const provider = wrapWeb3(web3)
}

export function mintGDRewards(amount: string) {

}


export function getPrinciple() {

}

export function getRewardsDebts() {

}





// export class SavingsSDK {
//   // wrapper function for web3provider

//   // getStakingContract

//   // stake(amount, donationRatio) note: is it possible to set multiple stakes with different ratio?
//   // -- setDonationRatio
//   //

//   // transfer(from, to)

//   // withdraw stake(amount)

//   // mintGDRewards

//   // withdraw rewards

//   // getStaked note: 
//   // -- getUserPendingReward

//   // getPrinciple
//   // note -- how much to withdraw after reducing donations

//   // getRewardsDebts
//   // note -- interest earned and not paid

// }
