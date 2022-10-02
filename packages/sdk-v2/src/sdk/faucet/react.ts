import React, { useCallback, useEffect } from "react";
import { QueryParams, useCalls, useEtherBalance, useEthers, useGasPrice } from "@usedapp/core";
import { BigNumber, ethers } from "ethers";
import { Faucet } from "@gooddollar/goodprotocol/types";
import { first } from "lodash";
import { useGetContract, useGetEnvChainId } from "../base/react";
import { Envs } from "../constants";

//default wait roughly 10 minutes
export const useFaucet = async (refresh: QueryParams["refresh"] = 100) => {
  const gasPrice = useGasPrice({ refresh: "never" }) || BigNumber.from("1000000000");
  const minBalance = BigNumber.from("110000").mul(gasPrice);
  const { account, chainId } = useEthers();
  const balance = useEtherBalance(account, { refresh }); //refresh roughly once in 10 minutes
  const { connectedEnv, baseEnv } = useGetEnvChainId(); //get the env the user is connected to
  const faucet = useGetContract("Faucet", true, "base", connectedEnv) as Faucet;
  console.log("useFaucet", { account, connectedEnv, chainId, balance, minBalance, gasPrice, faucet: faucet?.address });
  const result = first(
    useCalls(
      [
        {
          contract: faucet,
          method: "canTop",
          args: [account || ethers.constants.AddressZero]
        }
      ].filter(_ => _.contract),
      { refresh: "never" }
    )
  );
  useEffect(() => {
    if (result?.value && account && balance && balance.lt(minBalance)) {
      const { backend } = Envs[baseEnv];
      console.log("topping wallet", { account, connectedEnv, balance, backend, baseEnv });

      fetch(backend + "/verify/topWallet", {
        method: "POST",
        body: JSON.stringify({ chainId, account }),
        headers: { "content-type": "application/json" }
      })
        .then(r => {
          console.log("topwallet result:", r);
        })
        .catch(e => {
          console.log("topping wallet failed:", e.message, e);
        });
    }
  }, [result, account, balance, baseEnv]);
};
