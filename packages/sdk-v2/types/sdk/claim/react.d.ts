import { BigNumber, Contract, ethers } from "ethers";
import { QueryParams } from "@usedapp/core";
import { ClaimSDK, EnvKey } from "./sdk";
declare type ReadOnlyClaimSDK = ClaimSDK;
export declare const useSDK: (readOnly?: boolean, env?: EnvKey) => ClaimSDK;
export declare const useReadOnlySDK: (env?: EnvKey) => ReadOnlyClaimSDK;
export declare const useGetEnvChainId: (env?: EnvKey) => {
    chainId: any;
    defaultEnv: string;
    switchNetworkRequest: import("../../contexts/Web3Context").SwitchCallback | undefined;
};
export declare const useGetContract: (contractName: string, readOnly?: boolean, env?: EnvKey) => Contract;
export declare const useFVLink: () => {
    getLoginSig: () => Promise<string>;
    getFvSig: () => Promise<string>;
    getLink: (firstName: string, callbackUrl?: string | undefined, popupMode?: boolean) => string;
};
export declare const useIsAddressVerified: (address: string, env?: EnvKey) => [undefined, undefined, "pending"] | [undefined, Error, "rejected"] | [boolean | undefined, undefined, "resolved"];
export declare const useClaim: (refresh?: QueryParams["refresh"]) => {
    isWhitelisted: boolean;
    claimAmount: BigNumber;
    claimTime: Date;
    claimCall: {
        send: (overrides?: (ethers.Overrides & {
            from?: string | Promise<string> | undefined;
        }) | undefined) => Promise<ethers.providers.TransactionReceipt | undefined>;
        state: import("@usedapp/core").TransactionStatus;
        events: ethers.utils.LogDescription[] | undefined;
        resetState: () => void;
    };
};
export {};
//# sourceMappingURL=react.d.ts.map