import { IIdentity } from "@gooddollar/goodprotocol/types";
import { UBIScheme } from "@gooddollar/goodprotocol/types/UBIScheme";
import { AsyncStorage } from "../storage";
import { ChainId, QueryParams, useCalls, useContractFunction, useEthers } from "@usedapp/core";
import { BigNumber } from "ethers";
import { first } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { noop } from "lodash";
import usePromise from "react-use-promise";

import { EnvKey } from "../base/sdk";
import { ClaimSDK } from "./sdk";

import useRefreshOrNever from "../../hooks/useRefreshOrNever";
import { useGetContract, useGetEnvChainId, useReadOnlySDK, useSDK } from "../base/react";
import { Envs, SupportedChains } from "../constants";

export const useFVLink = (requiredChainId?: number, whitelistAtChain: boolean = false) => {
  const { chainId } = useGetEnvChainId(requiredChainId);
  const sdk = useSDK(false, "claim", chainId) as ClaimSDK;

  return useMemo(
    () => sdk?.getFVLink(whitelistAtChain ? chainId : undefined), 
    [sdk, chainId, whitelistAtChain]
  );
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
    claimAmount: (first(results[3]?.value) as BigNumber) || BigNumber.from("0"),
    claimTime: startRef,
    claimCall
  };
};

// if user is verified on fuse and not on current network then send backend request to whitelist
export const useWhitelistSync = () => {
  const [syncStatus, setSyncStatus] = useState<Promise<boolean> | undefined>();
  const { baseEnv } = useGetEnvChainId();
  const { account, chainId } = useEthers();
  const identity = useGetContract("Identity", true, "claim", SupportedChains.FUSE) as IIdentity;
  const identity2 = useGetContract("Identity", true, "claim", chainId) as IIdentity;

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
    { refresh: "never", chainId }
  );

  useEffect(() => {
    const whitelistSync = async () => {
      const isSynced = await AsyncStorage.getItem(`${account}-whitelistedSync`);

      console.log("syncWhitelist", { account, baseEnv, isSynced, fuseResult, otherResult });

      if (!isSynced && fuseResult?.value[0] && otherResult?.value[0] === false) {
        const { backend } = Envs[baseEnv];

        setSyncStatus(
          fetch(backend + `/syncWhitelist/${account}`)
            .then(async r => {
              if (r.status === 200) {
                await r.json();
                AsyncStorage.safeSet(`${account}-whitelistedSync`, true);

                return true;
              } else {
                return false;
              }
            })
            .catch(() => false)
        );
      }
    };

    whitelistSync().catch(noop);
  }, [fuseResult, otherResult, account, setSyncStatus]);

  return {
    fuseWhitelisted: fuseResult?.value as boolean,
    currentWhitelisted: otherResult?.value as boolean,
    syncStatus
  };
};
