import { useEffect, useState, useContext } from "react";
import Web3 from "web3";
import { sample } from "lodash";
import { SupportedChainId, DAO_NETWORK } from "constants/chains";
import GdSdkContext from "./useGdSdkContext";
import { noop } from "lodash";

export interface RPC {
  MAINNET_RPC: string | undefined;
  FUSE_RPC: string | undefined;
}

export const defaultRPC = {
  [SupportedChainId.MAINNET]: sample(["https://cloudflare-eth.com", "https://rpc.ankr.com/eth"]),
  [SupportedChainId.FUSE]: sample(["https://fuse.liquify.com", "https://rpc.fuse.io"])
};

export const getRpc = (chainId: number): string => {
  switch (chainId) {
    case 122:
      return defaultRPC[chainId];
    default:
    case 1:
      return "https://rpc.ankr.com/eth";
  }
};

/**
 * Returns provider for chain.
 * @param {number | string} chainId Chain ID.
 */
export const useEnvWeb3 = (
  dao: DAO_NETWORK,
  activeWeb3?: any | undefined,
  activeChainId?: number
): [Web3 | null, SupportedChainId] => {
  const [web3, setWeb3] = useState<[any, SupportedChainId]>([null, 42220]);
  const { contractsEnv } = useContext(GdSdkContext);

  useEffect(() => {
    const getProvider = async () => {
      let provider,
        selectedChainId = SupportedChainId.MAINNET;
      if (dao === DAO_NETWORK.FUSE) {
        if (activeWeb3 && (activeChainId as number) === SupportedChainId.FUSE) {
          return setWeb3([activeWeb3, activeChainId as number]);
        } else provider = new Web3.providers.HttpProvider(getRpc(SupportedChainId.FUSE));
      } else {
        //"mainnet" contracts can be on different blockchains depending on env
        switch (contractsEnv) {
          case "production":
            if (activeWeb3 && activeChainId && SupportedChainId.MAINNET === (activeChainId as number)) {
              return setWeb3([activeWeb3, activeChainId as number]);
            }
            provider = new Web3.providers.HttpProvider(getRpc(SupportedChainId.MAINNET));
            selectedChainId = SupportedChainId.MAINNET;
            break;
          default:
            provider = new Web3.providers.HttpProvider(getRpc(SupportedChainId.MAINNET));
            selectedChainId = SupportedChainId.MAINNET;
            break;
        }
      }
      setWeb3([new Web3(provider), selectedChainId]);
    };

    getProvider().catch(noop);
  }, [activeWeb3, dao, activeChainId, contractsEnv]);

  return web3;
};
