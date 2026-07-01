/* eslint-env jest */

import {
  createBlockChunks,
  getErrorsByChain,
  mergeBridgeHistoryCache,
  MPBBridgeHistoryCache
} from "./useMPBBridgeHistory.helpers";

describe("useMPBBridgeHistory helpers", () => {
  it("splits log ranges into 500-block chunks", () => {
    expect(createBlockChunks(100, 1201)).toEqual([
      { fromBlock: 100, toBlock: 599 },
      { fromBlock: 600, toBlock: 1099 },
      { fromBlock: 1100, toBlock: 1201 }
    ]);
  });

  it("merges history rows, prunes old cache entries, and keeps chain sync state", () => {
    const nowMs = new Date("2026-06-29T00:00:00.000Z").getTime();
    const recentTimestamp = Math.floor(nowMs / 1000) - 60;
    const oldTimestamp = Math.floor(nowMs / 1000) - 31 * 24 * 60 * 60;
    const currentCache: MPBBridgeHistoryCache = {
      BridgeRequest: [
        {
          transactionHash: "0xold",
          blockHash: "0xblock-old",
          blockNumber: 1,
          transactionIndex: 0,
          removed: false,
          sourceChainId: 122,
          from: "0xfrom",
          to: "0xto",
          targetChainId: "42220",
          amount: "10",
          timestamp: oldTimestamp.toString(),
          id: "1"
        },
        {
          transactionHash: "0xkeep",
          blockHash: "0xblock-keep",
          blockNumber: 10,
          transactionIndex: 0,
          removed: false,
          sourceChainId: 122,
          from: "0xfrom",
          to: "0xto",
          targetChainId: "42220",
          amount: "20",
          timestamp: recentTimestamp.toString(),
          id: "2"
        }
      ],
      ExecutedTransfer: [],
      chains: {
        122: {
          lastSyncedBlock: 20,
          error: {
            message: "old error",
            updatedAt: 1
          }
        }
      }
    };

    const nextCache = mergeBridgeHistoryCache(
      currentCache,
      {
        BridgeRequest: [
          {
            transactionHash: "0xkeep-updated",
            blockHash: "0xblock-keep-updated",
            blockNumber: 12,
            transactionIndex: 1,
            removed: false,
            sourceChainId: 122,
            from: "0xfrom",
            to: "0xto",
            targetChainId: "42220",
            amount: "30",
            timestamp: recentTimestamp.toString(),
            id: "2"
          }
        ],
        ExecutedTransfer: [
          {
            transactionHash: "0xcompleted",
            blockHash: "0xblock-completed",
            blockNumber: 30,
            transactionIndex: 0,
            removed: false,
            sourceChainId: 42220,
            from: "0xfrom",
            to: "0xto",
            targetChainId: "122",
            amount: "30",
            timestamp: recentTimestamp.toString(),
            id: "2"
          }
        ]
      },
      {
        122: {
          lastSyncedBlock: 40,
          lastSuccessfulSyncAt: nowMs
        },
        42220: {
          error: {
            message: "rpc failed",
            updatedAt: nowMs
          }
        }
      },
      nowMs
    );

    expect(nextCache.BridgeRequest).toHaveLength(1);
    expect(nextCache.BridgeRequest?.[0].transactionHash).toBe("0xkeep-updated");
    expect(nextCache.ExecutedTransfer).toHaveLength(1);
    expect(nextCache.chains?.[122]).toEqual({
      lastSyncedBlock: 40,
      lastSuccessfulSyncAt: nowMs
    });
    expect(getErrorsByChain(nextCache)).toEqual({
      42220: "rpc failed"
    });
  });
});
