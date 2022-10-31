import { EnvKey } from "./base/sdk";
import { Token } from "@usedapp/core";
export declare enum SupportedChains {
    MAINNET = 1,
    FUSE = 122,
    CELO = 42220
}
export declare type SUPPORTED_NETWORKS = "FUSE" | "CELO" | "MAINNET";
export declare enum SupportedV2Networks {
    FUSE = 122,
    CELO = 42220
}
export interface G$Balances {
    G$: any;
    GOOD: any;
}
export declare const Envs: {
    [key: EnvKey]: {
        [key: string]: string;
    };
};
declare type ObjectLike = {
    [key: string]: string | ObjectLike | Array<string[]> | string[] | number;
};
export declare function G$(chainId: number, env?: string): Token;
export declare function GOOD(chainId: number, env?: string): Token;
export declare function G$ContractAddresses<T = ObjectLike>(name: string, env: EnvKey): T;
export {};
//# sourceMappingURL=constants.d.ts.map