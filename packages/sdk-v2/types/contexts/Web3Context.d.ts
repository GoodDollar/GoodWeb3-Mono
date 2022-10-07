import React from "react";
import { JsonRpcProvider, Web3Provider as W3Provider } from "@ethersproject/providers";
import { Config, Chain } from "@usedapp/core";
import { EnvKey } from "../sdk/base/sdk";
export declare type SwitchCallback = (id: number) => Promise<void>;
export declare type TxDetails = {
    txhash: string;
    title: string;
    description?: string;
    from: string;
    to: string;
    contract?: string;
    data?: any;
};
export declare type TxEmitter = {
    on: (cb: (tx: TxDetails) => void) => void;
    emit: (tx: TxDetails) => boolean;
};
declare type IWeb3Context = {
    setSwitchNetwork: (cb: SwitchCallback) => void;
    switchNetwork?: SwitchCallback;
    txEmitter: TxEmitter;
    env: EnvKey;
};
export declare const txEmitter: TxEmitter;
export declare const Web3Context: React.Context<IWeb3Context>;
declare type Props = {
    children: React.ReactNode;
    config: Config;
    web3Provider?: JsonRpcProvider | W3Provider;
    env?: EnvKey;
    switchNetworkRequest?: SwitchCallback;
};
export declare const Fuse: Chain;
export declare const Celo: Chain;
export declare const Web3Provider: ({ children, config, web3Provider, switchNetworkRequest, env }: Props) => JSX.Element;
export declare const useSwitchNetwork: () => {
    switchNetwork: SwitchCallback;
    setSwitchNetwork: (cb: SwitchCallback) => void;
};
export {};
//# sourceMappingURL=Web3Context.d.ts.map