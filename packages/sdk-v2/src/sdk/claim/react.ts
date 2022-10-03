import { useCallback, useContext, useMemo } from "react";
import { BigNumber, Contract, ethers } from "ethers";
import { useCall, useCalls, useContractFunction, useEthers } from "@usedapp/core";
import { QueryParams } from "@usedapp/core";
import { first } from "lodash";
import usePromise from "react-use-promise";
import { UBIScheme } from "@gooddollar/goodprotocol/types/UBIScheme";
import { EnvKey } from "../base/sdk";
import { ClaimSDK } from "./sdk";
import { IIdentity } from "@gooddollar/goodprotocol/types";

import { useSDK, useReadOnlySDK, useGetContract, useGetEnvChainId } from "../base/react";

export const useFVLink = () => {
  const sdk = useSDK(true, "claim") as ClaimSDK;

  return useMemo(() => sdk.getFVLink(), [sdk]);
};

export const useIsAddressVerified = (address: string, env?: EnvKey) => {
  const sdk = useReadOnlySDK("claim") as ClaimSDK;

  const result = usePromise(() => {
    if (address && sdk) return sdk.isAddressVerified(address);
    return Promise.resolve(undefined);
  }, [address, env, sdk]);
  return result;
};

export const useClaim = (refresh: QueryParams["refresh"] = "never") => {
  const DAY = 1000 * 60 * 60 * 24;
  const { account } = useEthers();
  const { chainId } = useGetEnvChainId();

  const ubi = useGetContract("UBIScheme", true, "claim") as UBIScheme;
  const identity = useGetContract("Identity", true, "claim") as IIdentity;
  const claimCall = useContractFunction(ubi, "claim");

  // const [entitlement] = usePromise(ubi["checkEntitlement()"]());
  const results = useCalls(
    [
      {
        contract: identity,
        method: "isWhitelisted",
        args: [account]
      },
      {
        contract: ubi,
        method: "currentDay",
        args: []
      },
      {
        contract: ubi,
        method: "periodStart",
        args: []
      },
      {
        contract: ubi,
        method: "checkEntitlement(address)",
        args: [account]
      } //this reverts in some cases, bug in contract
    ],
    { refresh, chainId }
  );

  const periodStart = (first(results[2]?.value) || BigNumber.from("0")) as BigNumber;
  const currentDay = (first(results[1]?.value) || BigNumber.from("0")) as BigNumber;
  let startRef = new Date(periodStart.toNumber() * 1000 + currentDay.toNumber() * DAY);
  if (startRef < new Date()) {
    startRef = new Date(periodStart.toNumber() * 1000 + (currentDay.toNumber() + 1) * DAY);
  }

  // console.log("useClaim:", {
  //   results,
  //   account,
  //   isWhitelisted: first(results[0]?.value) as boolean,
  //   claimAmount: (first(results[3]?.value) as BigNumber) || BigNumber.from("0"),
  //   claimTime: startRef,
  //   claimCall,
  //   ubi,
  //   identity
  // });
  return {
    isWhitelisted: first(results[0]?.value) as boolean,
    claimAmount: (first(results[3]?.value) as BigNumber) || BigNumber.from("0"),
    claimTime: startRef,
    claimCall
  };
};
