import React, { useCallback, useEffect, useState } from "react";
import { getRecentClaims, SupportedChains, useClaim } from "@gooddollar/web3sdk-v2";
import { QueryParams, useEthers } from "@usedapp/core";
import { noop } from "lodash";

import { ClaimWizard } from "../wizard/ClaimWizard";
import { useFormatClaimTransactions } from "../../../hooks";

//todo: make context if to much prop drilling
interface ClaimControllerProps {
  handleConnect?: () => Promise<boolean>;
  explorerEndPoints: {
    [key in keyof typeof SupportedChains]: string;
  };
}

export const ClaimController = ({ handleConnect, explorerEndPoints }: ClaimControllerProps) => {
  const { account, chainId, library } = useEthers();
  const [refreshRate, setRefreshRate] = useState<QueryParams["refresh"]>(12);
  const { claimCall, ...claimStats } = useClaim(refreshRate); // <-- rename to useClaimGd? extend to handle daily-ubi + additional pools?
  const [preClaimPools, setClaimPools] = useState<any[]>([]);
  const [postClaimPools, setPostClaimPools] = useState<any[]>([]);
  const activeChain = SupportedChains[chainId as number] ?? "CELO";
  const endpoints = explorerEndPoints[activeChain as keyof typeof SupportedChains];

  // const ubiPools = useRegisteredPools(account) <-- return typeof ClaimStats [{ pool: "CELO", contract: celoContract, hasClaimed: claimedCelo, claimAmount}] || []

  const formattedTransactionList = useFormatClaimTransactions(
    postClaimPools.length > 0 ? postClaimPools : preClaimPools,
    chainId
  );

  // should handle claiming based on transactionList
  const onClaim = useCallback(async () => {
    const { send } = claimCall ?? {};
    if (!send) return;

    setRefreshRate("everyBlock");
    await send(); //todo: needs to handle minipay correctly
  }, [claimCall]);

  useEffect(() => {
    if (account && preClaimPools.length === 0 && claimStats.hasClaimed === false) {
      setClaimPools(prev => [claimStats, ...prev]);
    }
  }, [claimStats]);

  useEffect(() => {
    void (async () => {
      if (account && postClaimPools.length === 0 && claimStats.hasClaimed === true) {
        const claimTransactionList = await getRecentClaims(account, endpoints, library);
        setPostClaimPools(claimTransactionList);
      }
    })();
  }, [claimStats]);

  return (
    <ClaimWizard
      {...{
        claimStats,
        claimPools: formattedTransactionList,
        chainId,
        onTxDetails: noop,
        claimStatus: claimCall?.state,
        onClaim,
        handleConnect,
        account
      }}
    />
  );
};
