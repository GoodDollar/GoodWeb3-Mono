import * as React from "react";
import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig, WalletClient, useWalletClient } from "wagmi";
import { mainnet, celo, celoAlfajores } from "wagmi/chains";
import { providers } from "ethers";
import { Web3Provider, Props } from "../Web3Context";
export { useWeb3Modal } from "@web3modal/react";
export { useDisconnect } from "wagmi";

import { Chain } from "@wagmi/core";

export const fuse: Chain = {
  id: 122,
  name: "Fuse",
  network: "fuse",
  nativeCurrency: {
    decimals: 18,
    name: "Fuse",
    symbol: "FUSE"
  },
  rpcUrls: {
    public: { http: ["https://rpc.fuse.io"] },
    default: { http: ["https://rpc.fuse.io"] }
  },
  blockExplorers: {
    default: { name: "Fuse Explore", url: "https://explorer.fuse.io" }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 16146628
    }
  }
};

const walletClientToWeb3Provider = (walletClient: WalletClient) => {
  const { chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address
  };
  const provider = new providers.Web3Provider(transport, network);
  return provider;
};

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export const useEthersProvider = ({ chainId }: { chainId?: number } = {}) => {
  const { data: walletClient } = useWalletClient({ chainId });
  return React.useMemo(() => (walletClient ? walletClientToWeb3Provider(walletClient) : undefined), [walletClient]);
};

const Web3ProviderWrapper = ({ children, config, env = "production" }: Props) => {
  const provider = useEthersProvider();
  return (
    <Web3Provider config={config} env={env} web3Provider={provider}>
      {children}
    </Web3Provider>
  );
};
export const Web3ModalProvider = ({
  projectId,
  wagmiChains,
  children,
  config,
  env = "production"
}: Props & { wagmiChains?: Array<Chain>; projectId?: string }) => {
  const chains = wagmiChains || [mainnet, celo, fuse, celoAlfajores];
  projectId = projectId || process.env.REACT_APP_WC_PROJECTID || "62745569abcb6c8962cadf4d8568aad9";

  const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: w3mConnectors({ projectId, chains }),
    publicClient
  });

  const ethereumClient = new EthereumClient(wagmiConfig, chains);

  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <Web3ProviderWrapper config={config} env={env}>
          {children}
        </Web3ProviderWrapper>
      </WagmiConfig>

      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
};
