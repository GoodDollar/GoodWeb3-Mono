import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEthers } from "@usedapp/core";
import { ethers } from "ethers";
import { first, groupBy, sortBy } from "lodash";
import Contracts from "@gooddollar/goodprotocol/releases/deployment.json";
import { CONTRACT_TO_ABI } from "../../base/sdk";
import { AsyncStorage } from "../../storage";
import { SupportedChains, formatAmount } from "../../constants";
import { useGetEnvChainId } from "../../base/react";
import { useReadOnlyProvider } from "../../../hooks/useMulticallAtChain";
import {
  BridgeEventName,
  CachedBridgeEvent,
  ChainSyncState,
  MPBBridgeHistoryCache,
  HISTORY_BLOCK_CHUNK_SIZE,
  HISTORY_WINDOW_SECONDS,
  createAccountEventTopics,
  createBlockChunks,
  dedupeLogs,
  getErrorsByChain,
  mergeBridgeHistoryCache
} from "./useMPBBridgeHistory.helpers";

const HISTORY_CACHE_VERSION = 5;
const CHAIN_IDS = [SupportedChains.FUSE, SupportedChains.CELO, SupportedChains.MAINNET, SupportedChains.XDC];
const HISTORY_REQUEST_DELAY_MS = 500;

export type MPBBridgeHistoryReadOnlyUrls = Partial<Record<number, string>>;

export type UseMPBBridgeHistoryOptions = {
  readOnlyUrls?: MPBBridgeHistoryReadOnlyUrls;
  chainIds?: SupportedChains[];
};

type SyncChainHistorySettlement =
  | { status: "fulfilled"; value: Awaited<ReturnType<typeof syncChainHistory>> }
  | { status: "rejected"; reason: unknown };

const useMPBBridgeHistoryContract = (chainId: SupportedChains, readOnlyUrls?: MPBBridgeHistoryReadOnlyUrls) => {
  const { defaultEnv } = useGetEnvChainId(chainId);
  const fallbackProvider = useReadOnlyProvider(chainId);
  const overrideUrl = readOnlyUrls?.[chainId];

  const provider = useMemo(() => {
    if (overrideUrl) {
      return new ethers.providers.StaticJsonRpcProvider(overrideUrl, chainId);
    }

    return fallbackProvider;
  }, [chainId, fallbackProvider, overrideUrl]);

  return useMemo(() => {
    const deployment = Contracts[defaultEnv as keyof typeof Contracts] as { MpbBridge?: string } | undefined;

    if (!provider || !deployment?.MpbBridge) {
      return;
    }

    return new ethers.Contract(deployment.MpbBridge, CONTRACT_TO_ABI.MpbBridge.abi, provider);
  }, [defaultEnv, provider]);
};

const hydrateCachedEvent = (event: CachedBridgeEvent) => {
  // Persist plain JSON in storage, then rebuild the BigNumber-shaped fields the rest of the hook expects.
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
  const simplifyMessage = (message: string) => {
    const status = message.match(/status=(\d+)/)?.[1];
    const code = message.match(/code=([A-Z_]+)/)?.[1];

    if (message.includes("bad response")) {
      return `bad response${
        status || code
          ? ` (${[status ? `status=${status}` : "", code ? `code=${code}` : ""].filter(Boolean).join(", ")})`
          : ""
      }`;
    }

    if (message.includes("could not detect network")) {
      return `could not detect network${code ? ` (code=${code})` : ""}`;
    }

    if (message.includes("missing response")) {
      return `missing response${code ? ` (code=${code})` : ""}`;
    }

    return message.length > 240 ? `${message.slice(0, 237)}...` : message;
  };

  if (error instanceof Error && error.message) {
    return simplifyMessage(error.message);
  }

  if (typeof error === "string") {
    return simplifyMessage(error);
  }

  return "Failed to load bridge history from RPC";
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const runSequentiallySettled = async <T>(
  tasks: Array<() => Promise<T>>,
  delayMs = HISTORY_REQUEST_DELAY_MS,
  options: { stopOnError?: boolean } = {}
) => {
  const results: T[] = [];
  const errors: unknown[] = [];

  for (let index = 0; index < tasks.length; index += 1) {
    let shouldStop = false;

    try {
      results.push(await tasks[index]());
    } catch (error) {
      errors.push(error);
      shouldStop = Boolean(options.stopOnError);
    }

    if (shouldStop) {
      break;
    }

    if (index < tasks.length - 1 && delayMs > 0) {
      await delay(delayMs);
    }
  }

  return { results, errors };
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
  eventName: BridgeEventName,
  logs: ethers.providers.Log[]
): CachedBridgeEvent[] =>
  logs.flatMap(log => {
    try {
      const parsedLog = contract.interface.parseLog(log);
      const targetChainId =
        eventName === "BridgeRequest" ? parsedLog.args?.targetChainId || parsedLog.args?.[2] : sourceChainId;
      const amount =
        eventName === "BridgeRequest"
          ? parsedLog.args?.amount || parsedLog.args?.normalizedAmount || parsedLog.args?.[3]
          : parsedLog.args?.amount || parsedLog.args?.normalizedAmount || parsedLog.args?.[2];
      const timestamp = eventName === "BridgeRequest" ? parsedLog.args?.timestamp || parsedLog.args?.[4] : "0";
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
  toBlock: number,
  account?: string
) => {
  if (fromBlock > toBlock) {
    return {
      logs: [] as ethers.providers.Log[],
      errors: [] as unknown[]
    };
  }

  const provider = contract.provider as ethers.providers.Provider;
  const topic = contract.interface.getEventTopic(eventName);
  const accountTopics = createAccountEventTopics(topic, account);
  const chunks = createBlockChunks(fromBlock, toBlock, HISTORY_BLOCK_CHUNK_SIZE).reverse();

  // Public RPCs are sensitive to bursty eth_getLogs traffic, so log requests stay within 500 blocks and run
  // sequentially with a short pause between requests. Indexed wallet topics keep each request narrow.
  const { results: logsByChunk, errors } = await runSequentiallySettled(
    chunks.flatMap(chunk =>
      accountTopics.map(
        topics => () =>
          provider.getLogs({
            address: contract.address,
            topics: topics as ethers.providers.Filter["topics"],
            fromBlock: chunk.fromBlock,
            toBlock: chunk.toBlock
          })
      )
    ),
    HISTORY_REQUEST_DELAY_MS,
    { stopOnError: true }
  );

  return {
    logs: dedupeLogs(logsByChunk.flat()),
    errors
  };
};

const getPartialHistoryErrorMessage = (errors: unknown[]) => {
  const uniqueMessages = Array.from(new Set(errors.map(getErrorMessage)));
  const [firstMessage, secondMessage] = uniqueMessages;

  if (!secondMessage) {
    return firstMessage || "Some history ranges could not refresh";
  }

  return `${firstMessage}; ${secondMessage}`;
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
    // Warm cache: resume from the last synced block. Cold cache: backfill the rolling history window.
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

  const bridgeRequestsResult = await fetchEventLogs(contract, "BridgeRequest", fromBlock, latestBlock, account);
  const executedTransfersResult = await fetchEventLogs(contract, "ExecutedTransfer", fromBlock, latestBlock, account);
  const errors = [...bridgeRequestsResult.errors, ...executedTransfersResult.errors];

  return {
    chainId,
    bridgeRequests: filterEventsForAccount(
      normalizeProviderLogs(contract, chainId, "BridgeRequest", bridgeRequestsResult.logs),
      account
    ),
    executedTransfers: filterEventsForAccount(
      normalizeProviderLogs(contract, chainId, "ExecutedTransfer", executedTransfersResult.logs),
      account
    ),
    chainState:
      errors.length > 0
        ? ({
            ...(chainState || {}),
            error: {
              message: getPartialHistoryErrorMessage(errors),
              updatedAt: Date.now()
            }
          } satisfies ChainSyncState)
        : ({
            lastSyncedBlock: latestBlock,
            lastSuccessfulSyncAt: Date.now()
          } satisfies ChainSyncState)
  };
};

export const useMPBBridgeHistory = ({ readOnlyUrls, chainIds }: UseMPBBridgeHistoryOptions = {}) => {
  const { account } = useEthers();
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [historyCache, setHistoryCache] = useState<MPBBridgeHistoryCache>({});
  const [refreshTick, setRefreshTick] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const historyCacheRef = useRef<MPBBridgeHistoryCache>({});

  const fuseBridgeContract = useMPBBridgeHistoryContract(SupportedChains.FUSE, readOnlyUrls);
  const celoBridgeContract = useMPBBridgeHistoryContract(SupportedChains.CELO, readOnlyUrls);
  const mainnetBridgeContract = useMPBBridgeHistoryContract(SupportedChains.MAINNET, readOnlyUrls);
  const xdcBridgeContract = useMPBBridgeHistoryContract(SupportedChains.XDC, readOnlyUrls);

  const contracts = useMemo(
    () => ({
      [SupportedChains.FUSE]: fuseBridgeContract,
      [SupportedChains.CELO]: celoBridgeContract,
      [SupportedChains.MAINNET]: mainnetBridgeContract,
      [SupportedChains.XDC]: xdcBridgeContract
    }),
    [celoBridgeContract, fuseBridgeContract, mainnetBridgeContract, xdcBridgeContract]
  );
  const activeChainIds = useMemo(() => {
    const requestedChainIds = chainIds?.length ? chainIds : CHAIN_IDS;
    const supportedChainIds = new Set<SupportedChains>(CHAIN_IDS);
    const uniqueChainIds = Array.from(
      new Set(requestedChainIds.filter((chainId): chainId is SupportedChains => supportedChainIds.has(chainId)))
    );

    return uniqueChainIds.length ? uniqueChainIds : CHAIN_IDS;
  }, [chainIds]);

  const cacheKey = useMemo(() => {
    if (!account) return undefined;

    const contractAddresses = CHAIN_IDS.map(chainId => contracts[chainId]?.address?.toLowerCase() || "missing").join(
      ":"
    );

    // Scope cache entries to the wallet and the deployed bridge addresses so network/config changes do not mix data.
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

    const chainContracts = activeChainIds.flatMap(chainId =>
      contracts[chainId] ? [{ chainId, contract: contracts[chainId] as ethers.Contract }] : []
    );

    if (!chainContracts.length) {
      return;
    }

    let cancelled = false;

    // Keep cached rows on screen and expose a separate refreshing state while each chain sync runs.
    setSyncing(true);

    const syncHistory = async () => {
      const currentCache = historyCacheRef.current;
      const settledChains: SyncChainHistorySettlement[] = [];

      // Sync every chain independently and sequentially so one RPC cannot rate-limit the others.
      for (const { chainId, contract } of chainContracts) {
        try {
          settledChains.push({
            status: "fulfilled",
            value: await syncChainHistory(chainId, contract, currentCache, account)
          });
        } catch (reason) {
          settledChains.push({
            status: "rejected",
            reason
          });
        }
      }

      if (cancelled) {
        return;
      }

      const nextChains: Partial<Record<number, ChainSyncState>> = {};
      const nextBridgeRequests: CachedBridgeEvent[] = [];
      const nextExecutedTransfers: CachedBridgeEvent[] = [];

      settledChains.forEach((result, index) => {
        const { chainId } = chainContracts[index];

        if (result.status === "fulfilled") {
          // Successful chains contribute rows and advance only their own cursor/error state.
          nextChains[chainId] = result.value.chainState;
          nextBridgeRequests.push(...result.value.bridgeRequests);
          nextExecutedTransfers.push(...result.value.executedTransfers);
          return;
        }

        // Failed chains keep their last good cursor and surface a chain-specific error for the UI.
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
      // Persist the merged cache after every refresh so the next mount can render immediately from storage.
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
  }, [account, activeChainIds, cacheKey, cacheLoaded, contracts, refreshTick]);

  const refreshHistory = useCallback(() => {
    setRefreshTick(current => current + 1);
  }, []);

  return useMemo(() => {
    const allErrorsByChain = getErrorsByChain(historyCache);
    const activeErrorsByChain = activeChainIds.reduce((result, chainId) => {
      if (allErrorsByChain[chainId]) {
        result[chainId] = allErrorsByChain[chainId];
      }

      return result;
    }, {} as Record<number, string>);
    const hasCachedRows = Boolean(
      (historyCache.BridgeRequest || []).length || (historyCache.ExecutedTransfer || []).length
    );

    if (!cacheLoaded) {
      return {
        history: undefined,
        historySorted: undefined,
        initialLoading: true,
        refreshing: false,
        errorsByChain: activeErrorsByChain,
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

      // Match a request against completion events from the other chains to preserve the old merged UX.
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
      errorsByChain: activeErrorsByChain,
      refreshHistory
    };
  }, [account, activeChainIds, cacheLoaded, historyCache, refreshHistory, syncing]);
};
