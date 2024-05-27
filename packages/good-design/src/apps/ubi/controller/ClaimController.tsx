import React, { useCallback, useEffect, useState } from "react";
import { useClaim } from "@gooddollar/web3sdk-v2";
import { QueryParams, useEthers } from "@usedapp/core";
import { noop } from "lodash";

import { ClaimWizard } from "../wizard/ClaimWizard";
import { useFormatClaimTransactions } from "../../../hooks";
// import { ClaimStats } from "../types";

//todo: make context if to much prop drilling
export const ClaimController = ({ handleConnect }: { handleConnect?: () => Promise<boolean> }) => {
  const { account, chainId } = useEthers();
  const [refreshRate, setRefreshRate] = useState<QueryParams["refresh"]>(12);
  const { claimCall, ...claimStats } = useClaim(refreshRate); // <-- rename to useClaimGd? extend to handle daily-ubi + additional pools?
  const [claimPools, setClaimPools] = useState<any[]>([]);

  // const ubiPools = useRegisteredPools(account) <-- return typeof ClaimStats [{ pool: "CELO", contract: celoContract, hasClaimed: claimedCelo, claimAmount}] || []

  const formattedTransactionList = useFormatClaimTransactions(claimPools, chainId);

  // should handle claiming based on transactionList
  const onClaim = useCallback(async () => {
    const { send } = claimCall ?? {};
    if (!send) return false;

    setRefreshRate("everyBlock");
    const claim = await send(); //todo: needs to handle minipay correctly

    if (!claim) {
      return false;
    }

    return true;
  }, [claimCall]);

  useEffect(() => {
    if (claimPools.length === 0 && claimStats.hasClaimed !== undefined) {
      setClaimPools(prev => [claimStats, ...prev]);
    }
  }, [claimStats]);

  return (
    <ClaimWizard
      {...{
        claimStats,
        claimPools: formattedTransactionList,
        chainId,
        onTxDetails: noop,
        onClaim,
        handleConnect,
        account
      }}
    />
  );
};
