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
      const balance = (await contract.balanceOf(account)).toString()
      const hasBalance = balance !== '0'
      return hasBalance
    }
  }

  async onTokenTransfer( 
    account: string, 
    amount: string, 
    onSent?: (transactionHash: string) => void): Promise<void | Error> {

    const contract = this.getContract("GoodDollar") 
    const stakeContract = this.getContract("GoodDollarStaking") 
    try {
      const signer = await getSigner(this.signer, account)
      if (signer instanceof Error) return signer

      const callData = ethers.constants.HashZero
      const transfer = await contract.connect(signer)
                      .transferAndCall(stakeContract.address, amount, callData, {})
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
        const req = await contract.connect(signer).withdrawStake('100000', {})
      } catch (e) {
        console.log('withdraw savings failed -->', e)
      }
    }
  
  async getStakerInfo(account: string) {
    if (!account) return
    const contract = this.getContract("GoodDollarStaking")
    try {
      const req = await contract.stakersInfo(account).then((res) => {
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
