import { useCallback, useEffect, useMemo, useState } from "react";
import { BigNumber, ethers } from "ethers";
import { ChainId, useCalls, useContractFunction, useEthers } from "@usedapp/core";
import { QueryParams } from "@usedapp/core";
import { first } from "lodash";
import usePromise from "react-use-promise";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UBIScheme } from "@gooddollar/goodprotocol/types/UBIScheme";
import { IIdentity } from "@gooddollar/goodprotocol/types";

import { EnvKey } from "../base/sdk";
import { ClaimSDK } from "./sdk";

import { useSDK, useReadOnlySDK, useGetContract, useGetEnvChainId } from "../base/react";
import useRefreshOrNever from "../../hooks/useRefreshOrNever";
import { Envs, SupportedChains } from "../constants";

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
  const refreshOrNever = useRefreshOrNever(refresh);
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
    { refresh: refreshOrNever, chainId }
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

//if user is verified on fuse and not on current network then send backend request to whitelist
export const useWhitelistSync = () => {
  const [syncStatus, setSyncStatus] = useState<Promise<boolean> | undefined>();
  const { baseEnv } = useGetEnvChainId();
  const { account, chainId } = useEthers();
  const identity = useGetContract("Identity", true, "claim", SupportedChains.FUSE) as IIdentity;
  const identity2 = useGetContract("Identity", true, "claim", chainId) as IIdentity;
  const fuseResult = first(
    useCalls(
      [
        {
          contract: identity,
          method: "isWhitelisted",
          args: [account]
        }
      ],
      { refresh: "never", chainId: SupportedChains.FUSE as unknown as ChainId }
    )
  );

  const otherResult = first(
    useCalls(
      [
        {
          contract: identity2,
          method: "isWhitelisted",
          args: [account]
        }
      ].filter(_ => _.contract && chainId != SupportedChains.FUSE),
      { refresh: "never", chainId }
    )
  );

  const whitelistSync = useCallback(async () => {
    const isSynced = await AsyncStorage.getItem(`${account}-whitelistedSync`);
    if (isSynced !== "true" && fuseResult?.value && otherResult?.value === false) {
      const { backend } = Envs[baseEnv];
      console.log("syncWhitelist", { account, backend, baseEnv });

      const status = fetch(backend + `/syncWhitelist/${account}`)
        .then(r => {
          console.log("syncWhitelist result:", r);
          AsyncStorage.setItem(`${account}-whitelistedSync`, "true");
          return true;
        })
        .catch(e => {
          console.log("syncWhitelistfailed:", e.message, e);
          return false;
        });
      setSyncStatus(status);
    }
  }, [fuseResult, otherResult, account, setSyncStatus]);

  useEffect(() => {
    whitelistSync();
  }, [whitelistSync]);

  return {
    fuseWhitelisted: fuseResult?.value as boolean,
    currentWhitelisted: otherResult?.value as boolean,
    syncStatus
  };
};
