import { EnvKey } from "./base/sdk";
import { Token } from "@usedapp/core";
export declare const SupportedChains: {
    MAINNET: number;
    ROPSTEN: number;
    KOVAN: number;
    FUSE: number;
    CELO: number;
};
export declare type SUPPORTED_NETWORKS = 'FUSE' | 'CELO' | 'MAINNET' | 'KOVAN' | 'ROPSTEN';
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
export declare function G$ContractAddresses<T = ObjectLike>(chainId: number, name: string, env: EnvKey): T;
export {};
//# sourceMappingURL=constants.d.ts.map