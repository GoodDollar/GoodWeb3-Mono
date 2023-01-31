import { IIdentity } from "@gooddollar/goodprotocol/types";
import { UBIScheme } from "@gooddollar/goodprotocol/types/UBIScheme";
import { ChainId, QueryParams, useCalls, useContractFunction, useEthers } from "@usedapp/core";
import { BigNumber } from "ethers";
import { first } from "lodash";
import { useMemo, useState } from "react";
import { AsyncStorage } from "../storage";
import usePromise from "react-use-promise";

import { EnvKey } from "../base/sdk";
import { ClaimSDK } from "./sdk";

import useRefreshOrNever from "../../hooks/useRefreshOrNever";
import { useGetContract, useGetEnvChainId, useReadOnlySDK, useSDK } from "../base/react";
import { Envs, SupportedChains } from "../constants";

export const useFVLink = () => {
  const { chainId } = useGetEnvChainId();
  const sdk = useSDK(false, "claim", chainId) as ClaimSDK;

  return useMemo(() => sdk?.getFVLink(), [sdk]);
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

  const ubi = useGetContract("UBIScheme", true, "claim", chainId) as UBIScheme;
  const identity = useGetContract("Identity", true, "claim", chainId) as IIdentity;
  const claimCall = useContractFunction(ubi, "claim");

  const results = useCalls(
    [
      identity &&
        account && {
          contract: identity,
          method: "isWhitelisted",
          args: [account]
        },
      ubi && {
        contract: ubi,
        method: "currentDay",
        args: []
      },
      ubi && {
        contract: ubi,
        method: "periodStart",
        args: []
      },
      ubi &&
        account && {
          contract: ubi,
          method: "checkEntitlement(address)",
          args: [account]
        }
    ].filter(_ => _),
    { refresh: refreshOrNever, chainId }
  );

  const periodStart = (first(results[2]?.value) || BigNumber.from("0")) as BigNumber;
  const currentDay = (first(results[1]?.value) || BigNumber.from("0")) as BigNumber;
  let startRef = new Date(periodStart.toNumber() * 1000 + currentDay.toNumber() * DAY);

  if (startRef < new Date()) {
    startRef = new Date(periodStart.toNumber() * 1000 + (currentDay.toNumber() + 1) * DAY);
  }

  return {
    isWhitelisted: first(results[0]?.value) as boolean,
    claimAmount: (first(results[3]?.value) as BigNumber) || undefined,
    claimTime: startRef,
    claimCall
  };
};

// if user is verified on fuse and not on current network then send backend request to whitelist
export const useWhitelistSync = () => {
  const { baseEnv } = useGetEnvChainId();
  const { account, chainId } = useEthers();
  const identity = useGetContract("Identity", true, "claim", SupportedChains.FUSE) as IIdentity;
  const identity2 = useGetContract("Identity", true, "claim", chainId) as IIdentity;
  const [otherRefresh, setOtherRefresh] = useState<QueryParams["refresh"]>("never");

  const [fuseResult] = useCalls(
    [
      {
        contract: identity,
        method: "isWhitelisted",
        args: [account]
      }
    ],
    { refresh: "never", chainId: SupportedChains.FUSE as unknown as ChainId }
  );

  const [otherResult] = useCalls(
    [
      {
        contract: identity2,
        method: "isWhitelisted",
        args: [account]
      }
    ].filter(_ => _.contract && chainId != SupportedChains.FUSE),
    { refresh: otherRefresh, chainId }
  );

  const whitelistSync = async () => {
    const devEnv = baseEnv === "fuse" ? "development" : baseEnv;
    const { backend } = Envs[devEnv];
    const isSynced = await AsyncStorage.getItem(`${account}-whitelistedSync`);

    if (isSynced) {
      // send error log to analytics
      console.error("Something went wrong, should have been synced", {
        account,
        chainId,
        id1: identity.address,
        id2: identity.address
      });
      return false;
    }

    return fetch(backend + `/syncWhitelist/${account}`)
      .then(async r => {
        if (r.status === 200) {
          await r.json();
          AsyncStorage.safeSet(`${account}-whitelistedSync`, true);
          setOtherRefresh(10);
          setTimeout(() => {
            setOtherRefresh("never");
          }, 60000);
          return true;
        } else {
          return false;
        }
      })
      .catch(() => false);
  };

  return {
    fuseWhitelisted: fuseResult?.value && (fuseResult?.value[0] as boolean),
    currentWhitelisted: otherResult?.value[0] as boolean,
    // syncStatus,
    whitelistSync
  };
};
