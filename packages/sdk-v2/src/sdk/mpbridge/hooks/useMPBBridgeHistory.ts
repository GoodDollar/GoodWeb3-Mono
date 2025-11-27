import { useMemo } from "react";
import { useEthers, useLogs, ChainId } from "@usedapp/core";
import { ethers } from "ethers";
import { first, groupBy, sortBy } from "lodash";
import { useRefreshOrNever } from "../../../hooks";
import { useGetEnvChainId } from "../../base/react";
import { SupportedChains, formatAmount } from "../../constants";
import { useGetMPBContract } from "./useGetMPBContract";

export const useMPBBridgeHistory = () => {
  const { account } = useEthers();
  console.log("useMPBBridgeHistory account:", account);
  const refresh = useRefreshOrNever(5);
  const { baseEnv } = useGetEnvChainId();
  console.log("useMPBBridgeHistory baseEnv:", baseEnv);

  // Get bridge contracts for all supported chains (read-only)
  const fuseBridgeContract = useGetMPBContract(SupportedChains.FUSE, true);
  const celoBridgeContract = useGetMPBContract(SupportedChains.CELO, true);
  const mainnetBridgeContract = useGetMPBContract(SupportedChains.MAINNET, true);

  // Query BridgeRequest events from all chains
  const fuseBridgeRequests = useLogs(
    fuseBridgeContract
      ? {
          contract: fuseBridgeContract,
          event: "BridgeRequest",
          args: []
        }
      : undefined,
    {
      chainId: SupportedChains.FUSE as unknown as ChainId,
      fromBlock: -20000,
      refresh
    }
  );

  const celoBridgeRequests = useLogs(
    celoBridgeContract
      ? {
          contract: celoBridgeContract,
          event: "BridgeRequest",
          args: []
        }
      : undefined,
    {
      chainId: SupportedChains.CELO as unknown as ChainId,
      fromBlock: -20000,
      refresh
    }
  );

  const mainnetBridgeRequests = useLogs(
    mainnetBridgeContract
      ? {
          contract: mainnetBridgeContract,
          event: "BridgeRequest",
          args: []
        }
      : undefined,
    {
      chainId: SupportedChains.MAINNET as unknown as ChainId,
      fromBlock: -5000,
      refresh
    }
  );

  // Query BridgeCompleted events from all chains
  const fuseBridgeCompleted = useLogs(
    fuseBridgeContract
      ? {
          contract: fuseBridgeContract,
          event: "ExecutedTransfer",
          args: []
        }
      : undefined,
    {
      chainId: SupportedChains.FUSE as unknown as ChainId,
      fromBlock: -20000,
      refresh
    }
  );

  const celoBridgeCompleted = useLogs(
    celoBridgeContract
      ? {
          contract: celoBridgeContract,
          event: "ExecutedTransfer",
          args: []
        }
      : undefined,
    {
      chainId: SupportedChains.CELO as unknown as ChainId,
      fromBlock: -20000,
      refresh
    }
  );

  const mainnetBridgeCompleted = useLogs(
    mainnetBridgeContract
      ? {
          contract: mainnetBridgeContract,
          event: "ExecutedTransfer",
          args: []
        }
      : undefined,
    {
      chainId: SupportedChains.MAINNET as unknown as ChainId,
      fromBlock: -5000,
      refresh
    }
  );

  return useMemo(() => {
    // Wait for all logs to load
    if (
      !fuseBridgeRequests ||
      !celoBridgeRequests ||
      !mainnetBridgeRequests ||
      !fuseBridgeCompleted ||
      !celoBridgeCompleted ||
      !mainnetBridgeCompleted
    ) {
      return { historySorted: undefined };
    }

    const getEventId = (e: any) => {
      const id = e.data?.id || e.data?.[6];

      return id ? id.toString() : e.transactionHash;
    };

    const fuseCompleted = groupBy(fuseBridgeCompleted.value || [], getEventId);
    const celoCompleted = groupBy(celoBridgeCompleted.value || [], getEventId);
    const mainnetCompleted = groupBy(mainnetBridgeCompleted.value || [], getEventId);

    const processBridgeRequestEvent = (e: any, sourceChainId: number, completedEventsMap: Record<string, any[]>) => {
      console.log(`🔍 Processing BridgeRequest Event from chain ${sourceChainId}:`, {
        fullData: e.data,
        isArray: Array.isArray(e.data),
        amount: e.data?.[3],
        amountHex: e.data?.[3]?.hex,
        bridge: e.data?.[5],
        id: e.data?.[6],
        txHash: e.transactionHash
      });

      type BridgeEvent = typeof e & { completedEvent: any; amount: string };
      const extended = e as BridgeEvent;
      const amountBN = e.data?.[3] || ethers.BigNumber.from(0);
      const requestId = e.data?.[6]?.toString();
      extended.completedEvent =
        requestId && completedEventsMap[requestId] ? first(completedEventsMap[requestId]) : undefined;
      extended.amount = formatAmount(amountBN, 18, 2);
      console.log(
        `✅ Formatted amount for chain ${sourceChainId}:`,
        extended.amount,
        "from BigNumber:",
        amountBN.toString()
      );

      const targetChainIdValue = e.data?.[2]?.toNumber?.() || SupportedChains.CELO;
      extended.data = {
        ...e.data,
        from: e.data?.[0],
        to: e.data?.[1],
        targetChainId: { toNumber: () => targetChainIdValue },
        amount: amountBN,
        timestamp: e.data?.[4]?.toNumber?.() || 0,
        bridge: e.data?.[5],
        id: e.data?.[6],
        sourceChainId: { toNumber: () => sourceChainId }
      } as any;

      return extended;
    };

    // Process Fuse bridge requests - check Celo and Mainnet for completions
    const fuseCompletedMap = { ...celoCompleted, ...mainnetCompleted };
    const fuseHistory = (fuseBridgeRequests.value || []).map((e: any) =>
      processBridgeRequestEvent(e, SupportedChains.FUSE, fuseCompletedMap)
    );

    // Process Celo bridge requests - check Fuse and Mainnet for completions
    const celoCompletedMap = { ...fuseCompleted, ...mainnetCompleted };
    const celoHistory = (celoBridgeRequests.value || []).map((e: any) =>
      processBridgeRequestEvent(e, SupportedChains.CELO, celoCompletedMap)
    );

    // Process Mainnet bridge requests - check Fuse and Celo for completions
    const mainnetCompletedMap = { ...fuseCompleted, ...celoCompleted };
    const mainnetHistory = (mainnetBridgeRequests.value || []).map((e: any) =>
      processBridgeRequestEvent(e, SupportedChains.MAINNET, mainnetCompletedMap)
    );

    // Combine all histories
    const historyCombined = [...fuseHistory, ...celoHistory, ...mainnetHistory];

    // Filter by account (from or to)
    const historyFiltered = account
      ? historyCombined.filter(
          (tx: any) =>
            tx.data?.from?.toLowerCase() === account?.toLowerCase() ||
            tx.data?.target?.toLowerCase() === account?.toLowerCase()
        )
      : historyCombined;

    // Sort by timestamp (most recent first)
    const historySorted = sortBy(historyFiltered, (tx: any) => tx.data?.timestamp || 0).reverse();

    return { historySorted };
  }, [
    fuseBridgeRequests,
    celoBridgeRequests,
    mainnetBridgeRequests,
    fuseBridgeCompleted,
    celoBridgeCompleted,
    mainnetBridgeCompleted,
    account
  ]);
};
