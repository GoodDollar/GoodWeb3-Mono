import { JsonRpcProvider, Web3Provider as W3Provider } from "@ethersproject/providers";
import { Chain, Config, DAppProvider, Mainnet, useEthers, useCalls, ChainId } from "@usedapp/core";
import EventEmitter from "eventemitter3";
import React, { createContext, FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { defaultsDeep, noop, sample } from "lodash";
import { ethers } from "ethers";
import { EnvKey } from "../sdk/base/sdk";
import { G$Decimals } from "../sdk/constants";
import { GoodReserveCDai, GReputation, IGoodDollar } from "@gooddollar/goodprotocol/types";
import { useGetContract } from "../sdk";
import { SupportedChains } from "../sdk/constants";
/**
 * request to switch to network id
 * returns void if no result yet true/false if success
 */
export type SwitchNetwork = (id: number) => Promise<void>;
export type SwitchCallback = (id: number, switchResult: any) => Promise<void>;

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
  setSwitchNetwork: (cb: SwitchNetwork) => void;
  switchNetwork?: SwitchNetwork;
  setOnSwitchNetwork?: (cb: () => SwitchCallback) => void;
  onSwitchNetwork?: SwitchCallback;
  connectWallet?: () => void;
  txEmitter: TxEmitter;
  env: EnvKey;
  web3Provider?: JsonRpcProvider | W3Provider;
};

const ee = new EventEmitter<string>();
export const txEmitter = {
  on: ee.on.bind(ee, "txs"),
  emit: ee.emit.bind(ee, "txs")
} as TxEmitter;

export const Web3Context = createContext<IWeb3Context>({
  switchNetwork: undefined,
  setSwitchNetwork: (_cb: SwitchNetwork) => undefined, // eslint-disable-line @typescript-eslint/no-unused-vars
  connectWallet: () => undefined,
  txEmitter,
  env: "production",
  web3Provider: undefined
});

export const useWeb3Context = () => useContext(Web3Context);

export const TokenContext = createContext<typeof G$Decimals>(defaultsDeep(G$Decimals));

export type Props = {
  children: React.ReactNode;
  config?: Config;
  web3Provider?: JsonRpcProvider | W3Provider;
  env?: EnvKey;
  switchNetworkRequest?: SwitchNetwork;
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
  getExplorerAddressLink: (address: string) => `https://celoscan.io/address/${address}`,
  getExplorerTransactionLink: (transactionHash: string) => `https://celoscan.io/tx/${transactionHash}`
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
  const { activate, deactivate } = useEthers();

  useEffect(() => {
    if (web3Provider) {
      activate(web3Provider).catch(noop);
    }

    return deactivate;
  }, [web3Provider]);

  return null;
};

const TokenProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { chainId } = useEthers();
  const g$Contract = useGetContract("GoodDollar", true, "base") as IGoodDollar;
  const goodContract = useGetContract("GReputation", true, "base") as GReputation;
  const gdxContract = useGetContract("GoodReserveCDai", true, "base", 1) as GoodReserveCDai;

  const { MAINNET } = SupportedChains;

  const results = useCalls(
    [
      {
        contract: g$Contract,
        method: "decimals",
        args: []
      },
      {
        contract: goodContract,
        method: "decimals",
        args: []
      }
    ],
    { refresh: "never", chainId }
  );

  const [mainnetGdx] = useCalls(
    [
      {
        contract: gdxContract,
        method: "decimals",
        args: []
      }
    ].filter(_ => _.contract),
    { refresh: "never", chainId: MAINNET as unknown as ChainId }
  );

  const value = useMemo(() => {
    const [g$, good] = results;

    if (chainId && mainnetGdx && results) {
      const newValue = defaultsDeep(
        {
          G$: {
            [chainId]: g$?.value?.[0]
          },
          GOOD: {
            [chainId]: good?.value?.[0]
          },
          GDX: {
            [MAINNET]: mainnetGdx?.value?.[0]
          }
        },
        G$Decimals
      );
      return newValue;
    }

    return G$Decimals;
  }, [results, chainId, mainnetGdx]);

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
};

const defaultConfig: Config = {
  networks: [Mainnet, Fuse, Celo],
  readOnlyChainId: Celo.chainId,
  pollingInterval: 15000,
  readOnlyUrls: {
    122: "https://rpc.fuse.io",
    42220: "https://forno.celo.org",
    1: "https://cloudflare-eth.com"
  }
};

export const Web3Provider = ({ children, config: inConfig, web3Provider, env = "production" }: Props) => {
  const config = defaultsDeep(inConfig, defaultConfig);
  const [switchNetwork, setSwitchNetwork] = useState<SwitchNetwork>();
  const [onSwitchNetwork, setOnSwitchNetwork] = useState<SwitchCallback>();

  const setSwitcNetworkCallback = useCallback((cb: SwitchNetwork) => setSwitchNetwork(() => cb), [setSwitchNetwork]);

  // use this to override usedapp default switchNetwork used in our custom web3contextprovider
  // this will work with both metamask and wallet connect
  const newSwitch = useCallback(
    async (chainId: number): Promise<any> => {
      if (!chainId) {
        return;
      }

      const hexId = "0x" + chainId.toString(16);

      return (web3Provider as any).provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexId }]
      });
    },
    [web3Provider]
  );

  // make sure we have Fuse and mainnet by default and the relevant multicall available from useConfig for useMulticallAtChain hook
  config.networks = config.networks || [Fuse, Mainnet, Celo];
  config.multicallVersion = config.multicallVersion ? config.multicallVersion : 1;
  config.gasLimitBufferPercentage = 10;
  config.readOnlyUrls = {
    122: sample(["https://rpc.fuse.io", "https://fuse-rpc.gateway.pokt.network"]) as string,
    42220: sample(["https://forno.celo.org"]) as string,
    1: sample(["https://cloudflare-eth.com", "https://rpc.ankr.com/eth"]) as string,
    ...config.readOnlyUrls
  };

  const defaultAddresses =
    config.multicallVersion === 1 ? getMulticallAddresses(config.networks) : getMulticall2Addresses(config.networks);

  config.multicallAddresses = { ...defaultAddresses, ...config.multicallAddresses };

  useEffect(() => {
    if (web3Provider instanceof ethers.providers.Web3Provider && web3Provider.provider.request) {
      setSwitchNetwork(() => newSwitch);
    }
  }, [web3Provider]);

  return (
    <DAppProvider config={config}>
      <Web3Connector web3Provider={web3Provider} />
      <Web3Context.Provider
        value={{
          setSwitchNetwork: setSwitcNetworkCallback,
          switchNetwork,
          onSwitchNetwork,
          setOnSwitchNetwork,
          txEmitter,
          env,
          web3Provider
        }}
      >
        <TokenProvider>{children}</TokenProvider>
      </Web3Context.Provider>
    </DAppProvider>
  );
};

// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
const onSwitchNetworkNoop = async (_chainId: number, _status?: boolean) => {};

export const useSwitchNetwork = () => {
  const { switchNetwork: ethersSwitchNetwork } = useEthers();
  const { switchNetwork, setSwitchNetwork, onSwitchNetwork, setOnSwitchNetwork } = useWeb3Context();
  const _onSwitchNetwork = onSwitchNetwork || onSwitchNetworkNoop;
  const _switchNetwork = switchNetwork || ethersSwitchNetwork;

  const switchCallback = useCallback(
    async (chainId: number) => {
      await _onSwitchNetwork(chainId);

      try {
        await _switchNetwork(chainId);
        await _onSwitchNetwork(chainId, true);
      } catch (e) {
        await _onSwitchNetwork(chainId, false);
        throw e;
      }
    },
    [_onSwitchNetwork, _switchNetwork]
  );

  return { switchNetwork: switchCallback, setSwitchNetwork, setOnSwitchNetwork };
};
