import { QueryParams, CurrencyValue } from '@usedapp/core';
import { ethers } from 'ethers';
export interface StakerInfo {
    claimable: {
        g$Reward: CurrencyValue | any;
        goodReward: CurrencyValue | any;
    } | undefined;
    balance?: CurrencyValue | any;
    rewardsPaid?: {
        g$Minted: CurrencyValue | any;
        goodMinted: CurrencyValue | any;
    };
    deposit?: CurrencyValue | any;
    principle?: CurrencyValue | any;
    shares?: number | any;
    lastSharePrice?: number | any;
}
export interface GlobalStats {
    totalStaked: CurrencyValue | undefined;
    totalRewardsPaid: CurrencyValue | undefined;
    apy: number | undefined;
    lastUpdateBlock?: number;
    savings?: number;
}
export declare function useSavingsBalance(refresh?: QueryParams["refresh"]): {
    g$Balance: {
        value: undefined;
        error: Error;
    } | {
        value: any;
        error: undefined;
    };
    savingsBalance: {
        value: undefined;
        error: Error;
    } | {
        value: any;
        error: undefined;
    };
};
export declare const useSavingsFunctions: () => {
    transfer: (amount: string) => Promise<ethers.providers.TransactionReceipt | undefined>;
    withdraw: (amount: string, address?: string) => Promise<ethers.providers.TransactionReceipt | undefined>;
    claim: () => Promise<ethers.providers.TransactionReceipt | undefined>;
    transferState: import("@usedapp/core").TransactionStatus;
    withdrawState: import("@usedapp/core").TransactionStatus;
    claimState: import("@usedapp/core").TransactionStatus;
};
export declare const useGlobalStats: (refresh?: QueryParams["refresh"]) => {
    stats: undefined;
    error: any[];
} | {
    stats: GlobalStats;
    error: undefined;
};
export declare const useStakerInfo: (refresh: QueryParams["refresh"], account: string) => {
    stats: undefined;
    error: any[];
} | {
    stats: StakerInfo;
    error: undefined;
};
//# sourceMappingURL=react.d.ts.map