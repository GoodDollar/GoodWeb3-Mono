import React, { useEffect, useState } from "react";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Web3Provider } from "../contexts/Web3Context";

interface PageProps {
  children: any;
}

export const W3Wrapper = ({ children }: PageProps) => {
  const ethereum = (window as any).ethereum;
  const [provider, setProvider] = useState<JsonRpcProvider>();
  useEffect(() => {
    ethereum.request({ method: "eth_requestAccounts" }).then(async (r:Array<string>) => {
      // console.log("setting provider", r);
      if (r.length > 0) {
        setProvider(ethereum);
      }
    });
  }, []);
  return (
    <Web3Provider env={"fuse"} web3Provider={provider} config={{}}>
      <article>
        <section>{children}</section>
      </article>
    </Web3Provider>
  );
};
