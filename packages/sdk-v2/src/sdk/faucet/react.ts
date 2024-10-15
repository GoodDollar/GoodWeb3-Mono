import { Faucet } from "@gooddollar/goodprotocol/types";
import { QueryParams, useCalls, useEtherBalance, useEthers, useNotifications } from "@usedapp/core";
import { BigNumber } from "ethers";
import { maxBy, throttle } from "lodash";
import { useEffect, useMemo, useRef } from "react";
import useRefreshOrNever from "../../hooks/useRefreshOrNever";
import { useGasFees } from "../base/hooks/useGasFees";
import { useGetContract, useGetEnvChainId } from "../base/react";
import { Envs, SupportedChains } from "../constants";

const throttledFetch = throttle(fetch, 60000, { leading: true });

// default wait roughly 1 minute
export const useFaucet = async (refresh: QueryParams["refresh"] = 12) => {
  let refreshOrNever = useRefreshOrNever(refresh);
  const { notifications } = useNotifications();
  const latest = useMemo(() => maxBy(notifications, "submittedAt"), [notifications]);
  const lastNotification = useRef(latest?.submittedAt || 0);
  const { account, chainId } = useEthers();

  const { ethereum } = window as any;
  const isMinipay = ethereum?.isMiniPay;

  // if we connected wallet or did a tx then force a refresh
  if (latest && latest.type !== "transactionStarted" && latest?.submittedAt > lastNotification.current) {
    lastNotification.current = latest?.submittedAt;
    refreshOrNever = 1;
  }

  const balance = useEtherBalance(account, { refresh: refreshOrNever }); // refresh roughly once in 1 minute
  const { baseEnv } = useGetEnvChainId(); // get the env the user is connected to
  const faucet = useGetContract(chainId === SupportedChains.FUSE ? "FuseFaucet" : "Faucet", true, "base") as Faucet;

  const { gasPrice = BigNumber.from(5e9) } = useGasFees();
  const minBalance = BigNumber.from(chainId === 42220 ? "250000" : "150000").mul(gasPrice);

  const faucetResult = useCalls(
    [
      {
        contract: faucet,
        method: "canTop",
        args: [account]
      },
      {
        contract: faucet,
        method: "getToppingAmount",
        args: []
      }
    ].filter(_ => account && _.contract),
    { refresh: refreshOrNever }
  );

  useEffect(() => {
    if (!account || isMinipay) {
      return;
    }

    const [canTop, toppingAmount] = faucetResult.map(_ => _?.value?.[0] as boolean | BigNumber | undefined) || [];
    const threshold = (toppingAmount as BigNumber)?.mul(50)?.div(100) || minBalance;

    // console.log("useFacuet:", { canTop, toppingAmount, balance, threshold, minBalance, refreshOrNever });

    if (canTop && balance && balance.lte(threshold)) {
      const devEnv = baseEnv === "fuse" ? "development" : baseEnv;
      const { backend } = Envs[devEnv];

      throttledFetch(backend + "/verify/topWallet", {
        method: "POST",
        body: JSON.stringify({ chainId, account }),
        headers: { "content-type": "application/json" }
      })?.catch(e => {
        console.error("topping wallet failed:", e.message, e);
      });
    }
  }, [faucetResult, account, balance, baseEnv, chainId, minBalance]);
};
