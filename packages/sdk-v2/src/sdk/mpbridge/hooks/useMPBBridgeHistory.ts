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
  createAccountEventTopics,
  createBlockChunks,
  dedupeLogs,
  getErrorsByChain,
  getHistoryStartBlock,
  mergeBridgeHistoryCache
} from "./useMPBBridgeHistory.helpers";

const HISTORY_CACHE_VERSION = 7;
const CHAIN_IDS = [SupportedChains.FUSE, SupportedChains.CELO, SupportedChains.MAINNET, SupportedChains.XDC];
const HISTORY_REQUEST_DELAY_MS = 500;

export type MPBBridgeHistoryReadOnlyUrls = Partial<Record<number, string>>;

export type UseMPBBridgeHistoryOptions = {
  readOnlyUrls?: MPBBridgeHistoryReadOnlyUrls;
  chainIds?: SupportedChains[];
};

type ChainHistorySyncRange = {
  fromBlock: number;
  toBlock: number;
};

type ChainHistoryEventSyncResult = {
  chainId: SupportedChains;
  eventName: BridgeEventName;
  events: CachedBridgeEvent[];
  error?: string;
};

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
    const normalizedMessage = message.toLowerCase();
    const status = message.match(/status=(\d+)/)?.[1];
    const code = message.match(/code=([A-Z_]+)/)?.[1];

    if (
      normalizedMessage.includes("usage limit") ||
      normalizedMessage.includes("rate limit") ||
      normalizedMessage.includes("too many requests") ||
      message.includes("429")
    ) {
      return "RPC rate limit reached while refreshing history";
    }

    if (normalizedMessage.includes("forbidden") || message.includes("403")) {
      return "RPC request was rejected while refreshing history";
    }

    if (normalizedMessage.includes("processing response error")) {
      return "RPC response error while refreshing history";
    }

    if (message.includes("bad response")) {
      return `RPC response error while refreshing history${
        status || code
          ? ` (${[status ? `status=${status}` : "", code ? `code=${code}` : ""].filter(Boolean).join(", ")})`
          : ""
      }`;
    }

    if (message.includes("could not detect network")) {
      return `RPC network could not be detected${code ? ` (code=${code})` : ""}`;
    }

    if (message.includes("missing response")) {
      return `RPC did not return a response${code ? ` (code=${code})` : ""}`;
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
  account?: string,
  onChunkLogs?: (logs: ethers.providers.Log[]) => void
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
  const logsByChunk: ethers.providers.Log[] = [];
  const errors: unknown[] = [];
  const topicPasses = accountTopics.length > 1 ? [[accountTopics[0]], accountTopics.slice(1)] : [accountTopics];

  // Public RPCs are sensitive to bursty eth_getLogs traffic, so log requests stay within 500 blocks and run
  // sequentially with a short pause between requests. Indexed wallet topics keep each request narrow.
  for (let passIndex = 0; passIndex < topicPasses.length; passIndex += 1) {
    const topicsForPass = topicPasses[passIndex];

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
      const chunk = chunks[chunkIndex];
      try {
        const chunkLogsByTopic = await Promise.all(
          topicsForPass.map(topics =>
            provider.getLogs({
              address: contract.address,
              topics: topics as ethers.providers.Filter["topics"],
              fromBlock: chunk.fromBlock,
              toBlock: chunk.toBlock
            })
          )
        );

        const chunkLogs = dedupeLogs(chunkLogsByTopic.flat());
        logsByChunk.push(...chunkLogs);

        if (chunkLogs.length) {
          onChunkLogs?.(chunkLogs);
        }
      } catch (error) {
        errors.push(error);
        break;
      }

      if (chunkIndex < chunks.length - 1) {
        await delay(HISTORY_REQUEST_DELAY_MS);
      }
    }

    if (errors.length || passIndex >= topicPasses.length - 1) {
      break;
    }
  }

  return {
    logs: dedupeLogs(logsByChunk),
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

const getChainHistorySyncPlan = async (
  chainId: SupportedChains,
  contract: ethers.Contract,
  currentCache: MPBBridgeHistoryCache
) => {
  const provider = contract.provider as ethers.providers.Provider;
  const latestBlock = await provider.getBlockNumber();
  const chainState = currentCache.chains?.[chainId];
  const fromBlock = getHistoryStartBlock(latestBlock, chainState?.lastSyncedBlock);

  if (fromBlock > latestBlock) {
    return {
      chainId,
      latestBlock,
      range: undefined,
      chainState: {
        lastSyncedBlock: latestBlock,
        lastSuccessfulSyncAt: Date.now()
      } satisfies ChainSyncState
    };
  }

  return {
    chainId,
    latestBlock,
    chainState,
    range: { fromBlock, toBlock: latestBlock } satisfies ChainHistorySyncRange
  };
};

const syncChainHistoryRange = async (
  chainId: SupportedChains,
  contract: ethers.Contract,
  eventName: BridgeEventName,
  range: ChainHistorySyncRange,
  account?: string,
  onEvents?: (eventName: BridgeEventName, events: CachedBridgeEvent[]) => void
): Promise<ChainHistoryEventSyncResult> => {
  const eventResult = await fetchEventLogs(contract, eventName, range.fromBlock, range.toBlock, account, logs => {
    const events = filterEventsForAccount(normalizeProviderLogs(contract, chainId, eventName, logs), account);

    if (events.length) {
      onEvents?.(eventName, events);
    }
  });
  const errors = eventResult.errors;

  return {
    chainId,
    eventName,
    events: filterEventsForAccount(normalizeProviderLogs(contract, chainId, eventName, eventResult.logs), account),
    error: errors.length ? getPartialHistoryErrorMessage(errors) : undefined
  };
};

export const useMPBBridgeHistory = ({ readOnlyUrls, chainIds }: UseMPBBridgeHistoryOptions = {}) => {
  const { account } = useEthers();
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [historyCache, setHistoryCache] = useState<MPBBridgeHistoryCache>({});
  const [refreshTick, setRefreshTick] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const historyCacheRef = useRef<MPBBridgeHistoryCache>({});
  const storageWriteRef = useRef<Promise<void>>(Promise.resolve());

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

    const publishHistoryCache = (
      nextEvents: Partial<Record<BridgeEventName, CachedBridgeEvent[]>>,
      nextChains: Partial<Record<number, ChainSyncState>>
    ) => {
      const nextCache = mergeBridgeHistoryCache(historyCacheRef.current, nextEvents, nextChains);

      setHistoryCache(nextCache);
      historyCacheRef.current = nextCache;
      storageWriteRef.current = storageWriteRef.current
        .then(() => AsyncStorage.setItem(cacheKey, nextCache))
        .catch(error => console.warn("Failed to store MPB bridge history cache", error));
    };

    const syncChain = async ({ chainId, contract }: (typeof chainContracts)[number]) => {
      try {
        const plan = await getChainHistorySyncPlan(chainId, contract, historyCacheRef.current);

        if (cancelled) {
          return;
        }

        if (!plan.range) {
          publishHistoryCache({}, { [chainId]: plan.chainState });
          return;
        }

        let chainError: string | undefined;

        for (const eventName of ["BridgeRequest", "ExecutedTransfer"] as BridgeEventName[]) {
          const result = await syncChainHistoryRange(
            chainId,
            contract,
            eventName,
            plan.range,
            account,
            (chunkEventName, events) => {
              if (!cancelled) {
                publishHistoryCache({ [chunkEventName]: events }, {});
              }
            }
          );

          if (cancelled) {
            return;
          }

          chainError = chainError || result.error;
          publishHistoryCache({ [result.eventName]: result.events }, {});
        }

        publishHistoryCache(
          {},
          {
            [chainId]: chainError
              ? {
                  ...(historyCacheRef.current.chains?.[chainId] || {}),
                  error: { message: chainError, updatedAt: Date.now() }
                }
              : {
                  lastSyncedBlock: plan.latestBlock,
                  lastSuccessfulSyncAt: Date.now()
                }
          }
        );
      } catch (reason) {
        if (cancelled) {
          return;
        }

        publishHistoryCache(
          {},
          {
            [chainId]: {
              ...(historyCacheRef.current.chains?.[chainId] || {}),
              error: {
                message: getErrorMessage(reason),
                updatedAt: Date.now()
              }
            }
          }
        );
      }
    };

    const syncHistory = async () => {
      // Each chain has its own RPC, cursor, and error state, so bounded recent scans can run together.
      await Promise.all(
        chainContracts.map(async chainContract => {
          try {
            await syncChain(chainContract);
          } catch (reason) {
            console.warn("Unexpected MPB bridge history sync failure", reason);
          }
        })
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
    const clearedCache: MPBBridgeHistoryCache = {
      ...historyCacheRef.current,
      chains: Object.entries(historyCacheRef.current.chains || {}).reduce((result, [chainId, state]) => {
        result[Number(chainId)] = { ...state, error: undefined };
        return result;
      }, {} as Partial<Record<number, ChainSyncState>>)
    };

    historyCacheRef.current = clearedCache;
    setHistoryCache(clearedCache);

    if (cacheKey) {
      storageWriteRef.current = storageWriteRef.current
        .then(() => AsyncStorage.setItem(cacheKey, clearedCache))
        .catch(error => console.warn("Failed to clear MPB bridge history errors", error));
    }

    setRefreshTick(current => current + 1);
  }, [cacheKey]);

  return useMemo(() => {
    const allErrorsByChain = getErrorsByChain(historyCache);
    const activeErrorsByChain = activeChainIds.reduce((result, chainId) => {
      if (allErrorsByChain[chainId]) {
        result[chainId] = allErrorsByChain[chainId];
      }

      return result;
    }, {} as Record<number, string>);

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
      initialLoading: false,
      refreshing: syncing,
      errorsByChain: activeErrorsByChain,
      refreshHistory
    };
  }, [account, activeChainIds, cacheLoaded, historyCache, refreshHistory, syncing]);
};
