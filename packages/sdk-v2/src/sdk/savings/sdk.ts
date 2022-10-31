import React from "react";
import { ethers } from "ethers";
import { BaseSDK } from "../base/sdk";

export class SavingsSDK extends BaseSDK {
  //simple helper for checking an active savings account
  async hasBalance(account: string): Promise<boolean | undefined> {
    const contract = this.getContract("GoodDollarStaking");
    if (contract && account) {
      const balance = (await contract.balanceOf(account)).toString();
      const hasBalance = balance !== "0";
      return hasBalance;
    }
  }

  async onTokenTransfer(
    amount: string,
    onSent?: (transactionHash: string) => void
  ): Promise<ethers.ContractTransaction | Error> {
    const contract = this.getContract("GoodDollar");
    const stakeContract = this.getContract("GoodDollarStaking");

    try {
      const callData = ethers.constants.HashZero;

      const transfer = contract.transferAndCall(stakeContract.address, amount, callData);
      return transfer;
    } catch (e) {
      console.log("onTokenTransfer failed -->", { e });
      return new Error(e as any);
    }
  }

  async withdraw(
    amount: string,
    isFullWithdraw: boolean,
    onSent?: (transactionHash: string) => void
  ): Promise<ethers.ContractTransaction | Error> {
    const contract = this.getContract("GoodDollarStaking");
    try {
      //note: if tx fails on limit, up the gasLimitBufferPercentage (see context config))
      let shares = isFullWithdraw
        ? await contract.sharesOf(await contract.signer.getAddress())
        : await contract.amountToShares(amount);
      const withdraw = contract.withdrawStake(shares);
      return withdraw;
    } catch (e) {
      console.log("withdraw savings failed -->", e);
      return new Error(e as any);
    }
  }

  async getStakerInfo(account: string) {
    if (!account) return;
    const contract = this.getContract("GoodDollarStaking");
    try {
      const req = await contract.stakersInfo(account).then(res => {
        return res;
      });
      return req;
    } catch (e) {
      console.log("get staker info failed", { e });
    }
  }
}
