import { EnvKey } from "./base/sdk";
import { Token } from "@usedapp/core";
export declare enum SupportedChainId {
    FUSE = 122,
    CELO = 42220
}
export declare type SUPPORTED_NETWORKS = 'FUSE' | 'CELO';
export declare const Envs: {
    [key: EnvKey]: {
        [key: string]: string;
    };
};
declare type ObjectLike = {
    [key: string]: string | ObjectLike | Array<string[]> | string[];
};
export declare function G$(chainId: number, env: EnvKey): Token;
export declare function GOOD(chainId: number, env: EnvKey): Token;
export declare function G$ContractAddresses<T = ObjectLike>(chainId: SupportedChainId, name: string, env: EnvKey): T;
export {};
//# sourceMappingURL=constants.d.ts.map