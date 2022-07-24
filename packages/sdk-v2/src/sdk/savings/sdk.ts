import React from 'react'
import { ethers } from "ethers";
import { BaseSDK } from '../base/sdk'
import { getSigner } from '../base/react'


export class SavingsSDK extends BaseSDK {

  //simple helper for checking an active savings account
  async hasBalance(
    account:string
  ): Promise<boolean | undefined> {
    const contract = this.getContract("GoodDollarStaking")
    if (contract && account) {
      // note-to-self/TODO: Also check for rewards to be claimed // Is deposit and balanceOf equal? // Principle?
      const hasBalance = (await contract.balanceOf(account))._isBigNumber
      console.log('hasBalance -->', {hasBalance})
      return hasBalance
    }
  }

  async onTokenTransfer( 
    account: string, 
    amount: string, 
    donation: number,
    onSent?: (transactionHash: string) => void): Promise<void | Error> {
    console.log('token transfering . . .')

    const contract = this.getContract("GoodDollar") 
    const stakeContract = this.getContract("GoodDollarStaking") 

    console.log('onTokenTransfer -- stakeContract -->', {stakeContract})
      
    try {
      console.log('amount -->', {amount})
      const signer = await getSigner(this.signer, account)
      if (signer instanceof Error) return signer

      const donation = ethers.utils.defaultAbiCoder.encode(["uint32"], [50])
      const transfer = await contract.connect(signer)
                      // .callStatic
                      .transferAndCall(stakeContract.address, '100000', donation, {})
    } catch (e) {
      console.log('onTokenTransfer failed -->', {e}) 
      return new Error(e as any)
    }
  }
  
  async withdraw(
    account: string,
    amount: string,
    onSent?: (transactionHash: string) => void): Promise<void | Error> {
      const contract = this.getContract("GoodDollarStaking")
      try {
        const signer = await getSigner(this.signer, account)
        if (signer instanceof Error) return signer

        //note: if tx fails on limit, up the gasLimitBufferPercentage (see context config))
        const req = await contract.connect(signer).withdrawStake('100000', {}).then((res) => {
          console.log('withdraw savings res -->', {res})
        }).catch((e) => {console.log('withdraw req failed -->', {e})})
      } catch (e) {
        console.log('withdraw savings failed -->', e)
      }
    }
  
  async getStakerInfo(account: string) {
    if (!account) return
    const contract = this.getContract("GoodDollarStaking")
    try {
      const req = await contract.stakersInfo(account).then((res) => {
        console.log('stakers info -->', {res})
        return res
      })
      return req
    } catch (e) { console.log('get staker info failed', {e})}
  }
    
  // TODO: just for testing, remove if unused
  async getChainBlocksPerMonth() {
    const gdStaking = this.getContract("GoodDollarStaking");
    const blocksPerMonth = await gdStaking.getChainBlocksPerMonth()
    return gdStaking.getChainBlocksPerMonth();
  }
}


// notes
// --"for example APY=5% then per block = nroot(1+0.05,numberOfBlocksPerYear)"
// (avgDonoCalc) -- 50*stakeamount1+25*stakeamount2/(stakeamount1+stakeamount2)
