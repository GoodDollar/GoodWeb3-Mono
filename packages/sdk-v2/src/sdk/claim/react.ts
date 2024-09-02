import { IIdentity, UBIScheme } from "@gooddollar/goodprotocol/types";
import { ChainId, QueryParams, useCalls, useEthers } from "@usedapp/core";
import ethers, { BigNumber, Contract } from "ethers";
import { first } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { noop } from "lodash";
import usePromise from "react-use-promise";
import GoodCollectiveContracts from "@gooddollar/goodcollective-contracts/releases/deployment.json";
import { GoodCollectiveSDK } from "@gooddollar/goodcollective-sdk";

import { AsyncStorage } from "../storage/sdk";
import { EnvKey } from "../base/sdk";
import { ClaimSDK } from "./sdk";

import useRefreshOrNever from "../../hooks/useRefreshOrNever";
import { useGetContract, useGetEnvChainId, useReadOnlySDK, useSDK } from "../base/react";
import { Envs, SupportedChains, SupportedV2Networks } from "../constants";
import { useContractFunctionWithDefaultGasFees } from "../base/hooks/useGasFees";

import { getContractsFromClaimPools, getPoolsDetails } from "./utils/pools";
import { PoolDetails } from "./types";

export const useFVLink = (chainId?: number) => {
  const { chainId: defaultChainId } = useGetEnvChainId();
  const sdk = useSDK(false, "claim", chainId ?? defaultChainId) as ClaimSDK;

  return useMemo(() => sdk?.getFVLink(chainId) ?? {}, [sdk, chainId]);
};

export const useIsAddressVerified = (address: string, env?: EnvKey) => {
  const sdk = useReadOnlySDK("claim") as ClaimSDK;

  const result = usePromise(() => {
    if (address && sdk) return sdk.isAddressVerified(address);
    return Promise.resolve(undefined);
  }, [address, env, sdk]);

  return result;
};

export const useMultiClaim = (poolsDetails: PoolDetails[]) => {
  //the next contract to claim from
  const [contract, setContract] = useState<Contract | undefined>(undefined);
  // all contracts to claim from
  const [poolContracts, setPoolContracts] = useState<Contract[]>([]);
  // all contracts that have been claimed from
  const [claimedContracts, setClaimedContracts] = useState<Contract[]>([]);

  const { state, send, resetState } = useContractFunctionWithDefaultGasFees(contract, "claim", {
    transactionName: "Claimed UBI"
  });

  const nextClaim = useCallback(async () => {
    if (!contract) return;

    await send();

    setClaimedContracts((prev: Contract[]) => [contract, ...prev]);
    const remainingContracts = poolContracts.find(c => !claimedContracts.includes(c) && c !== contract);
    setContract(remainingContracts);
  }, [contract, poolContracts]);

  useEffect(() => {
    if (poolsDetails.length && !poolContracts.length) {
      const poolContracts = getContractsFromClaimPools(poolsDetails);
      setPoolContracts(poolContracts);
    }
  }, [poolsDetails]);

  useEffect(() => {
    if (contract) {
      void nextClaim();
    } else {
      setClaimedContracts([]);
    }

    return () => resetState();
  }, [contract]);

  return {
    poolContracts,
    claimFlowStatus: {
      isClaimingDone: claimedContracts.length === poolContracts.length,
      remainingClaims: poolContracts.length - claimedContracts.length
    },
    setContract,
    setPoolContracts,
    setClaimedContracts,
    transactionState: { state, resetState }
  };
};

export const useGetMemberUBIPools = () => {
  const { account, library, chainId } = useEthers();
  const [poolsDetails, setPoolsDetails] = useState<PoolDetails[] | undefined>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pool = GoodCollectiveContracts["42220"]?.find(envs => envs.name === "development-celo")?.contracts.UBIPool;
  const sdk = new GoodCollectiveSDK("42220", library as ethers.providers.Provider, { network: "development-celo" });

  const fetchPools = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!library || !account || !pool || chainId !== 42220) {
        setPoolsDetails(undefined);
        return;
      }

      const memberUbiPools = await sdk.getMemberUBIPools(account);

      if (!memberUbiPools || !memberUbiPools.length) {
        setPoolsDetails([]);
        return;
      }

      const details = getPoolsDetails(memberUbiPools, pool.abi, library);

      setPoolsDetails(details);
    } catch (err: any) {
      console.error("Error fetching pools:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [account, library, chainId]);

  useEffect(() => {
    void fetchPools();
  }, [fetchPools]);

  return { poolsDetails, loading, error, fetchPools };
};

export const useClaim = (refresh: QueryParams["refresh"] = "never") => {
  const refreshOrNever = useRefreshOrNever(refresh);
  const DAY = 1000 * 60 * 60 * 24;
  const { account } = useEthers();
  const { chainId } = useGetEnvChainId();

  const ubi = useGetContract("UBIScheme", true, "claim", chainId) as UBIScheme;
  const identity = useGetContract("Identity", true, "claim", chainId) as IIdentity;
  // const claimCall = useContractFunctionWithDefaultGasFees(ubi, "claim", { transactionName: "Claimed Daily UBI" });

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
    hasClaimed: (first(results[3]?.value) as BigNumber)?.isZero(),
    claimTime: startRef,
    address: ubi?.address,
    contract: ubi,
    contractName: "GoodDollar"
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
    { refresh: 8, chainId: SupportedV2Networks[requiredNetwork] as unknown as ChainId }
  );

  return first(hasClaimed?.value) as boolean;
};

export const useClaimedAlt = (chainId: number | undefined) => {
  const claimedCelo = useHasClaimed("CELO");
  const claimedFuse = useHasClaimed("FUSE");

  const claimedAlt = useMemo(() => {
    if (chainId === SupportedChains.FUSE) {
      return { hasClaimed: (claimedCelo as unknown as BigNumber)?.isZero(), altChain: "CELO" };
    } else {
      return { hasClaimed: (claimedFuse as unknown as BigNumber)?.isZero(), altChain: "FUSE" };
    }
  }, [chainId, claimedCelo, claimedFuse]);

  return claimedAlt;
};

// if user is verified on fuse and not on current network then send backend request to whitelist
let syncInProgress = false;
export const useWhitelistSync = () => {
  const [syncStatus, setSyncStatus] = useState<Promise<boolean> | undefined>();
  const { baseEnv } = useGetEnvChainId();
  const { account, chainId } = useEthers();
  const identity = useGetContract("Identity", true, "claim", SupportedChains.FUSE) as IIdentity;
  const identity2 = useGetContract("Identity", true, "claim", chainId) as IIdentity;
  const baseEnvRef = useRef<typeof baseEnv>();

  useEffect(() => {
    baseEnvRef.current = baseEnv;
  }, [baseEnv]);

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
        const { current: baseEnv } = baseEnvRef;
        const devEnv = baseEnvRef.current === "fuse" ? "development" : baseEnv;
        const { backend } = Envs[devEnv as keyof typeof Envs];

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
