export type BridgeEventName = "BridgeRequest" | "ExecutedTransfer";

export type CachedBridgeEvent = {
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

export type ChainSyncErrorState = {
  message: string;
  updatedAt: number;
};

export type ChainSyncState = {
  lastSyncedBlock?: number;
  lastSuccessfulSyncAt?: number;
  error?: ChainSyncErrorState;
};

export type MPBBridgeHistoryCache = {
  BridgeRequest?: CachedBridgeEvent[];
  ExecutedTransfer?: CachedBridgeEvent[];
  chains?: Partial<Record<number, ChainSyncState>>;
};

// Public RPCs were failing on large getLogs windows, so every sync is split into small ranges.
export const HISTORY_BLOCK_CHUNK_SIZE = 500;
export const HISTORY_LOOKBACK_BLOCKS = 5000;

export const getHistoryStartBlock = (latestBlock: number, lastSyncedBlock?: number) =>
  Math.max(0, latestBlock - HISTORY_LOOKBACK_BLOCKS + 1, (lastSyncedBlock ?? -1) + 1);

const getEventCacheKey = (event: CachedBridgeEvent) =>
  event.id ? `${event.sourceChainId}:${event.id}` : `${event.sourceChainId}:${event.transactionHash}`;

const sortBridgeEvents = (events: CachedBridgeEvent[]) =>
  events.sort((a, b) =>
    a.blockNumber === b.blockNumber ? a.transactionIndex - b.transactionIndex : a.blockNumber - b.blockNumber
  );

export const createBlockChunks = (fromBlock: number, toBlock: number, chunkSize = HISTORY_BLOCK_CHUNK_SIZE) => {
  if (fromBlock > toBlock) {
    return [];
  }

  const chunks: Array<{ fromBlock: number; toBlock: number }> = [];

  // Build inclusive ranges so callers can safely fetch [fromBlock, toBlock] without gaps or overlaps.
  for (let cursor = fromBlock; cursor <= toBlock; cursor += chunkSize) {
    chunks.push({
      fromBlock: cursor,
      toBlock: Math.min(cursor + chunkSize - 1, toBlock)
    });
  }

  return chunks;
};

export const getAddressTopic = (address?: string) => {
  if (!address) {
    return undefined;
  }

  const normalizedAddress = address.toLowerCase();

  if (!/^0x[0-9a-f]{40}$/.test(normalizedAddress)) {
    return undefined;
  }

  return `0x${normalizedAddress.slice(2).padStart(64, "0")}`;
};

export const createAccountEventTopics = (eventTopic: string, account?: string) => {
  const accountTopic = getAddressTopic(account);

  if (!accountTopic) {
    return [[eventTopic]];
  }

  return [
    [eventTopic, accountTopic],
    [eventTopic, null, accountTopic]
  ];
};

export const dedupeLogs = <T extends { transactionHash: string; logIndex?: number }>(logs: T[]) => {
  const logsByKey = new Map<string, T>();

  logs.forEach(log => logsByKey.set(`${log.transactionHash}:${log.logIndex ?? 0}`, log));

  return Array.from(logsByKey.values());
};

export const mergeBridgeHistoryCache = (
  current: MPBBridgeHistoryCache,
  nextEvents: Partial<Record<BridgeEventName, CachedBridgeEvent[]>>,
  nextChains: Partial<Record<number, ChainSyncState>>
): MPBBridgeHistoryCache => {
  const mergedRequests = new Map<string, CachedBridgeEvent>();
  const mergedTransfers = new Map<string, CachedBridgeEvent>();

  (current.BridgeRequest || [])
    .concat(nextEvents.BridgeRequest || [])
    .forEach(event => mergedRequests.set(getEventCacheKey(event), event));

  (current.ExecutedTransfer || [])
    .concat(nextEvents.ExecutedTransfer || [])
    .forEach(event => mergedTransfers.set(getEventCacheKey(event), event));

  return {
    BridgeRequest: sortBridgeEvents(Array.from(mergedRequests.values())),
    ExecutedTransfer: sortBridgeEvents(Array.from(mergedTransfers.values())),
    chains: {
      // Per-chain sync state is merged independently so one failing RPC does not wipe successful cursors.
      ...(current.chains || {}),
      ...nextChains
    }
  };
};

export const getErrorsByChain = (cache: MPBBridgeHistoryCache) =>
  Object.entries(cache.chains || {}).reduce((result, [chainId, state]) => {
    if (state?.error?.message) {
      result[Number(chainId)] = state.error.message;
    }

    return result;
  }, {} as Record<number, string>);
