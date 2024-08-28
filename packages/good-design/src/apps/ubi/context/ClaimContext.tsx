import React, { createContext, FC, PropsWithChildren, useContext, useCallback, useEffect, useState } from "react";
import {
  getRecentClaims,
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
  onSendTx,
  onSuccess
}) => {
  const { account, chainId, library, switchNetwork } = useEthers();
  const [refreshRate, setRefreshRate] = useState<QueryParams["refresh"]>(4);
  const [preClaimPools, setClaimPools] = useState<any[]>([]);
  const [postClaimPools, setPostClaimPools] = useState<any[]>([]);
  const activeChain = SupportedChains[chainId as number] ?? "CELO";
  const endpoints = explorerEndPoints[activeChain as keyof typeof SupportedChains];
  const [error, setError] = useState<string | undefined>(undefined);
  const claimedAlt = useClaimedAlt(chainId);

  const [txDetails, setTxDetails] = useState({ transaction: undefined, isOpen: false });

  const formattedTransactionList = useFormatClaimTransactions(
    postClaimPools.length > 0 ? postClaimPools : preClaimPools.length > 0 ? preClaimPools : [],
    chainId,
    account ?? ""
  );

  const claimDetails = useClaim(refreshRate);
  const { poolsDetails, loading, fetchPools } = useGetMemberUBIPools();

  const { poolContracts, setContract, setPoolContracts, transactionState, claimFlowStatus } =
    useMultiClaim(preClaimPools);
  const { errorMessage } = transactionState?.state ?? {};

  const onTxDetails = useCallback(
    (transaction: any) => {
      console.log("transactionTxDetails -->", { transaction });
      setTxDetails({ transaction, isOpen: true });
    },
    [txDetails]
  );

  const onClaimFailed = useCallback(async () => {
    setError(errorMessage ?? /*i18n*/ "An unknown error occurred while claiming");

    if (claimFlowStatus.isClaimingDone) {
      resetState();
    }
  }, [errorMessage, claimFlowStatus]);

  const resetState = () => {
    setRefreshRate("everyBlock");
    setClaimPools([]);
    setPostClaimPools([]);
    setPoolContracts([]);
    void fetchPools();

    // because of awaiting on-chain data (eg. contract status / tx validation) and context switching (account/network)
    // combined with the varying states of the claim process (pre-claim, post-claim, with/without additional pools),
    // we can end up in a wrong or mixed up page-state.
    // why we set a short lock to handle certain racing-conditions
    void explorerPollLock.acquire("resetLock");

    setTimeout(async () => {
      void explorerPollLock.release("resetLock");
      setRefreshRate(4);
    }, 300);
  };

  const onClaim = useCallback(async () => {
    // todo: handle onboard/upgrade flow?

    // initializes a cycle of claim transactions for all contracts
    setContract(poolContracts[0]);
  }, [poolsDetails, onSendTx, poolContracts]);

  const onClaimSuccess = useCallback(async () => {
    transactionState?.resetState();
    resetState();

    // should handle what happens after all claims are done (eg. showing a next-task modal)
    // if nothing is done, it will just silently finish
    await onSuccess?.();
  }, [transactionState, onSuccess]);

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

  useEffect(() => {
    resetState();
  }, [/*used*/ account, /* used */ chainId]);

  //Handle navigation to pre-claim screen
  useEffect(() => {
    if (!isEmpty(postClaimPools) || explorerPollLock.isAcquired("resetLock")) return;

    if (!isEmpty(poolContracts) && isEmpty(poolsDetails)) return;
    const unclaimedPools = getUnclaimedPools(poolsDetails);

    if (
      account &&
      isEmpty(preClaimPools) &&
      !loading &&
      !isUndefined(claimDetails.hasClaimed) &&
      (claimDetails.hasClaimed === false || !isEmpty(unclaimedPools))
    ) {
      const details: any[] = !claimDetails.hasClaimed ? [{ GoodDollar: [claimDetails] }] : [];

      if (!isEmpty(unclaimedPools)) {
        details.push(...poolsDetails);
      }

      setClaimPools(details);
    }
  }, [claimDetails, preClaimPools, poolContracts, poolsDetails]);

  //Handle navigation to post-claim screen
  useEffect(() => {
    void (async () => {
      if (explorerPollLock.isAcquired("pollLock") || explorerPollLock.isAcquired("resetLock")) return;

      if (!isEmpty(poolContracts) && isEmpty(poolsDetails)) return;

      const unclaimedPools = getUnclaimedPools(poolsDetails);
      const noPostClaimPools = isEmpty(postClaimPools);
      const noUnclaimedPools = isEmpty(unclaimedPools);

      const hasClaimed = claimDetails.hasClaimed === true;

      if (account && hasClaimed && noPostClaimPools && noUnclaimedPools && !loading) {
        await explorerPollLock.acquire("pollLock");

        const claimTransactionList = await getRecentClaims(
          account,
          endpoints,
          provider ?? library,
          isArray(poolsDetails) && poolsDetails?.length > 0
        ).then(res => {
          explorerPollLock.release("pollLock");
          return res;
        });

        const details: any = [];

        details.push({ GoodDollar: claimTransactionList });

        setPostClaimPools(details);
      }
    })();
  }, [/* used */ chainId, /*used*/ poolsDetails, postClaimPools, claimDetails, endpoints]);

  return (
    <ClaimContext.Provider
      value={{
        account,
        chainId,
        claimDetails,
        poolsDetails,
        loading,
        claimPools: formattedTransactionList,
        claimStatus: transactionState.state,
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
        resetState,
        onClaim,
        onClaimFailed,
        onClaimSuccess,
        onConnect,
        onTxDetails: onTxDetails ?? noop,
        switchChain // todo: fix handling alt switch
      }}
    >
      {children}
    </ClaimContext.Provider>
  );
};
