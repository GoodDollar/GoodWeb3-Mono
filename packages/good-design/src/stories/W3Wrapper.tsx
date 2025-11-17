import { ExternalProvider, JsonRpcProvider } from "@ethersproject/providers";
import { Web3Provider } from "@gooddollar/web3sdk-v2";
import * as ethers from "ethers";
import { View } from "react-native";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";

import { Celo, Fuse, Xdc } from "@gooddollar/web3sdk-v2";
import { Config, Mainnet, useEthers } from "@usedapp/core";

interface PageProps {
  children: any;
  withMetaMask: boolean;
  env?: string;
}

const config: Config = {
  networks: [Mainnet, Fuse, Celo, Xdc],
  readOnlyChainId: 42220,
  readOnlyUrls: {
    122: "https://rpc.fuse.io",
    42220: "https://forno.celo.org",
    50: "https://rpc.xdc.network"
  }
};

export const W3Wrapper = ({ children, withMetaMask, env = "fuse" }: PageProps) => {
  const ethereum = useMemo(() => (window as any).ethereum, []);
  const { account } = useEthers();
  const wallet = useMemo(() => ethers.Wallet.createRandom(), []);
  const [newProvider, setProvider] = useState<JsonRpcProvider | undefined>();

  useEffect(() => {
    if (!withMetaMask) {
      const rpc = new ethers.providers.JsonRpcProvider("https://rpc.fuse.io");
      rpc.getSigner = () => wallet as any;
      setProvider(rpc);
      return;
    }

    if (withMetaMask && !account && !newProvider && ethereum?.request) {
      ethereum
        .request({ method: "eth_requestAccounts" })
        .then((r: Array<string>) => {
          if (r.length > 0) {
            setProvider(new ethers.providers.Web3Provider(ethereum as ExternalProvider, "any"));
          }
        })
        .catch((err: Error) => {
          console.error("Failed to request accounts:", err);
        });
    }
  }, [withMetaMask, account, newProvider, ethereum, wallet]);

  return (
    <Web3Provider env={env} web3Provider={newProvider} config={config}>
      <View>{children}</View>
    </Web3Provider>
  );
};
