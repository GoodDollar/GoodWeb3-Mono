import { BigNumber, Contract, ethers } from "ethers";
import { providers, Signer } from "ethers";
import { Envs } from "../constants";
import { IIdentity, UBIScheme } from "@gooddollar/goodprotocol/types";
export declare const CONTRACT_TO_ABI: {
    [key: string]: any;
};
export declare type EnvKey = string;
export declare type EnvValue = any;
export declare class ClaimSDK {
    provider: providers.JsonRpcProvider;
    env: typeof Envs[EnvKey];
    contracts: EnvValue;
    signer: Signer | void;
    constructor(provider: providers.JsonRpcProvider, envKey?: EnvKey);
    getContract(contractName: "UBIScheme"): UBIScheme;
    getContract(contractName: "Identity"): IIdentity;
    getContract(contractName: string): Contract;
    generateFVLink(firstName: string, callbackUrl?: string, popupMode?: boolean): Promise<string>;
    getFVLink(): {
        getLoginSig: () => Promise<string>;
        getFvSig: () => Promise<string>;
        getLink: (firstName: string, callbackUrl?: string, popupMode?: boolean) => string;
    };
    isAddressVerified(address: string): Promise<boolean>;
    checkEntitlement(address?: string): Promise<BigNumber>;
    getNextClaimTime(): Promise<Date>;
    claim(): Promise<ethers.ContractTransaction>;
}
//# sourceMappingURL=sdk.d.ts.map