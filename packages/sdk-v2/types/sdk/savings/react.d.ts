import { QueryParams } from '@usedapp/core';
import { ethers } from 'ethers';
import { EnvKey } from '../base';
import { Currency, CurrencyAmount } from '@uniswap/sdk-core';
export interface StakerInfo {
    claimable: {
        g$Reward: CurrencyAmount<Currency> | any;
        goodReward: CurrencyAmount<Currency> | any;
    } | undefined;
    balance?: CurrencyAmount<Currency> | any;
    rewardsPaid?: {
        g$Minted: CurrencyAmount<Currency> | any;
        goodMinted: CurrencyAmount<Currency> | any;
    };
    deposit?: CurrencyAmount<Currency> | any;
    principle?: CurrencyAmount<Currency> | any;
    shares?: number | any;
    lastSharePrice?: number | any;
}
export interface GlobalStats {
    totalStaked: CurrencyAmount<Currency> | undefined;
    totalRewardsPaid: CurrencyAmount<Currency> | undefined;
    apy: number | undefined;
    lastUpdateBlock?: number;
    savings?: number;
}
export declare function useSavingsBalance(refresh?: QueryParams["refresh"], env?: EnvKey): {
    g$Balance: string;
    savingsBalance: string;
};
export declare const useSavingsFunctions: (chainId: number, env?: EnvKey) => {
    transfer: (amount: string) => Promise<ethers.providers.TransactionReceipt | undefined>;
    withdraw: (amount: string, address?: string) => Promise<ethers.providers.TransactionReceipt | undefined>;
    claim: () => Promise<ethers.providers.TransactionReceipt | undefined>;
    transferState: import("@usedapp/core").TransactionStatus;
    withdrawState: import("@usedapp/core").TransactionStatus;
    claimState: import("@usedapp/core").TransactionStatus;
};
export declare const useGlobalStats: (refresh: QueryParams["refresh"], chainId: number, env?: EnvKey) => {
    stats: undefined;
    error: any[];
} | {
    stats: GlobalStats;
    error: undefined;
};
export declare const useStakerInfo: (refresh: QueryParams["refresh"], account: string, chainId: number, env?: EnvKey) => {
    stats: undefined;
    error: any[];
} | {
    stats: StakerInfo;
    error: undefined;
};
//# sourceMappingURL=react.d.ts.map