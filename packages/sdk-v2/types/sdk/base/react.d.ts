import { Signer } from "ethers";
import { ClaimSDK } from "../claim/sdk";
import { SavingsSDK } from "../savings/sdk";
export declare const NAME_TO_SDK: {
    [key: string]: typeof ClaimSDK | typeof SavingsSDK;
};
declare type RequestedSdk = {
    sdk: ClaimSDK | SavingsSDK | undefined;
    readOnly: boolean;
};
export declare type SdkTypes = "claim" | "savings";
export declare const useReadOnlySDK: (type: SdkTypes, requestedChainId?: number) => RequestedSdk["sdk"];
export declare const useGetEnvChainId: (requestedChainId?: number) => {
    chainId: number;
    defaultEnv: string;
    connectedEnv: string;
    switchNetworkRequest: import("../../contexts").SwitchCallback | undefined;
};
export declare const useGetContract: (contractName: string, readOnly?: boolean, type?: SdkTypes, requestedChainId?: number) => import("ethers").Contract | undefined;
export declare const getSigner: (signer: void | Signer, account: string) => Promise<Error | Signer>;
export declare const useSDK: (readOnly?: boolean, type?: string, requestedChainId?: number) => RequestedSdk["sdk"];
export {};
//# sourceMappingURL=react.d.ts.map