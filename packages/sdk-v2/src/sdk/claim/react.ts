import { useCallback, useEffect, useMemo, useState } from "react";
import { BigNumber, ethers } from "ethers";
import { ChainId, useCalls, useContractFunction, useEthers } from "@usedapp/core";
import { QueryParams } from "@usedapp/core";
import { first } from "lodash";
import usePromise from "react-use-promise";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UBIScheme } from "@gooddollar/goodprotocol/types/UBIScheme";
import { IIdentity } from "@gooddollar/goodprotocol/types";
import { Web3Context } from "../../contexts";
import { Web3Provider } from "@ethersproject/providers";

import { EnvKey } from "../base/sdk";
import { ClaimSDK } from "./sdk";

import { useSDK, useReadOnlySDK, useGetContract, useGetEnvChainId } from "../base/react";
import useRefreshOrNever from "../../hooks/useRefreshOrNever";
import { Envs, SupportedChains } from "../constants";

export const useFVLink = () => {
  const { chainId, defaultEnv } = useGetEnvChainId();
  const sdk = useSDK(false, "claim", chainId) as ClaimSDK;

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
  const { account, library } = useEthers();
  const [connectedAccount, setConnectedAccount] = useState<string | undefined>(undefined);
  const { chainId, defaultEnv } = useGetEnvChainId();

  const ubi = useGetContract("UBIScheme", true, "claim", defaultEnv, 122) as UBIScheme;
  const identity = useGetContract("Identity", true, "claim", defaultEnv, 122) as IIdentity;
  const claimCall = useContractFunction(ubi, "claim");

  useEffect(() => {
    // web3provider indicates connected account
    // JsonRpcProvider is the read-only provider, which also has an address eligible as signer
    // make sure the account to check against is actually the connected wallet
    if (library instanceof Web3Provider) {
      setConnectedAccount(account);
    }
  }, [account, library]);

  // const [entitlement] = usePromise(ubi["checkEntitlement()"]());
  const results = useCalls(
    [
      {
        contract: identity,
        method: "isWhitelisted",
        args: [connectedAccount]
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
        args: [connectedAccount]
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

// if user is verified on fuse and not on current network then send backend request to whitelist
export const useWhitelistSync = () => {
  const [syncStatus, setSyncStatus] = useState<Promise<boolean> | undefined>();
  const { baseEnv, defaultEnv } = useGetEnvChainId();
  const { account, chainId } = useEthers();
  const identity = useGetContract("Identity", true, "claim", defaultEnv, SupportedChains.FUSE) as IIdentity;
  const identity2 = useGetContract("Identity", true, "claim", defaultEnv, chainId) as IIdentity;

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

      if (isSynced !== "true" && fuseResult?.value && otherResult?.value === false) {
        const { backend } = Envs[baseEnv];

        console.log("syncWhitelist", { account, backend, baseEnv });

        setSyncStatus(
          fetch(backend + `/syncWhitelist/${account}`)
            .then(async r => {
              console.log("syncWhitelist result:", r);
              if (r.status === 200) {
                const res = await r.json();
                console.log("syncWhitelist json result:", res);

                AsyncStorage.setItem(`${account}-whitelistedSync`, "true");
                return true;
              } else {
                return false;
              }
            })
            .catch(e => {
              console.log("syncWhitelistfailed:", e.message, e);
              return false;
            })
        );
      }
    };

    whitelistSync();
  }, [fuseResult, otherResult, account, setSyncStatus]);

  return {
    fuseWhitelisted: fuseResult?.value as boolean,
    currentWhitelisted: otherResult?.value as boolean,
    syncStatus
  };
};
