import React, { useEffect, useState } from "react";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Web3Provider } from "../contexts/Web3Context";
import * as ethers from "ethers";
interface PageProps {
  children: any;
  withMetaMask: boolean;
}

export const W3Wrapper = ({ children, withMetaMask }: PageProps) => {
  const ethereum = (window as any).ethereum;
  const [provider, setProvider] = useState<JsonRpcProvider>();
  useEffect(() => {
    const w: ethers.Wallet = ethers.Wallet.createRandom();
    console.log({ w, withMetaMask });
    if (!withMetaMask) {
      const rpc = new ethers.providers.JsonRpcProvider("https://rpc.fuse.io");
      rpc.getSigner = idx => {
        return w as any;
      };
      setProvider(rpc);
    }

    if (withMetaMask) {
      ethereum.request({ method: "eth_requestAccounts" }).then(async (r: Array<string>) => {
        console.log("setting metamask provider", r);
        if (r.length > 0) {
          setProvider(ethereum);
        }
      });
    }
  }, []);
  return (
    <Web3Provider env={"fuse"} web3Provider={provider} config={{}}>
      <article>
        <section>{children}</section>
      </article>
    </Web3Provider>
  );
};
