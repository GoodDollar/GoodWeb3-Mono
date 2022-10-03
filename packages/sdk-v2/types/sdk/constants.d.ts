import { EnvKey } from "./base/sdk";
import { Token } from "@usedapp/core";
export declare enum SupportedChains {
    MAINNET = 1,
    ROPSTEN = 3,
    KOVAN = 42,
    FUSE = 122,
    CELO = 42220
}
export declare type SUPPORTED_NETWORKS = "FUSE" | "CELO" | "MAINNET" | "KOVAN" | "ROPSTEN";
export declare enum SupportedV2Networks {
    FUSE = 122,
    CELO = 42220
}
export declare const Envs: {
    [key: EnvKey]: {
        [key: string]: string;
    };
};
declare type ObjectLike = {
    [key: string]: string | ObjectLike | Array<string[]> | string[] | number;
};
export declare function G$(chainId: number, env: EnvKey): Token;
export declare function GOOD(chainId: number, env: EnvKey): Token;
export declare function G$ContractAddresses<T = ObjectLike>(name: string, env: EnvKey): T;
export {};
//# sourceMappingURL=constants.d.ts.map