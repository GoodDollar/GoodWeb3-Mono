import { Faucet } from "@gooddollar/goodprotocol/types";
import { QueryParams, useCalls, useEthers, useNotifications } from "@usedapp/core";
import { BigNumber } from "ethers";
import { maxBy, throttle } from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import useRefreshOrNever from "../../hooks/useRefreshOrNever";
import { useGasFees } from "../base/hooks/useGasFees";
import { useGetContract, useGetEnvChainId } from "../base/react";
import { Envs, SupportedChains } from "../constants";

const throttledFetch = throttle(fetch, 60000, { leading: true });

// default wait roughly 1 minute
export const useFaucet = (refresh: QueryParams["refresh"] = 12) => {
  const [refreshRate, setRefreshRate] = useState(refresh);
  const refreshOrNever = useRefreshOrNever(refreshRate);
  const { notifications } = useNotifications();
  const latest = useMemo(() => maxBy(notifications, "submittedAt"), [notifications]);
  const lastNotification = useRef(latest?.submittedAt || 0);
  const { account, chainId, library } = useEthers();

  const { ethereum } = window as any;
  const isMinipay = ethereum?.isMiniPay;

  // if we connected wallet or did a tx then force a refresh
  if (
    library &&
    account &&
    latest &&
    latest.type !== "transactionStarted" &&
    latest?.submittedAt > lastNotification.current
  ) {
    lastNotification.current = latest?.submittedAt;
    setRefreshRate(1);
  }

  const { baseEnv } = useGetEnvChainId(); // get the env the user is connected to
  const faucet = useGetContract(chainId === SupportedChains.FUSE ? "FuseFaucet" : "Faucet", true, "base") as Faucet;

  const { gasPrice = BigNumber.from(25.001e9) } = useGasFees();
  const minBalance = BigNumber.from(chainId === 42220 ? "250000" : "150000").mul(gasPrice);

  const faucetResult = useCalls(
    [
      {
        contract: faucet,
        method: "minTopping",
        args: []
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
    const check = async () => {
      const balance = await library?.getBalance(account);
      const [minTopping, toppingAmount] =
        faucetResult.map(_ => _?.value?.[0] as boolean | BigNumber | number | undefined) || [];
      const threshold = (toppingAmount as BigNumber)?.mul(100 - (minTopping as number))?.div(100) || minBalance;

      // console.log("useFacuet:", { canTop, toppingAmount, balance, threshold, minBalance, refreshOrNever });

      if (balance?.lte(threshold)) {
        const devEnv = baseEnv === "fuse" ? "development" : baseEnv;
        const { backend } = Envs[devEnv];

        await throttledFetch(backend + "/verify/topWallet", {
          method: "POST",
          body: JSON.stringify({ chainId, account }),
          headers: { "content-type": "application/json" }
        })?.catch(e => {
          console.error("topping wallet failed:", e.message, e);
        });
        setRefreshRate(refresh);
      }
      if (balance?.gt(threshold)) {
        setRefreshRate(refresh);
      }
    };

    void check();
  }, [faucetResult, account, baseEnv, chainId, minBalance.toString(), library, lastNotification.current]);
};
