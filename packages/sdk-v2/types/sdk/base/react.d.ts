import { Signer } from "ethers";
import { BaseSDK, EnvKey } from "./sdk";
import { ClaimSDK } from "../claim/sdk";
import { SavingsSDK } from "../savings/sdk";
export declare const NAME_TO_SDK: {
    [key: string]: typeof ClaimSDK | typeof SavingsSDK | typeof BaseSDK;
};
declare type RequestedSdk = {
    sdk: ClaimSDK | SavingsSDK | BaseSDK | undefined;
    readOnly: boolean;
};
export declare type SdkTypes = "claim" | "savings" | "base";
export declare const useReadOnlySDK: (type: SdkTypes, requiredChainId?: number) => RequestedSdk["sdk"];
export declare const useGetEnvChainId: (requiredChainId?: number) => {
    chainId: number;
    defaultEnv: string;
    baseEnv: string;
    connectedEnv: string;
    switchNetworkRequest: import("../../contexts").SwitchNetwork | undefined;
};
export declare const useGetContract: (contractName: string, readOnly?: boolean, type?: SdkTypes, env?: EnvKey, requiredChainId?: number) => import("ethers").Contract | undefined;
export declare const getSigner: (signer: void | Signer, account: string) => Promise<Error | Signer>;
export declare const useSDK: (readOnly?: boolean, type?: SdkTypes, requiredChainId?: number | undefined) => RequestedSdk["sdk"];
export {};
//# sourceMappingURL=react.d.ts.map