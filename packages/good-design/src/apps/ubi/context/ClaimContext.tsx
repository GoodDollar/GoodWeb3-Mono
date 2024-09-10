import React, { createContext, FC, PropsWithChildren, useContext, useCallback, useEffect, useState } from "react";
import {
  getRecentClaims,
  PoolDetails,
  SupportedChains,
  useClaim,
  useClaimedAlt,
  useGetMemberUBIPools,
  useMultiClaim
} from "@gooddollar/web3sdk-v2";
import { QueryParams, useEthers } from "@usedapp/core";
import { isArray, isEmpty, isUndefined, noop } from "lodash";
import { Lock } from "async-await-mutex-lock";

import { getUnclaimedPools } from "../utils/pools";
import { ClaimContextProps } from "../types";
import { useFormatClaimTransactions } from "../../../hooks";

const ClaimContext = createContext<ClaimContextProps | undefined>(undefined);

export const useClaimContext = () => {
  const context = useContext(ClaimContext);
  if (!context) {
    throw new Error("useClaimContext must be used within a ClaimProvider");
  }
  return context;
};

const explorerPollLock = new Lock();

export const ClaimProvider: FC<
  {
    explorerEndPoints: { [key in keyof typeof SupportedChains]: string };
    supportedChains: SupportedChains[];
    withSignModals: boolean;
    provider?: any;
    onNews: () => void;
    onConnect?: () => Promise<boolean>;
    onSuccess?: () => Promise<void>;
    onSendTx?: () => void;
  } & PropsWithChildren
> = ({
  children,
  explorerEndPoints,
  provider,
  supportedChains,
  withSignModals,
  onConnect,
  onNews,
  // onSendTx,
  onSuccess
}) => {
  const { account, chainId, library, switchNetwork } = useEthers();
  const [refreshRate, setRefreshRate] = useState<QueryParams["refresh"]>(4);
  const [preClaimPools, setClaimPools] = useState<any[] | undefined>(undefined);
  const [postClaimPools, setPostClaimPools] = useState<any[] | undefined>(undefined);
  const activeChain = SupportedChains[chainId as number] ?? "CELO";
  const endpoints = explorerEndPoints[activeChain as keyof typeof SupportedChains];
  const [error, setError] = useState<string | undefined>(undefined);
  const claimedAlt = useClaimedAlt(chainId);

  const [txDetails, setTxDetails] = useState({ transaction: undefined, isOpen: false });

  const formattedTransactionList = useFormatClaimTransactions(
    postClaimPools && postClaimPools?.length > 0 ? postClaimPools : preClaimPools ? preClaimPools : [],
    chainId,
    account ?? ""
  );

  const claimDetails = useClaim(refreshRate);
  const { poolsDetails, loading, fetchPools } = useGetMemberUBIPools();

  const { errorMessage } = { errorMessage: undefined };

  const { poolContracts, startClaiming: onClaim, claimFlowStatus } = useMultiClaim(preClaimPools);

  const onTxDetailsPress = useCallback(
    (transaction: any) => {
      setTxDetails({ transaction, isOpen: true });
    },
    [txDetails]
  );

  const onClaimFailed = useCallback(async () => {
    setError(errorMessage ?? /*i18n*/ "An unknown error occurred while claiming");
    setClaimPools(undefined);
  }, [errorMessage]);

  const onClaimSuccess = useCallback(async () => {
    // should handle what happens after all claims are done (eg. showing a next-task modal)
    // if nothing is done, it will just silently finish

    setClaimPools(undefined);
    setRefreshRate("everyBlock");
    void fetchPools();
    await onSuccess?.();
  }, [onSuccess]);

  useEffect(() => {
    setClaimPools(undefined);
    setPostClaimPools(undefined);
    void fetchPools();
  }, [/*used*/ chainId, /*used*/ account]);

  const switchChain = useCallback(() => {
    // 4902: Network is not added, and should be done manually
    // explanation to user is shown through network modal
    switchNetwork(SupportedChains[claimedAlt.altChain as keyof typeof SupportedChains]).catch((e: any) => {
      if (e.code === 4902) {
        // toggleNetworkModal()
        //todo: discuss how to handle this
      }
    });
  }, [switchNetwork, claimedAlt]);

  //Handle navigation to pre-claim screen
  useEffect(() => {
    if (isUndefined(poolsDetails === undefined || claimDetails.hasClaimed) || !isUndefined(preClaimPools)) {
      return;
    }

    const unclaimedPools = getUnclaimedPools(poolsDetails);

    if (account && !loading && !isUndefined(claimDetails.hasClaimed)) {
      let details: any[] = !claimDetails.hasClaimed ? [{ GoodDollar: claimDetails }] : [];

      if (!isEmpty(unclaimedPools) && unclaimedPools) {
        details.push(...unclaimedPools);
      }

      // the claimReceipts are more reliable because of immediate availibilty,
      // opposed to fetching latest data from chain
      if (claimFlowStatus.claimReceipts) {
        const alreadyClaimed = claimFlowStatus.claimReceipts.filter(Boolean).map(receipt => receipt.to);

        details = details.filter(pool => !alreadyClaimed.includes(Object.values(pool as PoolDetails)[0].address));
      }

      setClaimPools(details);
    }
  }, [/*used*/ poolContracts, claimDetails, preClaimPools, poolsDetails, claimFlowStatus.isClaimingDone]);

  //Handle navigation to post-claim screen
  useEffect(() => {
    void (async () => {
      if (
        explorerPollLock.isAcquired("pollLock") ||
        explorerPollLock.isAcquired("resetLock") ||
        !isEmpty(postClaimPools) ||
        poolsDetails === undefined
      ) {
        return;
      }

      const unclaimedPools = getUnclaimedPools(poolsDetails);
      const noPostClaimPools = isEmpty(postClaimPools);
      const noUnclaimedPools = isEmpty(unclaimedPools);

      const hasClaimed = claimDetails.hasClaimed === true;

      if (unclaimedPools && unclaimedPools.length > 0) {
        setPostClaimPools(undefined);
        return;
      }

      if (account && hasClaimed && noPostClaimPools && noUnclaimedPools && !loading) {
        await explorerPollLock.acquire("pollLock");

        const claimTransactionList = await getRecentClaims(
          account,
          endpoints,
          provider ?? library,
          isArray(poolsDetails) && poolsDetails?.length > 0
        )
          .then(res => {
            return res;
          })
          .finally(() => {
            explorerPollLock.release("pollLock");
          });

        const details: any = [];

        details.push({ GoodDollar: claimTransactionList });

        setClaimPools([]);
        setPostClaimPools(details);
      }
    })();
  }, [postClaimPools, claimDetails, endpoints, poolsDetails]);

  return (
    <ClaimContext.Provider
      value={{
        account,
        chainId,
        claimDetails,
        poolsDetails,
        loading,
        claimPools: formattedTransactionList,
        claimFlowStatus,
        poolContracts,
        claimedAlt,
        error,
        supportedChains: supportedChains ?? [SupportedChains.CELO, SupportedChains.FUSE],
        withSignModals,
        txDetails,
        onNews,
        setTxDetails,
        setError,
        onClaim,
        onClaimFailed,
        onClaimSuccess,
        onConnect,
        onTxDetailsPress: onTxDetailsPress ?? noop,
        switchChain // todo: fix handling alt switch
      }}
    >
      {children}
    </ClaimContext.Provider>
  );
};
