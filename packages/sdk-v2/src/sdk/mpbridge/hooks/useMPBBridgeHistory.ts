import { useMemo } from "react";
import { useEthers, useLogs, ChainId } from "@usedapp/core";
import { ethers } from "ethers";
import { first, groupBy, sortBy } from "lodash";
import { useRefreshOrNever } from "../../../hooks";
import { SupportedChains, formatAmount } from "../../constants";
import { useGetContract } from "../../base/react";

export const useMPBBridgeHistory = () => {
  const { account } = useEthers();
  const refresh = useRefreshOrNever(5);

  const fuseBridgeContract = useGetContract("MPBBridge", true, "base", SupportedChains.FUSE);
  const celoBridgeContract = useGetContract("MPBBridge", true, "base", SupportedChains.CELO);
  const mainnetBridgeContract = useGetContract("MPBBridge", true, "base", SupportedChains.MAINNET);

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
      fromBlock: -5000,
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
      fromBlock: -5000,
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

  const refreshFaster = useRefreshOrNever(2);

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
      fromBlock: -5000,
      refresh: refreshFaster
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
      fromBlock: -5000,
      refresh: refreshFaster
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
      refresh: refreshFaster
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
      type BridgeEvent = typeof e & { completedEvent: any; amount: string };
      const extended = e as BridgeEvent;
      const amountBN = e.data?.[3] || ethers.BigNumber.from(0);
      const requestId = e.data?.[6]?.toString();
      extended.completedEvent =
        requestId && completedEventsMap[requestId] ? first(completedEventsMap[requestId]) : undefined;
      extended.amount = formatAmount(amountBN, 18, 2);

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

    const fuseCompletedMap = { ...celoCompleted, ...mainnetCompleted };
    const fuseHistory = (fuseBridgeRequests.value || []).map((e: any) =>
      processBridgeRequestEvent(e, SupportedChains.FUSE, fuseCompletedMap)
    );

    const celoCompletedMap = { ...fuseCompleted, ...mainnetCompleted };
    const celoHistory = (celoBridgeRequests.value || []).map((e: any) =>
      processBridgeRequestEvent(e, SupportedChains.CELO, celoCompletedMap)
    );

    const mainnetCompletedMap = { ...fuseCompleted, ...celoCompleted };
    const mainnetHistory = (mainnetBridgeRequests.value || []).map((e: any) =>
      processBridgeRequestEvent(e, SupportedChains.MAINNET, mainnetCompletedMap)
    );

    const historyCombined = [...fuseHistory, ...celoHistory, ...mainnetHistory];

    const historyFiltered = account
      ? historyCombined.filter(
          (tx: any) =>
            tx.data?.from?.toLowerCase() === account?.toLowerCase() ||
            tx.data?.target?.toLowerCase() === account?.toLowerCase()
        )
      : historyCombined;

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
