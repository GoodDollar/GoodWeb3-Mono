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
import { noop } from "lodash";
import { Lock } from "async-await-mutex-lock";

import { ClaimContextProps } from "../types";
import { useFormatClaimTransactions } from "../../../hooks";

const ClaimContext = createContext<ClaimContextProps | undefined>(undefined);
// Custom hook to use the ClaimContext
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
    onConnect?: () => Promise<boolean>;
    onSuccess?: () => Promise<void>;
    onSendTx?: () => void;
    onTxDetails?: (transaction: any) => void;
  } & PropsWithChildren
> = ({
  children,
  explorerEndPoints,
  provider,
  supportedChains,
  withSignModals,
  onConnect,
  onSuccess,
  onSendTx,
  onTxDetails
}) => {
  const { account, chainId, library, switchNetwork } = useEthers();
  const [refreshRate, setRefreshRate] = useState<QueryParams["refresh"]>(12);
  const [preClaimPools, setClaimPools] = useState<any[]>([]);
  const [postClaimPools, setPostClaimPools] = useState<any[]>([]);
  const activeChain = SupportedChains[chainId as number] ?? "CELO";
  const endpoints = explorerEndPoints[activeChain as keyof typeof SupportedChains];
  const [error, setError] = useState<string | undefined>(undefined);
  const claimedAlt = useClaimedAlt(chainId);

  const formattedTransactionList = useFormatClaimTransactions(
    postClaimPools.length > 0 ? postClaimPools : preClaimPools,
    chainId
  );

  const claimDetails = useClaim(refreshRate);
  const { poolsDetails } = useGetMemberUBIPools();

  const { poolContracts, setContract, transactionState, claimFlowStatus } = useMultiClaim(preClaimPools);
  const { errorMessage } = transactionState?.state ?? {};

  const onClaimFailed = useCallback(async () => {
    setError(errorMessage); //<-- todo: add proper error message
  }, [errorMessage]);

  const onClaim = useCallback(async () => {
    // todo: handle onboard/upgrade flow?

    // initializes a cycle of claim transactions for all contracts
    setContract(poolContracts[0]);
  }, [poolsDetails, onSendTx, poolContracts]);

  const onClaimSuccess = useCallback(async () => {
    transactionState?.resetState();

    // should handle what happens after all claims are done
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
    setClaimPools([]);
    setPostClaimPools([]);
    setRefreshRate("everyBlock");
  }, [/* used */ chainId]);

  useEffect(() => {
    if (account && preClaimPools.length === 0 && claimDetails.hasClaimed === false) {
      let details: any = [];
      details.push({ GoodDollar: [claimDetails] });

      if (poolsDetails) {
        details = [...details, ...poolsDetails];
      }

      setClaimPools(details);
    }
  }, [account, claimDetails, preClaimPools, poolsDetails]);

  useEffect(() => {
    void (async () => {
      if (explorerPollLock.isAcquired("pollLock")) return;

      if (account && postClaimPools.length === 0 && claimDetails.hasClaimed === true) {
        await explorerPollLock.acquire("pollLock");

        const claimTransactionList = await getRecentClaims(account, endpoints, provider ?? library).then(res => {
          explorerPollLock.release("pollLock");
          return res;
        });

        const details: any = [];

        details.push({ GoodDollar: claimTransactionList });

        setPostClaimPools(details);
      }
    })();
  }, [/* used */ chainId, /*used*/ poolsDetails, account, postClaimPools, claimDetails, endpoints]);

  return (
    <ClaimContext.Provider
      value={{
        account,
        chainId,
        claimDetails,
        poolsDetails,
        claimPools: formattedTransactionList,
        claimStatus: transactionState.state,
        claimFlowStatus,
        poolContracts,
        claimedAlt,
        error,
        supportedChains: supportedChains ?? [SupportedChains.CELO, SupportedChains.FUSE],
        withSignModals,
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
