import { Signer } from "ethers";
import { BaseSDK } from "./sdk";
import { QueryParams, CurrencyValue, Currency, Token } from "@usedapp/core";
import { ClaimSDK } from "../claim/sdk";
import { SavingsSDK } from "../savings/sdk";
import { SupportedV2Networks } from "../constants";
export declare const NAME_TO_SDK: {
    [key: string]: typeof ClaimSDK | typeof SavingsSDK | typeof BaseSDK;
};
declare type RequestedSdk = {
    sdk: ClaimSDK | SavingsSDK | BaseSDK | undefined;
    readOnly: boolean;
};
export declare type SdkTypes = "claim" | "savings" | "base";
export declare const useReadOnlySDK: (type: SdkTypes, requiredChainId?: number) => RequestedSdk["sdk"];
export declare const useGetEnvChainId: (requiredChainId?: number, v2Supported?: (string | SupportedV2Networks)[]) => {
    chainId: number;
    defaultEnv: string;
    baseEnv: string;
    connectedEnv: string;
    switchNetworkRequest: import("../../contexts").SwitchCallback | undefined;
};
export declare const useGetContract: (contractName: string, readOnly?: boolean, type?: SdkTypes, requiredChainId?: number) => import("ethers").Contract | undefined;
export declare const getSigner: (signer: void | Signer, account: string) => Promise<Signer | Error>;
export declare const useSDK: (readOnly?: boolean, type?: SdkTypes, requiredChainId?: number | undefined) => RequestedSdk["sdk"];
export declare function useG$Tokens(): {
    g$: Token;
    good: Token;
    gdx: Token;
};
export declare function useG$Balance(refresh?: QueryParams["refresh"]): {
    g$balance: {
        amount: CurrencyValue;
        token: Currency;
    };
    goodBalance: {
        amount: CurrencyValue;
        token: Currency;
    };
    gdxBalance: undefined;
    g$Balance?: undefined;
} | {
    g$Balance: undefined;
    goodBalance: undefined;
    gdxBalance: undefined;
    g$balance?: undefined;
};
export {};
//# sourceMappingURL=react.d.ts.map