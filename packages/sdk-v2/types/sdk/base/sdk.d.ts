import { Contract } from "ethers";
import { providers, Signer } from "ethers";
import { Envs } from "../constants";
import { IIdentity, UBIScheme, GoodDollarStaking, IGoodDollar } from "@gooddollar/goodprotocol/types";
export declare const CONTRACT_TO_ABI: {
    [key: string]: any;
};
export declare type EnvKey = string;
export declare type EnvValue = any;
export declare class BaseSDK {
    provider: providers.JsonRpcProvider;
    env: typeof Envs[EnvKey];
    contracts: EnvValue;
    signer: Signer | void;
    constructor(provider: providers.JsonRpcProvider, envKey?: EnvKey);
    getContract(contractName: "UBIScheme"): UBIScheme;
    getContract(contractName: "Identity"): IIdentity;
    getContract(contractName: "GoodDollarStaking"): GoodDollarStaking;
    getContract(contractName: "GoodDollar"): IGoodDollar;
    getContract(contractName: string): Contract;
}
//# sourceMappingURL=sdk.d.ts.map