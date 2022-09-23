import { ethers } from "ethers";
import { BaseSDK } from '../base/sdk';
export declare class SavingsSDK extends BaseSDK {
    hasBalance(account: string): Promise<boolean | undefined>;
    onTokenTransfer(account: string, amount: string, onSent?: (transactionHash: string) => void): Promise<void | Error>;
    withdraw(account: string, amount: string, onSent?: (transactionHash: string) => void): Promise<void | Error>;
    getStakerInfo(account: string): Promise<([ethers.BigNumber, ethers.BigNumber] & {
        lastSharePrice: ethers.BigNumber;
        rewardsPaid: ethers.BigNumber;
    }) | undefined>;
}
//# sourceMappingURL=sdk.d.ts.map