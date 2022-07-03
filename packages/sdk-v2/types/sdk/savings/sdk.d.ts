import Web3 from 'web3';
import { Contract } from "ethers";
import type { Web3Provider, JsonRpcSigner } from "@ethersproject/providers";
import { Currency, CurrencyAmount, Fraction, Percent } from '@uniswap/sdk-core';
export declare type Stats = {
    lastUpdatedBlock: number;
    totalStaked: CurrencyAmount<Currency> | any;
    totalShares: Fraction | any;
    avgDonationRatio: Percent | any;
};
export declare type StakerInfo = {
    g$Deposit: CurrencyAmount<Currency> | any;
    pendingEarned: {
        G$: CurrencyAmount<Currency>;
        GOOD: CurrencyAmount<Currency>;
    } | any;
    totalDonated: CurrencyAmount<Currency> | any;
    avgDonationRatio: Percent | any;
};
export interface ProviderInterface {
    provider: Web3Provider;
    signer: JsonRpcSigner;
}
export declare function wrapWeb3(web3: Web3): ProviderInterface;
export declare function getSavingsContracts(web3: Web3, name: string): Contract;
export declare function getSavingsStats(web3: Web3, network: string, chainId: number, account: string): Promise<any>;
export declare function getMyInfo(contract: Contract, account: string): Promise<StakerInfo>;
export declare function stake(web3: Web3, amount: string, donationRatio: Percent): void;
export declare function transfer(web3: Web3, from: string, to: string): void;
export declare function withdraw(web3: Web3): void;
export declare function mintGDRewards(amount: string): void;
export declare function getPrinciple(): void;
export declare function getRewardsDebts(): void;
//# sourceMappingURL=sdk.d.ts.map