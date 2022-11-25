import React, { useState } from "react";
import { View } from "native-base";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Web3Provider } from "@gooddollar/web3sdk-v2";
import * as ethers from "ethers";
import { ExternalProvider } from "@ethersproject/providers";

import { Config, Mainnet, Goerli, useEthers } from "@usedapp/core";
import { Fuse, Celo } from "@gooddollar/web3sdk-v2";
import { getDefaultProvider } from "ethers";

interface PageProps {
  children: any;
  withMetaMask: boolean;
  env?: string;
}

const config: Config = {
  networks: [Goerli, Mainnet, Fuse, Celo],
  readOnlyChainId: undefined,
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
    rpc.getSigner = idx => {
      return w as any;
    };
    setProvider(rpc);
  }

  if (withMetaMask && !account && !newProvider) {
    ethereum.request({ method: "eth_requestAccounts" }).then((r: Array<string>) => {
      if (r.length > 0) {
        setProvider(new ethers.providers.Web3Provider(ethereum as ExternalProvider, "any"));
      }
    });
  }

  // const provider = newProvider ?? new ethers.providers.Web3Provider(ethereum as ExternalProvider, "any");

  return (
    <Web3Provider env={env} web3Provider={newProvider} config={config}>
      <View>{children}</View>
    </Web3Provider>
  );
};
