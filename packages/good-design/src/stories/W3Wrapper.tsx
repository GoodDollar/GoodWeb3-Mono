import { ExternalProvider, JsonRpcProvider } from "@ethersproject/providers";
import { Web3Provider } from "@gooddollar/web3sdk-v2";
import { Provider as PaperProvider } from "react-native-paper";
import * as ethers from "ethers";
import { View } from "react-native";
import React, { useState } from "react";

import { Celo, Fuse } from "@gooddollar/web3sdk-v2";
import { Config, Mainnet, useEthers } from "@usedapp/core";

interface PageProps {
  children: any;
  withMetaMask: boolean;
  env?: string;
}

const config: Config = {
  networks: [Mainnet, Fuse, Celo],
  readOnlyChainId: 42220,
  readOnlyUrls: {
    122: "https://rpc.fuse.io",
    42220: "https://forno.celo.org"
  }
};

export const W3Wrapper = ({ children, withMetaMask, env = "fuse" }: PageProps) => {
  const ethereum = (window as any).ethereum;
  const { account } = useEthers();
  const w: ethers.Wallet = ethers.Wallet.createRandom();
  const [newProvider, setProvider] = useState<JsonRpcProvider | undefined>();

  if (!withMetaMask) {
    const rpc = new ethers.providers.JsonRpcProvider("https://rpc.fuse.io");

    rpc.getSigner = () => w as any;
    setProvider(rpc);
  }

  if (withMetaMask && !account && !newProvider) {
    ethereum.request({ method: "eth_requestAccounts" }).then((r: Array<string>) => {
      if (r.length > 0) {
        setProvider(new ethers.providers.Web3Provider(ethereum as ExternalProvider, "any"));
      }
    });
  }

  return (
    <PaperProvider>
      <Web3Provider env={env} web3Provider={newProvider} config={config}>
        <View>{children}</View>
      </Web3Provider>
    </PaperProvider>
  );
};
