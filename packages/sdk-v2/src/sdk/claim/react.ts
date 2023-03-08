import { IIdentity } from "@gooddollar/goodprotocol/types";
import { UBIScheme } from "@gooddollar/goodprotocol/types/UBIScheme";
import { ChainId, QueryParams, useCalls, useEthers } from "@usedapp/core";
import { BigNumber } from "ethers";
import { first } from "lodash";
import { useMemo, useState, useEffect } from "react";
import { AsyncStorage } from "../storage";
import usePromise from "react-use-promise";

import { EnvKey } from "../base/sdk";
import { ClaimSDK } from "./sdk";

import useRefreshOrNever from "../../hooks/useRefreshOrNever";
import { useGetContract, useGetEnvChainId, useReadOnlySDK, useSDK } from "../base/react";
import { Envs, SupportedChains, SupportedV2Networks } from "../constants";
import { noop } from "lodash";
import { useContractFunctionWithDefaultGasFees } from "../base/hooks/useGasFees";

export const useFVLink = (chainId?: number) => {
  const { account } = useEthers();
  const { chainId: defaultChainId } = useGetEnvChainId();

  const sdk = useSDK(account ? false : true, "claim", chainId ?? defaultChainId) as ClaimSDK;

  return useMemo(() => sdk?.getFVLink(chainId), [sdk, chainId, account]);
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
  const claimCall = useContractFunctionWithDefaultGasFees(ubi, "claim");

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
    ],
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

export const useHasClaimed = (requiredNetwork: keyof typeof SupportedV2Networks): boolean => {
  const { account } = useEthers();
  const ubi = useGetContract("UBIScheme", true, "claim", SupportedV2Networks[requiredNetwork]) as UBIScheme;

  const [hasClaimed] = useCalls(
    [
      {
        contract: ubi,
        method: "checkEntitlement(address)",
        args: [account]
      }
    ],
    { refresh: "never", chainId: SupportedV2Networks[requiredNetwork] as unknown as ChainId }
  );

  return first(hasClaimed?.value) as boolean;
};

// if user is verified on fuse and not on current network then send backend request to whitelist
let syncInProgress = false;
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

      // not need for sync when already synced or user whitelisted on both chains
      if (isSynced || (first(fuseResult?.value) && first(otherResult?.value))) {
        return setSyncStatus(Promise.resolve(true));
      }

      // already sent sync request
      if (syncInProgress) return;

      // if whitelisted on fuse but not on celo then sync
      if (first(fuseResult?.value) && first(otherResult?.value) === false) {
        syncInProgress = true;
        const devEnv = baseEnv === "fuse" ? "development" : baseEnv;
        const { backend } = Envs[devEnv];

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
            .finally(() => (syncInProgress = false))
        );
      } else {
        setSyncStatus(Promise.resolve(false));
      }
    };

    whitelistSync().catch(noop);
  }, [fuseResult, otherResult, account, setSyncStatus]);

  return {
    fuseWhitelisted: first(fuseResult?.value) as boolean,
    currentWhitelisted: first(otherResult?.value) as boolean,
    syncStatus
  };
};
