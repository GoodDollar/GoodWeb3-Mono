import { useEffect, useMemo, useState } from "react";
import { useEthers, useLogs, ChainId } from "@usedapp/core";
import { ethers } from "ethers";
import { first, groupBy, sortBy } from "lodash";
import { useRefreshOrNever } from "../../../hooks";
import { AsyncStorage } from "../../storage";
import { SupportedChains, formatAmount } from "../../constants";
import { useGetContract } from "../../base/react";

type BridgeEventName = "BridgeRequest" | "ExecutedTransfer";

type CachedBridgeEvent = {
  transactionHash: string;
  blockHash: string;
  blockNumber: number;
  transactionIndex: number;
  removed: boolean;
  sourceChainId: number;
  from?: string;
  to?: string;
  targetChainId: string;
  amount: string;
  timestamp: string;
  bridge?: string;
  id?: string;
};

type MPBBridgeHistoryCache = Partial<Record<BridgeEventName, CachedBridgeEvent[]>>;

const HISTORY_CACHE_VERSION = 1;

// Keep the live RPC scan intentionally small. XDC public RPCs reject wider
// eth_getLogs windows, and the cache below is what gives us persistence.
const HISTORY_BLOCK_WINDOW = 500;
const CHAIN_IDS = [SupportedChains.FUSE, SupportedChains.CELO, SupportedChains.MAINNET, SupportedChains.XDC];

const hydrateCachedEvent = (event: CachedBridgeEvent) => {
  const targetChainId = ethers.BigNumber.from(event.targetChainId);
  const amount = ethers.BigNumber.from(event.amount);
  const timestamp = ethers.BigNumber.from(event.timestamp);
  const id = event.id ? ethers.BigNumber.from(event.id) : undefined;

  return {
    transactionHash: event.transactionHash,
    blockHash: event.blockHash,
    blockNumber: event.blockNumber,
    transactionIndex: event.transactionIndex,
    removed: event.removed,
    data: {
      0: event.from,
      1: event.to,
      2: targetChainId,
      3: amount,
      4: timestamp,
      5: event.bridge,
      6: id,
      from: event.from,
      to: event.to,
      targetChainId,
      amount,
      timestamp,
      bridge: event.bridge,
      id,
      sourceChainId: { toNumber: () => event.sourceChainId }
    }
  };
};

const normalizeLiveEvents = (items: Array<{ sourceChainId: SupportedChains; events: any[] }>) =>
  items.flatMap(({ sourceChainId, events }) =>
    events.map((event: any) => {
      const targetChainId = event.data?.targetChainId || event.data?.[2];
      const amount = event.data?.amount || event.data?.[3];
      const timestamp = event.data?.timestamp || event.data?.[4];
      const bridge = event.data?.bridge || event.data?.[5];
      const id = event.data?.id || event.data?.[6];

      // useLogs returns decoded ethers values such as BigNumber. Store only
      // plain JSON strings/numbers so AsyncStorage round-trips cleanly.
      return {
        transactionHash: event.transactionHash,
        blockHash: event.blockHash,
        blockNumber: event.blockNumber,
        transactionIndex: event.transactionIndex,
        removed: event.removed,
        sourceChainId,
        from: event.data?.from || event.data?.[0],
        to: event.data?.to || event.data?.[1],
        targetChainId: targetChainId?.toString?.() || SupportedChains.CELO.toString(),
        amount: amount?.toString?.() || "0",
        timestamp: timestamp?.toString?.() || "0",
        bridge,
        id: id ? id.toString() : undefined
      };
    })
  );

export const useMPBBridgeHistory = () => {
  const { account } = useEthers();
  const refresh = useRefreshOrNever(5);
  const refreshFaster = useRefreshOrNever(2);
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [historyCache, setHistoryCache] = useState<MPBBridgeHistoryCache>({});

  const fuseBridgeContract = useGetContract("MpbBridge", true, "base", SupportedChains.FUSE);
  const celoBridgeContract = useGetContract("MpbBridge", true, "base", SupportedChains.CELO);
  const mainnetBridgeContract = useGetContract("MpbBridge", true, "base", SupportedChains.MAINNET);
  const xdcBridgeContract = useGetContract("MpbBridge", true, "base", SupportedChains.XDC);

  const contracts = useMemo(
    () => ({
      [SupportedChains.FUSE]: fuseBridgeContract,
      [SupportedChains.CELO]: celoBridgeContract,
      [SupportedChains.MAINNET]: mainnetBridgeContract,
      [SupportedChains.XDC]: xdcBridgeContract
    }),
    [celoBridgeContract, fuseBridgeContract, mainnetBridgeContract, xdcBridgeContract]
  );

  // These are the only live RPC queries. Each useLogs call scans only the
  // recent 500-block window; older discovered events come from AsyncStorage.
  const fuseBridgeRequests = useLogs(
    fuseBridgeContract ? { contract: fuseBridgeContract, event: "BridgeRequest", args: [] } : undefined,
    {
      chainId: SupportedChains.FUSE as unknown as ChainId,
      fromBlock: -HISTORY_BLOCK_WINDOW,
      refresh
    }
  );

  const celoBridgeRequests = useLogs(
    celoBridgeContract ? { contract: celoBridgeContract, event: "BridgeRequest", args: [] } : undefined,
    {
      chainId: SupportedChains.CELO as unknown as ChainId,
      fromBlock: -HISTORY_BLOCK_WINDOW,
      refresh
    }
  );

  const mainnetBridgeRequests = useLogs(
    mainnetBridgeContract ? { contract: mainnetBridgeContract, event: "BridgeRequest", args: [] } : undefined,
    {
      chainId: SupportedChains.MAINNET as unknown as ChainId,
      fromBlock: -HISTORY_BLOCK_WINDOW,
      refresh
    }
  );

  const xdcBridgeRequests = useLogs(
    xdcBridgeContract ? { contract: xdcBridgeContract, event: "BridgeRequest", args: [] } : undefined,
    {
      chainId: SupportedChains.XDC as unknown as ChainId,
      fromBlock: -HISTORY_BLOCK_WINDOW,
      refresh
    }
  );

  const fuseBridgeCompleted = useLogs(
    fuseBridgeContract ? { contract: fuseBridgeContract, event: "ExecutedTransfer", args: [] } : undefined,
    {
      chainId: SupportedChains.FUSE as unknown as ChainId,
      fromBlock: -HISTORY_BLOCK_WINDOW,
      refresh: refreshFaster
    }
  );

  const celoBridgeCompleted = useLogs(
    celoBridgeContract ? { contract: celoBridgeContract, event: "ExecutedTransfer", args: [] } : undefined,
    {
      chainId: SupportedChains.CELO as unknown as ChainId,
      fromBlock: -HISTORY_BLOCK_WINDOW,
      refresh: refreshFaster
    }
  );

  const mainnetBridgeCompleted = useLogs(
    mainnetBridgeContract ? { contract: mainnetBridgeContract, event: "ExecutedTransfer", args: [] } : undefined,
    {
      chainId: SupportedChains.MAINNET as unknown as ChainId,
      fromBlock: -HISTORY_BLOCK_WINDOW,
      refresh: refreshFaster
    }
  );

  const xdcBridgeCompleted = useLogs(
    xdcBridgeContract ? { contract: xdcBridgeContract, event: "ExecutedTransfer", args: [] } : undefined,
    {
      chainId: SupportedChains.XDC as unknown as ChainId,
      fromBlock: -HISTORY_BLOCK_WINDOW,
      refresh: refreshFaster
    }
  );

  const cacheKey = useMemo(() => {
    if (!account) return undefined;

    // Include contract addresses in the key so deployments/env changes do not
    // reuse stale logs from an older bridge contract.
    const contractAddresses = CHAIN_IDS.map(chainId => contracts[chainId]?.address?.toLowerCase() || "missing").join(
      ":"
    );

    return `GD_MPBBridgeHistory_v${HISTORY_CACHE_VERSION}_${account.toLowerCase()}_${contractAddresses}`;
  }, [account, contracts]);

  useEffect(() => {
    let cancelled = false;

    setCacheLoaded(false);
    setHistoryCache({});

    if (!cacheKey) {
      setCacheLoaded(true);
      return () => {
        cancelled = true;
      };
    }

    // Load local history first so the UI can show previously discovered bridge
    // events immediately, then merge fresh useLogs results in the effect below.
    AsyncStorage.getItem<MPBBridgeHistoryCache>(cacheKey)
      .then(cached => {
        if (!cancelled) {
          setHistoryCache(cached || {});
          setCacheLoaded(true);
        }
      })
      .catch(e => {
        console.warn("Failed to read MPB bridge history cache", e);
        if (!cancelled) setCacheLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey]);

  const freshCache = useMemo(() => {
    // Normalize all live logs into a single plain-object structure. The cache
    // does not care which chain produced the event; sourceChainId keeps that.
    const bridgeRequests = normalizeLiveEvents([
      { sourceChainId: SupportedChains.FUSE, events: fuseBridgeRequests?.value || [] },
      { sourceChainId: SupportedChains.CELO, events: celoBridgeRequests?.value || [] },
      { sourceChainId: SupportedChains.MAINNET, events: mainnetBridgeRequests?.value || [] },
      { sourceChainId: SupportedChains.XDC, events: xdcBridgeRequests?.value || [] }
    ]);

    const completedTransfers = normalizeLiveEvents([
      { sourceChainId: SupportedChains.FUSE, events: fuseBridgeCompleted?.value || [] },
      { sourceChainId: SupportedChains.CELO, events: celoBridgeCompleted?.value || [] },
      { sourceChainId: SupportedChains.MAINNET, events: mainnetBridgeCompleted?.value || [] },
      { sourceChainId: SupportedChains.XDC, events: xdcBridgeCompleted?.value || [] }
    ]);

    return {
      BridgeRequest: bridgeRequests,
      ExecutedTransfer: completedTransfers
    };
  }, [
    fuseBridgeRequests,
    celoBridgeRequests,
    mainnetBridgeRequests,
    xdcBridgeRequests,
    fuseBridgeCompleted,
    celoBridgeCompleted,
    mainnetBridgeCompleted,
    xdcBridgeCompleted
  ]);

  useEffect(() => {
    if (!cacheLoaded || !cacheKey) return;
    if (!freshCache.BridgeRequest.length && !freshCache.ExecutedTransfer.length) return;

    setHistoryCache(current => {
      // Fresh useLogs results are merged into the persisted cache. This turns a
      // rolling 500-block scan into local history that survives page/app reloads.
      const bridgeRequests = new Map<string, CachedBridgeEvent>();
      const completedTransfers = new Map<string, CachedBridgeEvent>();

      (current.BridgeRequest || []).concat(freshCache.BridgeRequest).forEach(event => {
        // Bridge ids are stable across source/target chains. Fall back to tx
        // hash for malformed or older cached entries that do not contain an id.
        const key = event.id ? `${event.sourceChainId}:${event.id}` : `${event.sourceChainId}:${event.transactionHash}`;
        bridgeRequests.set(key, event);
      });

      (current.ExecutedTransfer || []).concat(freshCache.ExecutedTransfer).forEach(event => {
        const key = event.id ? `${event.sourceChainId}:${event.id}` : `${event.sourceChainId}:${event.transactionHash}`;
        completedTransfers.set(key, event);
      });

      const next = {
        BridgeRequest: Array.from(bridgeRequests.values()).sort((a, b) =>
          a.blockNumber === b.blockNumber ? a.transactionIndex - b.transactionIndex : a.blockNumber - b.blockNumber
        ),
        ExecutedTransfer: Array.from(completedTransfers.values()).sort((a, b) =>
          a.blockNumber === b.blockNumber ? a.transactionIndex - b.transactionIndex : a.blockNumber - b.blockNumber
        )
      };

      // Persist only the normalized event shape; ethers BigNumber instances do
      // not survive JSON cleanly.
      void AsyncStorage.setItem(cacheKey, next).catch(e => console.warn("Failed to store MPB bridge history cache", e));

      return next;
    });
  }, [cacheKey, cacheLoaded, freshCache]);

  return useMemo(() => {
    if (!cacheLoaded) {
      return { historySorted: undefined };
    }

    // Rebuild the minimal decoded-event shape the existing MP bridge UI
    // expects. This keeps the render path compatible with the original useLogs
    // result while storing only JSON-safe values in AsyncStorage.
    const bridgeRequests = (historyCache.BridgeRequest || []).map(hydrateCachedEvent);
    const completedTransfers = (historyCache.ExecutedTransfer || []).map(hydrateCachedEvent);

    const getEventId = (e: any) => {
      const id = e.data?.id || e.data?.[6];

      return id ? id.toString() : e.transactionHash;
    };

    const completedByChain = groupBy(completedTransfers, event => event.data.sourceChainId.toNumber());

    const completedByTargetChain = CHAIN_IDS.reduce((result, sourceChainId) => {
      // Completion events are looked up by chain and bridge id so source
      // requests can be marked complete when the target-chain event is cached.
      result[sourceChainId] = groupBy(completedByChain[sourceChainId] || [], getEventId);

      return result;
    }, {} as Record<number, Record<string, any[]>>);

    const processBridgeRequestEvent = (e: any) => {
      type BridgeEvent = typeof e & { completedEvent: any; amount: string };
      const extended = e as BridgeEvent;
      const amountBN = e.data?.amount || ethers.BigNumber.from(0);
      const requestId = e.data?.id?.toString();
      const sourceChainId = e.data.sourceChainId.toNumber();

      // Completion happens on the opposite chain, so match request IDs against
      // all other chains.
      const completedEventsMap = CHAIN_IDS.filter(chainId => chainId !== sourceChainId).reduce((result, chainId) => {
        return { ...result, ...completedByTargetChain[chainId] };
      }, {} as Record<string, any[]>);

      extended.completedEvent =
        requestId && completedEventsMap[requestId] ? first(completedEventsMap[requestId]) : undefined;
      extended.amount = formatAmount(amountBN, 18, 2);

      return extended;
    };

    const historyCombined = bridgeRequests.map(processBridgeRequestEvent);

    const historyFiltered = account
      ? historyCombined.filter(
          // Keep only the connected wallet's bridge requests. Cached events are
          // wallet-scoped by key, but this guards against old/stale cache data.
          (tx: any) =>
            tx.data?.from?.toLowerCase() === account?.toLowerCase() ||
            tx.data?.to?.toLowerCase() === account?.toLowerCase()
        )
      : historyCombined;

    const historySorted = sortBy(historyFiltered, (tx: any) => tx.data?.timestamp?.toNumber?.() || 0).reverse();

    return { historySorted };
  }, [account, cacheLoaded, historyCache]);
};
