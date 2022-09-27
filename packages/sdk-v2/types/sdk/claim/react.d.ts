import { BigNumber, ethers } from "ethers";
import { QueryParams } from "@usedapp/core";
import { EnvKey } from "../base/sdk";
export declare const useFVLink: () => {
    getLoginSig: () => Promise<string>;
    getFvSig: () => Promise<string>;
    getLink: (firstName: string, callbackUrl?: string | undefined, popupMode?: boolean) => string;
};
export declare const useIsAddressVerified: (address: string, env?: EnvKey) => [undefined, undefined, "pending"] | [undefined, Error, "rejected"] | [boolean | undefined, undefined, "resolved"];
export declare const useClaim: (refresh?: QueryParams["refresh"], env?: EnvKey) => {
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
//# sourceMappingURL=react.d.ts.map