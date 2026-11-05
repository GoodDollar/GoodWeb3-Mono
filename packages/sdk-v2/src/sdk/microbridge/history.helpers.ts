import { Contract, providers } from "ethers";
import { createAccountEventTopics, createBlockChunks, dedupeLogs } from "../mpbridge/hooks/useMPBBridgeHistory.helpers";

const HISTORY_LOOKBACK_BLOCKS = 20000;
const HISTORY_REQUEST_DELAY_MS = 500;
const EVENT_NAMES = ["BridgeRequest", "ExecutedTransfer"] as const;

export type MicroBridgeHistoryCache = {
  BridgeRequest?: providers.Log[];
  ExecutedTransfer?: providers.Log[];
  lastSyncedBlock?: number;
};

export const getMicroBridgeHistoryCacheKey = (chainId: number, address: string, account: string) =>
  `GD_MicroBridgeHistory_v1_${chainId}_${address.toLowerCase()}_${account.toLowerCase()}`;

/** Keep the original inclusive latest-20,000-block window, including on stale-cache refreshes. */
export const syncMicroBridgeHistory = async (
  contract: Contract,
  latestBlock: number,
  account: string,
  cache: MicroBridgeHistoryCache,
  cancelled: () => boolean = () => false
) => {
  const windowStart = Math.max(0, latestBlock - HISTORY_LOOKBACK_BLOCKS);
  const fromBlock = Math.max(windowStart, (cache.lastSyncedBlock ?? -1) + 1);
  const next: MicroBridgeHistoryCache = { ...cache };
  const chunks = createBlockChunks(fromBlock, latestBlock).reverse();
  let requested = false;

  try {
    for (const eventName of EVENT_NAMES) {
      const topicFilters = createAccountEventTopics(contract.interface.getEventTopic(eventName), account);
      for (const topics of topicFilters) {
        for (const chunk of chunks) {
          if (requested) {
            await new Promise(resolve => setTimeout(resolve, HISTORY_REQUEST_DELAY_MS));
          }
          if (cancelled()) return { cache: next };
          requested = true;
          const logs = await contract.provider.getLogs({ address: contract.address, topics, ...chunk });
          next[eventName] = dedupeLogs([...(next[eventName] || []), ...logs]);
        }
      }
    }

    for (const eventName of EVENT_NAMES) {
      next[eventName] = (next[eventName] || [])
        .filter(log => log.blockNumber >= windowStart)
        .sort((a, b) => a.blockNumber - b.blockNumber || a.logIndex - b.logIndex);
    }
    next.lastSyncedBlock = latestBlock;
    return { cache: next };
  } catch (error) {
    // Preserve successful chunks and the old cursor so the missing range is retried, not skipped.
    return { cache: next, error };
  }
};

export const decodeMicroBridgeHistoryLogs = (
  contract: Contract,
  eventName: (typeof EVENT_NAMES)[number],
  logs: providers.Log[] = []
) =>
  logs.map(log => ({
    data: contract.interface.decodeEventLog(eventName, log.data, log.topics),
    blockNumber: log.blockNumber,
    blockHash: log.blockHash,
    transactionIndex: log.transactionIndex,
    transactionHash: log.transactionHash,
    removed: log.removed
  }));
