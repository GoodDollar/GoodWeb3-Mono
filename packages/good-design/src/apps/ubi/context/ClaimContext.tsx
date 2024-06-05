import React, { createContext, FC, PropsWithChildren, useContext, useCallback, useEffect, useState } from "react";
import { getRecentClaims, SupportedChains, useClaim, useClaimedAlt } from "@gooddollar/web3sdk-v2";
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
  const { claimCall, ...claimStats } = useClaim(refreshRate); // <-- rename to useClaimGd? extend to handle daily-ubi + additional pools?
  const [preClaimPools, setClaimPools] = useState<any[]>([]);
  const [postClaimPools, setPostClaimPools] = useState<any[]>([]);
  const activeChain = SupportedChains[chainId as number] ?? "CELO";
  const endpoints = explorerEndPoints[activeChain as keyof typeof SupportedChains];
  const [error, setError] = useState<string | undefined>(undefined);
  const { errorMessage } = claimCall?.state ?? {};
  //todo: handle differently
  const claimedAlt = useClaimedAlt(chainId);

  const formattedTransactionList = useFormatClaimTransactions(
    postClaimPools.length > 0 ? postClaimPools : preClaimPools,
    chainId
  );

  const onClaimFailed = useCallback(async () => {
    setError(errorMessage); //<-- todo: add proper error message
  }, [errorMessage]);

  const onClaim = useCallback(async () => {
    const { send } = claimCall ?? {};
    if (!send) return;

    onSendTx?.();

    await send(); //todo: needs to handle minipay correctly
  }, [claimCall, onSendTx]);

  const onClaimSuccess = useCallback(async () => {
    claimCall?.resetState();

    await onSuccess?.();
  }, [claimStats, onSuccess]);

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
    if (account && preClaimPools.length === 0 && claimStats.hasClaimed === false) {
      setClaimPools(prev => [claimStats, ...prev]);
    }
  }, [account, claimStats, preClaimPools]);

  useEffect(() => {
    void (async () => {
      if (explorerPollLock.isAcquired("pollLock")) return;

      if (account && postClaimPools.length === 0 && claimStats.hasClaimed === true) {
        await explorerPollLock.acquire("pollLock");

        const claimTransactionList = await getRecentClaims(account, endpoints, provider ?? library).then(res => {
          explorerPollLock.release("pollLock");
          return res;
        });
        setPostClaimPools(claimTransactionList);
      }
    })();
  }, [/* used */ chainId, account, postClaimPools, claimStats, endpoints]);

  return (
    <ClaimContext.Provider
      value={{
        account,
        chainId,
        claimStats,
        claimPools: formattedTransactionList,
        claimStatus: claimCall?.state,
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
