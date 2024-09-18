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

interface ClaimProviderProps {
  explorerEndPoints: { [key in keyof typeof SupportedChains]: string };
  supportedChains: SupportedChains[];
  withSignModals: boolean;
  provider?: any;
  onNews: () => void;
  onUpgrade: () => void;
  onConnect?: () => Promise<boolean>;
  onSuccess?: () => Promise<void>;
  onSendTx?: () => void;
  onSwitchChain?: () => Promise<void>;
  withNewsFeed: boolean;
}

export const ClaimProvider: FC<PropsWithChildren<ClaimProviderProps>> = ({
  children,
  explorerEndPoints = {
    MAINNET: "https://api.etherscan.io/api?",
    CELO: "https://explorer.celo.org/api?",
    FUSE: "https://explorer.fuse.io/api?"
  },
  provider,
  supportedChains,
  withSignModals,
  withNewsFeed = true,
  onUpgrade,
  onConnect,
  onNews,
  // onSendTx,
  onSuccess,
  onSwitchChain
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

  const switchChain = useCallback(() => {
    // 4902: Network is not added, and should be done manually
    // explanation to user is shown through network modal
    switchNetwork(SupportedChains[claimedAlt.altChain as keyof typeof SupportedChains]).catch((e: any) => {
      if (e.code === 4902) {
        // toggleNetworkModal()
        //todo: add network modal for gooddapp
      }
    });
  }, [switchNetwork, claimedAlt]);

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

  const onReset = useCallback(() => {
    setClaimPools(undefined);
    setPostClaimPools(undefined);
    void fetchPools();
  }, [onSuccess, chainId, account]);

  const onClaimSuccess = useCallback(async () => {
    // should handle what happens after all claims are done (eg. showing a next-task modal)
    // if nothing is done, it will just silently finish

    setClaimPools(undefined);
    setRefreshRate("everyBlock");
    void fetchPools();
    await onSuccess?.();
  }, [onSuccess]);

  useEffect(() => {
    onReset();
  }, [/*used*/ chainId, /*used*/ account]);

  //Handling of claimable pools
  useEffect(() => {
    if (isUndefined(poolsDetails || claimDetails.hasClaimed) || !isUndefined(preClaimPools)) {
      return;
    }

    const unclaimedPools = getUnclaimedPools(poolsDetails);

    if (account && !loading && !isUndefined(claimDetails.hasClaimed)) {
      let details: any[] = !claimDetails.hasClaimed ? [claimDetails] : [];

      if (!isEmpty(unclaimedPools) && unclaimedPools) {
        details.push(...unclaimedPools);
      }

      // the claimReceipts are available faster then awaiting useCall and sdk responses
      if (claimFlowStatus.claimReceipts) {
        const alreadyClaimed = claimFlowStatus.claimReceipts.filter(Boolean).map(receipt => receipt.to);

        details = details.filter((pool: PoolDetails) => !alreadyClaimed.includes(pool.address));
      }

      setClaimPools(details);
    }
  }, [/*used*/ poolContracts, claimDetails, preClaimPools, poolsDetails, claimFlowStatus.isClaimingDone]);

  //Handling of post-claim transaction list
  useEffect(() => {
    void (async () => {
      if (explorerPollLock.isAcquired("pollLock") || !isEmpty(postClaimPools) || poolsDetails === undefined) {
        return;
      }

      const noUnclaimedPools = !isEmpty(getUnclaimedPools(poolsDetails));

      const hasClaimed = claimDetails.hasClaimed === true;

      if (noUnclaimedPools) {
        setPostClaimPools(undefined);
        return;
      }

      if (account && hasClaimed && !noUnclaimedPools && !loading) {
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

        details.push(claimTransactionList);

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
        withNewsFeed,
        onUpgrade,
        onReset,
        onNews,
        setTxDetails,
        setError,
        onClaim,
        onClaimFailed,
        onClaimSuccess,
        onConnect,
        onTxDetailsPress: onTxDetailsPress ?? noop,
        switchChain: onSwitchChain ?? switchChain
      }}
    >
      {children}
    </ClaimContext.Provider>
  );
};
