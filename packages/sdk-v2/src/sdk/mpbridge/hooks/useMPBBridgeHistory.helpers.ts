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

export const HISTORY_WINDOW_DAYS = 30;
export const HISTORY_WINDOW_SECONDS = HISTORY_WINDOW_DAYS * 24 * 60 * 60;
export const HISTORY_BLOCK_CHUNK_SIZE = 500;

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

  for (let cursor = fromBlock; cursor <= toBlock; cursor += chunkSize) {
    chunks.push({
      fromBlock: cursor,
      toBlock: Math.min(cursor + chunkSize - 1, toBlock)
    });
  }

  return chunks;
};

export const pruneExpiredEvents = (events: CachedBridgeEvent[], minTimestamp: number) =>
  events.filter(event => Number(event.timestamp || 0) >= minTimestamp);

export const getHistoryWindowStartTimestamp = (nowMs = Date.now()) => Math.floor(nowMs / 1000) - HISTORY_WINDOW_SECONDS;

export const mergeBridgeHistoryCache = (
  current: MPBBridgeHistoryCache,
  nextEvents: Partial<Record<BridgeEventName, CachedBridgeEvent[]>>,
  nextChains: Partial<Record<number, ChainSyncState>>,
  nowMs = Date.now()
): MPBBridgeHistoryCache => {
  const minTimestamp = getHistoryWindowStartTimestamp(nowMs);
  const mergedRequests = new Map<string, CachedBridgeEvent>();
  const mergedTransfers = new Map<string, CachedBridgeEvent>();

  pruneExpiredEvents((current.BridgeRequest || []).concat(nextEvents.BridgeRequest || []), minTimestamp).forEach(
    event => mergedRequests.set(getEventCacheKey(event), event)
  );

  pruneExpiredEvents((current.ExecutedTransfer || []).concat(nextEvents.ExecutedTransfer || []), minTimestamp).forEach(
    event => mergedTransfers.set(getEventCacheKey(event), event)
  );

  return {
    BridgeRequest: sortBridgeEvents(Array.from(mergedRequests.values())),
    ExecutedTransfer: sortBridgeEvents(Array.from(mergedTransfers.values())),
    chains: {
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
