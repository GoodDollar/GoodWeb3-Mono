import { ethers } from "ethers";
import { BaseSDK } from '../base/sdk';
export declare class SavingsSDK extends BaseSDK {
    hasBalance(account: string): Promise<boolean | undefined>;
    onTokenTransfer(amount: string, onSent?: (transactionHash: string) => void): Promise<ethers.ContractTransaction | Error>;
    withdraw(amount: string, isFullWithdraw: boolean, onSent?: (transactionHash: string) => void): Promise<ethers.ContractTransaction | Error>;
    getStakerInfo(account: string): Promise<([ethers.BigNumber, ethers.BigNumber] & {
        lastSharePrice: ethers.BigNumber;
        rewardsPaid: ethers.BigNumber;
    }) | undefined>;
}
//# sourceMappingURL=sdk.d.ts.map