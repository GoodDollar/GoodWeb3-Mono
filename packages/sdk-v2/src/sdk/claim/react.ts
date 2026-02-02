import { IIdentity, UBIScheme } from "@gooddollar/goodprotocol/types";
import { ChainId, QueryParams, useCalls, useEthers } from "@usedapp/core";
import ethers, { BigNumber, Contract } from "ethers";
import { first } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { noop } from "lodash";
import usePromise from "react-use-promise";
import GoodCollectiveContracts from "@gooddollar/goodcollective-contracts/releases/deployment.json";
import { GoodCollectiveSDK } from "@gooddollar/goodcollective-sdk";
import { submitReferral } from "../constants";

import { AsyncStorage } from "../storage/sdk";
import { EnvKey } from "../base/sdk";
import { ClaimSDK } from "./sdk";

import useRefreshOrNever from "../../hooks/useRefreshOrNever";
import { useGetContract, useGetEnvChainId, useReadOnlySDK, useSDK } from "../base/react";
import { Envs, SupportedChains, SupportedV2Networks } from "../constants";
import { useContractFunctionWithDefaultGasFees, useGasFees } from "../base/hooks/useGasFees";

import { getContractsFromClaimPools, getPoolsDetails } from "./utils/pools";
import { PoolDetails } from "./types";
import { isValidWhitelistedRoot } from "../utils/address";
import { useWhitelistedRoot, useEntitlementForRoot } from "./hooks";

type UBIPoolsDetails = Awaited<ReturnType<GoodCollectiveSDK["getUBIPoolsDetails"]>>;

export const useFVLink = (chainId?: number) => {
  const { chainId: defaultChainId } = useGetEnvChainId();
  const sdk = useSDK(false, "claim", chainId ?? defaultChainId) as ClaimSDK;

  return useMemo(() => sdk?.getFVLink(chainId) ?? {}, [sdk, chainId]);
};

export const isTxReject = (errorMessage: string) => errorMessage === "user rejected transaction";

export const useIsAddressVerified = (address: string, env?: EnvKey) => {
  const sdk = useReadOnlySDK("claim") as ClaimSDK;

  const result = usePromise(async () => {
    if (address && sdk) {
      try {
        const root = await sdk.getWhitelistedRoot(address);
        return { isVerified: true, whitelistedRoot: root };
      } catch {
        return { isVerified: false, whitelistedRoot: null };
      }
    }
    return { isVerified: false, whitelistedRoot: null };
  }, [address, env, sdk]);

  return result;
};

export const useMultiClaim = (poolsDetails: PoolDetails[] | undefined) => {
  const { account, chainId, library } = useEthers();
  const [claimFlowStatus, setStatus] = useState<{
    isClaimingDone: boolean;
    remainingClaims: number | undefined;
    error: boolean;
    isClaiming: boolean;
    claimReceipts: any[] | undefined;
  }>({ isClaimingDone: false, remainingClaims: undefined, error: false, isClaiming: false, claimReceipts: undefined });
  //the next contract to claim from
  const [contract, setContract] = useState<Contract | undefined>(undefined);
  // all contracts to claim from
  const [poolContracts, setPoolContracts] = useState<Contract[] | undefined>(undefined);
  // all contracts that have been claimed from
  const [claimedContracts, setClaimedContracts] = useState<
    {
      contract: Contract | undefined;
      promise: Promise<ethers.providers.TransactionReceipt | undefined>;
    }[]
  >([]);
  const { celoWhitelisted, syncStatus } = useWhitelistSync();

  const { gasPrice = BigNumber.from(25.001e9) } = useGasFees();
  const minBalance = BigNumber.from(chainId === 42220 ? "250000" : "150000").mul(gasPrice);
  const signer = (library as ethers.providers.JsonRpcProvider)?.getSigner();

  const { resetState, state, send } = useContractFunctionWithDefaultGasFees(contract, "claim", {
    transactionName: "Claimed UBI"
  });

  const getBalance = useCallback(async () => {
    const balance = await signer?.getBalance();
    return balance;
  }, [signer]);

  // initialize the state
  useEffect(() => {
    if (!poolsDetails) return;

    const poolContracts = getContractsFromClaimPools(poolsDetails ?? []);

    if (!poolContracts.length) {
      setStatus(prev => ({ ...prev, isClaimingDone: true, remainingClaims: 0 }));
    } else {
      setPoolContracts(poolContracts);
      setClaimedContracts([]);
      setContract(undefined);
    }
  }, [poolsDetails, /*used*/ chainId, /*used*/ account]);

  // once tx is mining move on to the next contract
  useEffect(() => {
    const { errorMessage = "", status } = state;
    const isError = isTxReject(errorMessage) || status === "Exception";

    if (claimedContracts.length === poolContracts?.length && !["None", "PendingSignature"].includes(status)) {
      setStatus(prev => ({ ...prev, isClaiming: false }));
    }

    // Error here indicates a transaction failed to be submitted to the blockchain
    if (status === "Success" || isError) {
      void (async () => {
        const isDivviDone = await AsyncStorage.getItem(`GD_divvi_${account}`);
        const txHash = state.transaction?.hash;

        if (!isDivviDone && state.chainId === 42220 && txHash) {
          if (txHash) {
            submitReferral({ txHash, chainId: 42220 })
              .then(() => {
                console.log("divvi-referral", { txHash });
              })
              .catch(e => {
                console.error("divvi failed", { e });
              });
          }
        }
      })();

      const next = poolContracts?.find(c => !claimedContracts.find(cc => cc.contract === c) && c !== contract);

      // if you don't reset state, the next claim call will not be called.
      resetState();
      setContract(next);
    }
  }, [state.status]);

  // once the next contract is set (status === "None"), perform claim
  useEffect(() => {
    if (!contract || state.status !== "None") return;
    void getBalance().then(balance => {
      if (balance?.lte(minBalance)) return;

      const promise = send();

      setClaimedContracts(prev => [{ contract, promise }, ...prev]);
    });
  }, [contract, state.status]);

  const updateStatus = useCallback(async () => {
    const results = await Promise.all(claimedContracts.map(_ => _.promise)).catch(() => [undefined]);
    const hasError = results.some(_ => _ === undefined);

    setStatus(prev => ({
      ...prev,
      isClaimingDone: !hasError && poolContracts?.length === results.length,
      remainingClaims: poolContracts ? poolContracts?.length - claimedContracts.length : undefined,
      error: !!hasError,
      claimReceipts: results
    }));
  }, [claimedContracts]);

  // once a tx state changes in claimedContracts[] we update the state.
  useEffect(() => {
    if (claimedContracts.length > 0) {
      void updateStatus();
    }

    // eslint-disable-next-line react-hooks-addons/no-unused-deps
  }, [claimedContracts, poolContracts]);

  // set the first contract to trigger the claiming process
  const startClaiming = useCallback(async () => {
    if (!contract) {
      if (celoWhitelisted && syncStatus) {
        const success = await syncStatus;

        if (!success) {
          return;
        }
      }

      setStatus({
        isClaimingDone: false,
        isClaiming: true,
        error: false,
        remainingClaims: poolContracts?.length,
        claimReceipts: undefined
      });

      resetState();
      setClaimedContracts([]);

      setContract(poolContracts?.[0]);
    }
  }, [contract, poolContracts, claimedContracts]);

  return {
    poolContracts,
    claimFlowStatus,
    startClaiming,
    updateStatus
  };
};

export const useGetMemberUBIPools = () => {
  const { account, library, chainId } = useEthers();
  const [poolsDetails, setPoolsDetails] = useState<PoolDetails[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { defaultEnv } = useGetEnvChainId();
  const gcEnv = defaultEnv === "production-celo" ? "production-celo" : "development-celo";

  const pool = GoodCollectiveContracts["42220"]?.find(envs => envs.name === gcEnv)?.contracts.UBIPool;

  const fetchPools = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!library || !account || !pool) {
        setPoolsDetails(undefined);
        return;
      }

      if (chainId !== 42220) {
        setPoolsDetails([]);
        return;
      }

      const sdk = new GoodCollectiveSDK("42220", library as ethers.providers.Provider, { network: gcEnv });

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
  }, [account, library, chainId, defaultEnv]);

  useEffect(() => {
    if (poolsDetails === undefined) {
      void fetchPools();
    }
  }, [fetchPools, poolsDetails]);

  return { poolsDetails, loading, error, fetchPools };
};

export const useGetUBIPoolsDetails = (poolAddress: string[]) => {
  const { account, library, chainId } = useEthers();
  const [availablePools, setAvailablePools] = useState<UBIPoolsDetails | undefined>(undefined);
  const { defaultEnv } = useGetEnvChainId();
  const gcEnv = defaultEnv === "production-celo" ? "production-celo" : "development-celo";

  const pool = GoodCollectiveContracts["42220"]?.find(envs => envs.name === gcEnv)?.contracts.UBIPool;

  const fetchPools = useCallback(async () => {
    try {
      if (!library || !account || !pool) {
        setAvailablePools(undefined);
        return;
      }

      if (chainId !== 42220) {
        setAvailablePools([]);
        return;
      }

      const sdk = new GoodCollectiveSDK("42220", library as ethers.providers.Provider, { network: gcEnv });

      const poolsDetails = await sdk.getUBIPoolsDetails(poolAddress);

      if (!poolsDetails || !poolsDetails.length) {
        setAvailablePools([]);
        return;
      }
      // poolsDetails.filter(details => details.ubiSettings.onlyMembers === false || details.ubiSettings);

      setAvailablePools(poolsDetails);
    } catch (err: any) {
      console.error("Error fetching pools:", err);
    }
  }, [account, library, chainId, defaultEnv]);

  useEffect(() => {
    if (availablePools === undefined) {
      void fetchPools();
    }
  }, [fetchPools, availablePools]);

  return availablePools;
};

export const useClaim = (refresh: QueryParams["refresh"] = "never") => {
  const refreshOrNever = useRefreshOrNever(refresh);
  const DAY = 1000 * 60 * 60 * 24;
  const { account } = useEthers();
  const { chainId } = useGetEnvChainId();

  const ubi = useGetContract("UBIScheme", true, "claim", chainId) as UBIScheme;
  const identity = useGetContract("Identity", true, "claim", chainId) as IIdentity;
  // const claimCall = useContractFunctionWithDefaultGasFees(ubi, "claim", { transactionName: "Claimed Daily UBI" });
  const whitelistedRoot = useWhitelistedRoot(identity, account, refreshOrNever, chainId);

  // Then, use the whitelisted root for entitlement check
  const entitlement = useEntitlementForRoot(ubi, whitelistedRoot, refreshOrNever, chainId);

  const [currentDayResult, periodStartResult] = useCalls(
    [
      ubi && {
        contract: ubi,
        method: "currentDay",
        args: []
      },
      ubi && {
        contract: ubi,
        method: "periodStart",
        args: []
      }
    ],
    { refresh: refreshOrNever, chainId }
  );

  const periodStart = (first(periodStartResult?.value) || BigNumber.from("0")) as BigNumber;
  const currentDay = (first(currentDayResult?.value) || BigNumber.from("0")) as BigNumber;
  let startRef = new Date(periodStart.toNumber() * 1000 + currentDay.toNumber() * DAY);

  if (startRef < new Date()) {
    startRef = new Date(periodStart.toNumber() * 1000 + (currentDay.toNumber() + 1) * DAY);
  }

  const isWhitelisted = isValidWhitelistedRoot(whitelistedRoot);

  return {
    isWhitelisted,
    whitelistedRoot,
    claimAmount: entitlement,
    hasClaimed: entitlement?.isZero(),
    nextClaimTime: startRef,
    address: ubi?.address,
    contract: ubi,
    contractName: "GoodDollar"
  };
};

export const useHasClaimed = (requiredNetwork: keyof typeof SupportedV2Networks): BigNumber | undefined => {
  const { account } = useEthers();
  const ubi = useGetContract("UBIScheme", true, "claim", SupportedV2Networks[requiredNetwork]) as UBIScheme;
  const identity = useGetContract("Identity", true, "claim", SupportedV2Networks[requiredNetwork]) as IIdentity;
  const chainId = SupportedV2Networks[requiredNetwork] as unknown as ChainId;

  // First, get the whitelisted root
  const whitelistedRoot = useWhitelistedRoot(identity, account, 8, chainId);

  // Then, use the whitelisted root for entitlement check
  return useEntitlementForRoot(ubi, whitelistedRoot, 8, chainId);
};

export const useClaimedAlt = (chainId: number | undefined) => {
  const claimedCelo = useHasClaimed("CELO");
  const claimedFuse = useHasClaimed("FUSE");
  const claimedXdc = useHasClaimed("XDC");

  const claimedAlt = useMemo(() => {
    if (!claimedCelo && chainId !== SupportedChains.CELO) {
      return { hasClaimed: false, altChain: Number(SupportedChains.CELO) };
    }
    if (!claimedXdc && chainId !== SupportedChains.XDC) {
      return { hasClaimed: false, altChain: Number(SupportedChains.XDC) };
    }
    if (!claimedFuse && chainId !== SupportedChains.FUSE) {
      return { hasClaimed: false, altChain: Number(SupportedChains.FUSE) };
    }
    return { hasClaimed: true, altChain: 0 };
  }, [claimedCelo, claimedFuse, claimedXdc]);

  return claimedAlt;
};

// if user is verified on fuse and not on current network then send backend request to whitelist
let syncInProgress = false;
export const useWhitelistSync = () => {
  const [syncStatus, setSyncStatus] = useState<Promise<boolean> | undefined>();
  const { baseEnv } = useGetEnvChainId();
  const { account, chainId } = useEthers();
  const otherChainId = chainId === SupportedChains.CELO ? SupportedChains.XDC : chainId;

  const identity = useGetContract("Identity", true, "claim", SupportedChains.CELO) as IIdentity;
  const identity2 = useGetContract("Identity", true, "claim", otherChainId) as IIdentity;
  const baseEnvRef = useRef<typeof baseEnv>();

  useEffect(() => {
    baseEnvRef.current = baseEnv;
  }, [baseEnv]);

  const celoRoot = useWhitelistedRoot(identity, account, "never", SupportedChains.CELO as unknown as ChainId);
  const otherRoot = useWhitelistedRoot(identity2, account, "never", otherChainId as unknown as ChainId);

  useEffect(() => {
    const whitelistSync = async () => {
      const isSynced = await AsyncStorage.getItem(`${account}-${chainId}-whitelistedSync`);

      const whitelistCelo = isValidWhitelistedRoot(celoRoot);
      const whitelistOther = isValidWhitelistedRoot(otherRoot);

      // not need for sync when already synced or user whitelisted on both chains
      if (isSynced || (whitelistCelo && whitelistOther)) {
        return setSyncStatus(Promise.resolve(true));
      }

      // already sent sync request
      if (syncInProgress) return;

      // if whitelisted on fuse but not on celo then sync
      if (whitelistCelo && whitelistOther === false) {
        syncInProgress = true;
        const { current: baseEnv } = baseEnvRef;
        const devEnv = baseEnvRef.current === "fuse" ? "development" : baseEnv;
        const { backend } = Envs[devEnv as keyof typeof Envs];

        setSyncStatus(
          fetch(backend + `/syncWhitelist/${account}`)
            .then(async r => {
              if (r.status === 200) {
                await r.json();
                AsyncStorage.safeSet(`${account}-${chainId}-whitelistedSync`, true);

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
  }, [celoRoot, otherRoot, account, chainId, setSyncStatus]);

  return {
    celoWhitelisted: isValidWhitelistedRoot(celoRoot),
    currentWhitelisted: isValidWhitelistedRoot(otherRoot),
    syncStatus
  };
};
