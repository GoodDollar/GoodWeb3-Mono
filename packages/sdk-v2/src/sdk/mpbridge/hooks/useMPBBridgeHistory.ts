import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEthers } from "@usedapp/core";
import { ethers } from "ethers";
import { first, groupBy, sortBy } from "lodash";
import { AsyncStorage } from "../../storage";
import { SupportedChains, formatAmount } from "../../constants";
import { useGetContract } from "../../base/react";
import {
  BridgeEventName,
  CachedBridgeEvent,
  ChainSyncState,
  MPBBridgeHistoryCache,
  HISTORY_BLOCK_CHUNK_SIZE,
  HISTORY_WINDOW_SECONDS,
  createBlockChunks,
  getErrorsByChain,
  mergeBridgeHistoryCache
} from "./useMPBBridgeHistory.helpers";

const HISTORY_CACHE_VERSION = 2;
const CHAIN_IDS = [SupportedChains.FUSE, SupportedChains.CELO, SupportedChains.MAINNET, SupportedChains.XDC];
const MAX_PARALLEL_CHUNKS = 3;

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

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Failed to load bridge history from RPC";
};

const runWithConcurrency = async <T>(tasks: Array<() => Promise<T>>, concurrency: number): Promise<T[]> => {
  const results: T[] = [];

  for (let index = 0; index < tasks.length; index += concurrency) {
    const nextResults = await Promise.all(tasks.slice(index, index + concurrency).map(task => task()));
    results.push(...nextResults);
  }

  return results;
};

const findHistoryStartBlock = async (
  provider: ethers.providers.Provider,
  latestBlockNumber: number,
  targetTimestamp: number
) => {
  const latestBlock = await provider.getBlock(latestBlockNumber);

  if (!latestBlock || latestBlock.timestamp <= targetTimestamp) {
    return latestBlockNumber;
  }

  let low = 0;
  let high = latestBlockNumber;

  // Binary search keeps the 30-day backfill exact without relying on chain-specific block-time guesses.
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const block = await provider.getBlock(mid);

    if (!block) {
      throw new Error(`Failed to fetch block ${mid} while backfilling bridge history`);
    }

    if (block.timestamp < targetTimestamp) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
};

const normalizeProviderLogs = (
  contract: ethers.Contract,
  sourceChainId: SupportedChains,
  logs: ethers.providers.Log[]
): CachedBridgeEvent[] =>
  logs.flatMap(log => {
    try {
      const parsedLog = contract.interface.parseLog(log);
      const targetChainId = parsedLog.args?.targetChainId || parsedLog.args?.[2];
      const amount = parsedLog.args?.amount || parsedLog.args?.[3];
      const timestamp = parsedLog.args?.timestamp || parsedLog.args?.[4];
      const bridge = parsedLog.args?.bridge || parsedLog.args?.[5];
      const id = parsedLog.args?.id || parsedLog.args?.[6];

      return [
        {
          transactionHash: log.transactionHash,
          blockHash: log.blockHash,
          blockNumber: log.blockNumber,
          transactionIndex: log.transactionIndex,
          removed: log.removed,
          sourceChainId,
          from: parsedLog.args?.from || parsedLog.args?.[0],
          to: parsedLog.args?.to || parsedLog.args?.[1],
          targetChainId: targetChainId?.toString?.() || SupportedChains.CELO.toString(),
          amount: amount?.toString?.() || "0",
          timestamp: timestamp?.toString?.() || "0",
          bridge,
          id: id ? id.toString() : undefined
        }
      ];
    } catch (error) {
      console.warn("Failed to parse bridge history log", error);
      return [];
    }
  });

const filterEventsForAccount = (events: CachedBridgeEvent[], account?: string) => {
  if (!account) {
    return events;
  }

  const normalizedAccount = account.toLowerCase();

  return events.filter(
    event => event.from?.toLowerCase() === normalizedAccount || event.to?.toLowerCase() === normalizedAccount
  );
};

const fetchEventLogs = async (
  contract: ethers.Contract,
  eventName: BridgeEventName,
  fromBlock: number,
  toBlock: number
) => {
  if (fromBlock > toBlock) {
    return [] as ethers.providers.Log[];
  }

  const provider = contract.provider as ethers.providers.Provider;
  const topic = contract.interface.getEventTopic(eventName);
  const chunks = createBlockChunks(fromBlock, toBlock, HISTORY_BLOCK_CHUNK_SIZE);

  // Public RPCs are sensitive to large eth_getLogs windows, so every request stays within 500 blocks.
  const logsByChunk = await runWithConcurrency(
    chunks.map(
      chunk => () =>
        provider.getLogs({
          address: contract.address,
          topics: [topic],
          fromBlock: chunk.fromBlock,
          toBlock: chunk.toBlock
        })
    ),
    MAX_PARALLEL_CHUNKS
  );

  return logsByChunk.flat();
};

const syncChainHistory = async (
  chainId: SupportedChains,
  contract: ethers.Contract,
  currentCache: MPBBridgeHistoryCache,
  account?: string
) => {
  const provider = contract.provider as ethers.providers.Provider;
  const latestBlock = await provider.getBlockNumber();
  const chainState = currentCache.chains?.[chainId];
  const targetTimestamp = Math.floor(Date.now() / 1000) - HISTORY_WINDOW_SECONDS;
  const fromBlock =
    chainState?.lastSyncedBlock !== undefined
      ? chainState.lastSyncedBlock + 1
      : await findHistoryStartBlock(provider, latestBlock, targetTimestamp);

  if (fromBlock > latestBlock) {
    return {
      chainId,
      bridgeRequests: [] as CachedBridgeEvent[],
      executedTransfers: [] as CachedBridgeEvent[],
      chainState: {
        lastSyncedBlock: latestBlock,
        lastSuccessfulSyncAt: Date.now()
      } satisfies ChainSyncState
    };
  }

  const [bridgeRequests, executedTransfers] = await Promise.all([
    fetchEventLogs(contract, "BridgeRequest", fromBlock, latestBlock),
    fetchEventLogs(contract, "ExecutedTransfer", fromBlock, latestBlock)
  ]);

  return {
    chainId,
    bridgeRequests: filterEventsForAccount(normalizeProviderLogs(contract, chainId, bridgeRequests), account),
    executedTransfers: filterEventsForAccount(normalizeProviderLogs(contract, chainId, executedTransfers), account),
    chainState: {
      lastSyncedBlock: latestBlock,
      lastSuccessfulSyncAt: Date.now()
    } satisfies ChainSyncState
  };
};

export const useMPBBridgeHistory = () => {
  const { account } = useEthers();
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [historyCache, setHistoryCache] = useState<MPBBridgeHistoryCache>({});
  const [refreshTick, setRefreshTick] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const historyCacheRef = useRef<MPBBridgeHistoryCache>({});

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

  const cacheKey = useMemo(() => {
    if (!account) return undefined;

    const contractAddresses = CHAIN_IDS.map(chainId => contracts[chainId]?.address?.toLowerCase() || "missing").join(
      ":"
    );

    return `GD_MPBBridgeHistory_v${HISTORY_CACHE_VERSION}_${account.toLowerCase()}_${contractAddresses}`;
  }, [account, contracts]);

  useEffect(() => {
    historyCacheRef.current = historyCache;
  }, [historyCache]);

  useEffect(() => {
    let cancelled = false;

    setCacheLoaded(false);
    setHistoryCache({});
    historyCacheRef.current = {};

    if (!cacheKey) {
      setCacheLoaded(true);
      return () => {
        cancelled = true;
      };
    }

    // Cache hydrate keeps the first paint fast while a background sync fetches new chain deltas.
    AsyncStorage.getItem<MPBBridgeHistoryCache>(cacheKey)
      .then(cached => {
        if (!cancelled) {
          const hydratedCache = cached || {};
          setHistoryCache(hydratedCache);
          historyCacheRef.current = hydratedCache;
          setCacheLoaded(true);
        }
      })
      .catch(error => {
        console.warn("Failed to read MPB bridge history cache", error);
        if (!cancelled) setCacheLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey]);

  useEffect(() => {
    void refreshTick;

    if (!cacheLoaded || !cacheKey) {
      return;
    }

    const chainContracts = CHAIN_IDS.flatMap(chainId =>
      contracts[chainId] ? [{ chainId, contract: contracts[chainId] as ethers.Contract }] : []
    );

    if (!chainContracts.length) {
      return;
    }

    let cancelled = false;

    setSyncing(true);

    const syncHistory = async () => {
      const currentCache = historyCacheRef.current;
      const settledChains = await Promise.allSettled(
        chainContracts.map(({ chainId, contract }) => syncChainHistory(chainId, contract, currentCache, account))
      );

      if (cancelled) {
        return;
      }

      const nextChains: Partial<Record<number, ChainSyncState>> = {};
      const nextBridgeRequests: CachedBridgeEvent[] = [];
      const nextExecutedTransfers: CachedBridgeEvent[] = [];

      settledChains.forEach((result, index) => {
        const { chainId } = chainContracts[index];

        if (result.status === "fulfilled") {
          nextChains[chainId] = result.value.chainState;
          nextBridgeRequests.push(...result.value.bridgeRequests);
          nextExecutedTransfers.push(...result.value.executedTransfers);
          return;
        }

        nextChains[chainId] = {
          ...(currentCache.chains?.[chainId] || {}),
          error: {
            message: getErrorMessage(result.reason),
            updatedAt: Date.now()
          }
        };
      });

      const nextCache = mergeBridgeHistoryCache(
        currentCache,
        {
          BridgeRequest: nextBridgeRequests,
          ExecutedTransfer: nextExecutedTransfers
        },
        nextChains
      );

      setHistoryCache(nextCache);
      historyCacheRef.current = nextCache;
      void AsyncStorage.setItem(cacheKey, nextCache).catch(error =>
        console.warn("Failed to store MPB bridge history cache", error)
      );
    };

    void syncHistory().finally(() => {
      if (!cancelled) {
        setSyncing(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [account, cacheKey, cacheLoaded, contracts, refreshTick]);

  const refreshHistory = useCallback(() => {
    setRefreshTick(current => current + 1);
  }, []);

  return useMemo(() => {
    const errorsByChain = getErrorsByChain(historyCache);
    const hasCachedRows = Boolean(
      (historyCache.BridgeRequest || []).length || (historyCache.ExecutedTransfer || []).length
    );

    if (!cacheLoaded) {
      return {
        history: undefined,
        historySorted: undefined,
        initialLoading: true,
        refreshing: false,
        errorsByChain,
        refreshHistory
      };
    }

    const bridgeRequests = (historyCache.BridgeRequest || []).map(hydrateCachedEvent);
    const completedTransfers = (historyCache.ExecutedTransfer || []).map(hydrateCachedEvent);

    const getEventId = (event: any) => {
      const id = event.data?.id || event.data?.[6];

      return id ? id.toString() : event.transactionHash;
    };

    const completedByChain = groupBy(completedTransfers, event => event.data.sourceChainId.toNumber());

    const completedByTargetChain = CHAIN_IDS.reduce((result, sourceChainId) => {
      result[sourceChainId] = groupBy(completedByChain[sourceChainId] || [], getEventId);
      return result;
    }, {} as Record<number, Record<string, any[]>>);

    const processBridgeRequestEvent = (event: any) => {
      type BridgeEvent = typeof event & { completedEvent: any; amount: string };
      const extended = event as BridgeEvent;
      const amountBN = event.data?.amount || ethers.BigNumber.from(0);
      const requestId = event.data?.id?.toString();
      const sourceChainId = event.data.sourceChainId.toNumber();

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
          (tx: any) =>
            tx.data?.from?.toLowerCase() === account?.toLowerCase() ||
            tx.data?.to?.toLowerCase() === account?.toLowerCase()
        )
      : historyCombined;

    const historySorted = sortBy(historyFiltered, (tx: any) => tx.data?.timestamp?.toNumber?.() || 0).reverse();

    return {
      history: historySorted,
      historySorted,
      initialLoading: syncing && !hasCachedRows,
      refreshing: syncing,
      errorsByChain,
      refreshHistory
    };
  }, [account, cacheLoaded, historyCache, refreshHistory, syncing]);
};
