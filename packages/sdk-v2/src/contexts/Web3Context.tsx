import React, { useContext, useEffect, useMemo, useState } from "react";
import { JsonRpcProvider, Web3Provider as W3Provider } from "@ethersproject/providers";
import { DAppProvider, Config, Chain, Mainnet, Ropsten, Kovan, useEthers, Goerli } from "@usedapp/core";
import EventEmitter from "eventemitter3";
import { EnvKey } from "../sdk/base/sdk";
/**
 * request to switch to network id
 * returns void if no result yet true/false if success
 */
export type SwitchCallback = (id: number) => Promise<void>;
export type TxDetails = {
  txhash: string;
  title: string;
  description?: string;
  from: string;
  to: string;
  contract?: string;
  data?: any;
};
export type TxEmitter = {
  on: (cb: (tx: TxDetails) => void) => void;
  emit: (tx: TxDetails) => boolean;
};

type IWeb3Context = {
  setSwitchNetwork: (cb: SwitchCallback) => void;
  switchNetwork?: SwitchCallback;
  txEmitter: TxEmitter;
  env: EnvKey;
};

const ee = new EventEmitter<string>();
export const txEmitter = {
  on: ee.on.bind(ee, "txs"),
  emit: ee.emit.bind(ee, "txs")
} as TxEmitter;

export const Web3Context = React.createContext<IWeb3Context>({
  switchNetwork: undefined,
  setSwitchNetwork: (cb: SwitchCallback) => undefined,
  txEmitter,
  env: "production"
});

type Props = {
  children: React.ReactNode;
  config: Config;
  web3Provider?: JsonRpcProvider | W3Provider;
  env?: EnvKey;
  switchNetworkRequest?: SwitchCallback;
};

export const Fuse: Chain = {
  chainId: 122,
  chainName: "Fuse",
  isTestChain: false,
  isLocalChain: false,
  multicallAddress: "0x3CE6158b7278Bf6792e014FA7B4f3c6c46fe9410",
  multicall2Address: "0x5ba1e12693dc8f9c48aad8770482f4739beed696",
  getExplorerAddressLink: (address: string) => `https://explorer.fuse.io/address/${address}`,
  getExplorerTransactionLink: (transactionHash: string) => `https://explorer.fuse.io/tx/${transactionHash}`
};

export const Celo: Chain = {
  chainId: 42220,
  chainName: "Celo",
  isTestChain: false,
  isLocalChain: false,
  multicallAddress: "0x75F59534dd892c1f8a7B172D639FA854D529ada3",
  multicall2Address: "0xE72f42c64EA3dc05D2D94F541C3a806fa161c49B",
  getExplorerAddressLink: (address: string) => `https://explorer.celo.org/address/${address}`,
  getExplorerTransactionLink: (transactionHash: string) => `https://explorer.celo.org/tx/${transactionHash}`
};

const getMulticallAddresses = (networks: Chain[] | undefined) => {
  const result: { [index: number]: string } = {};

  networks?.forEach(network => {
    result[network.chainId] = network.multicallAddress;
  });
  return result;
};

const getMulticall2Addresses = (networks: Chain[] | undefined) => {
  const result: { [index: number]: string } = {};
  networks?.forEach(network => {
    if (network.multicall2Address) {
      result[network.chainId] = network.multicall2Address;
    }
  });
  return result;
};

const Web3Connector = ({ web3Provider }: { web3Provider: JsonRpcProvider | void }) => {
  const { activate, deactivate, activateBrowserWallet, switchNetwork } = useEthers();
  useEffect(() => {
    if (web3Provider) {
      activate(web3Provider);
    }
  }, [web3Provider]);

  return null;
};
export const Web3Provider = ({ children, config, web3Provider, switchNetworkRequest, env = "production" }: Props) => {
  const [switchNetwork, setSwitchNetwork] = useState<SwitchCallback>();

  const setSwitcNetworkCallback = (cb: SwitchCallback) => setSwitchNetwork(() => cb);
  console.log('web3 provider check -->')
  //make sure we have Fuse and mainnet by default and the relevant multicall available from useConfig for useMulticallAtChain hook
  config.networks = [Fuse, Mainnet, Kovan, Ropsten, Goerli, Celo, ...(config.networks || [])];
  config.multicallVersion = config.multicallVersion ? config.multicallVersion : 1;
  config.readOnlyUrls = {
    122: "https://rpc.fuse.io",
    42220: "https://forno.celo.org",
    1: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    3: "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    5: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    42: "https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    ...config.readOnlyUrls
  };
  const defaultAddresses =
    config.multicallVersion === 1 ? getMulticallAddresses(config.networks) : getMulticall2Addresses(config.networks);
  config.multicallAddresses = { ...defaultAddresses, ...config.multicallAddresses };

  return (
    <DAppProvider config={config}>
      <Web3Connector web3Provider={web3Provider} />
      <Web3Context.Provider value={{ setSwitchNetwork: setSwitcNetworkCallback, switchNetwork, txEmitter, env }}>
        {children}
      </Web3Context.Provider>
    </DAppProvider>
  );
};

export const useSwitchNetwork = () => {
  const { switchNetwork: ethersSwitchNetwork } = useEthers();
  const { switchNetwork, setSwitchNetwork } = useContext(Web3Context);
  return { switchNetwork: switchNetwork || ethersSwitchNetwork, setSwitchNetwork };
};
