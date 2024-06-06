import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useEthers } from "@usedapp/core";
import { IGoodDollar } from "@gooddollar/goodprotocol/types";
import { useGetContract, useGetEnvChainId } from "@gooddollar/web3sdk-v2";
import { Lock } from "async-await-mutex-lock";

import { G$Amount } from "@gooddollar/web3sdk-v2";

const pollLock = new Lock();

const g$BalanceFromExplorer = async (account: string | undefined, contracts: string[]) => {
  if (!account || pollLock.isAcquired("balancePoll")) return null;
  const explorerEndpoint = "https://api.celoscan.io/api?";
  const fuseExplorer = "https://explorer.fuse.io/api?";

  await pollLock.acquire("balancePoll");
  let [fuseBalance, celoBalance]: any = [null, null];
  try {
    const params = new URLSearchParams({
      module: "account",
      action: "tokenbalance",
      address: account,
      tag: "latest"
      // apikey: "YourApiKeyToken"
    }).toString();

    const fuseUrl = `${fuseExplorer}${params}&contractaddress=${contracts[0]}`;
    const celoUrl = `${explorerEndpoint}${params}&contractaddress=${contracts[1]}`;

    const fuseResult = fetch(fuseUrl).then(res => res.json());
    const celoResult = fetch(celoUrl).then(res => res.json());

    [fuseBalance, celoBalance] = await Promise.all([fuseResult, celoResult]);
  } finally {
    pollLock.release("balancePoll");
  }

  return { fuse: fuseBalance, celo: celoBalance };
};

export const useBalanceHook = () => {
  const { account, chainId } = useEthers();
  const { defaultEnv } = useGetEnvChainId();
  const gdFuse = useGetContract("GoodDollar", true, "base", 122) as IGoodDollar;
  const gdCelo = useGetContract("GoodDollar", true, "base", 42220) as IGoodDollar;
  const [balances, setBalance] = useState<any>(null);

  useEffect(() => {
    setBalance(null);
    if (chainId && account && gdFuse && gdCelo && !balances) {
      void (async () => {
        const balance = await g$BalanceFromExplorer(account, [gdFuse.address, gdCelo.address]);
        const { fuse, celo } = balance || {};
        const [fuseResult, celoResult] = [fuse?.result, celo?.result];
        const balanceValues = [ethers.BigNumber.from(fuseResult), ethers.BigNumber.from(celoResult)];

        const newBalances = {
          fuse: {
            wei: fuseResult,
            gdValue: G$Amount("G$", balanceValues[0], 122, defaultEnv)
          },
          celo: {
            wei: celoResult,
            gdValue: G$Amount("G$", balanceValues[1], 42220, defaultEnv)
          }
        };

        setBalance(newBalances);
      })();
    }
  }, [/*used*/ chainId, gdFuse, gdCelo]);

  return balances;
};
