import * as React from "react";
import { createAppKit } from "@reown/appkit/react";
import { mainnet, celo, fuse, AppKitNetwork } from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { useWalletClient, WagmiProvider } from "wagmi";
export { useAppKit as useWeb3Modal, useDisconnect } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { providers } from "ethers";
import { Web3Provider, Props } from "../Web3Context";
import { WalletClient } from "viem";

const queryClient = new QueryClient();

const walletClientToWeb3Provider = (walletClient: WalletClient) => {
  const { chain, transport } = walletClient;
  if (!chain) return;
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
  reownMetadata,
  appkitChains,
  children,
  config,
  env = "production"
}: Props & { appkitChains?: [AppKitNetwork, ...AppKitNetwork[]]; projectId?: string; reownMetadata?: any }) => {
  const chains: [AppKitNetwork, ...AppKitNetwork[]] = appkitChains || [mainnet, celo, fuse];
  projectId = projectId || process.env.REACT_APP_WC_PROJECTID || "62745569abcb6c8962cadf4d8568aad9";

  const wagmiAdapter = new WagmiAdapter({
    networks: chains,
    projectId
  });
  createAppKit({
    adapters: [wagmiAdapter],
    networks: chains,
    metadata: reownMetadata,
    projectId,
    features: {
      analytics: true
    }
  });

  return (
    <>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <Web3ProviderWrapper config={config} env={env}>
            {children}
          </Web3ProviderWrapper>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
};
