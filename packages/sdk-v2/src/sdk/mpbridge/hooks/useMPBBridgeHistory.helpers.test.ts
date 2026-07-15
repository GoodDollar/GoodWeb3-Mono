/* eslint-env jest */

import {
  createAccountEventTopics,
  createBlockChunks,
  dedupeLogs,
  getAddressTopic,
  getErrorsByChain,
  getHistoryStartBlock,
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

  it("limits cold and stale-cursor syncs to the latest 5,000 blocks", () => {
    expect(getHistoryStartBlock(10_000)).toBe(5001);
    expect(getHistoryStartBlock(10_000, 100)).toBe(5001);
    expect(getHistoryStartBlock(10_000, 9800)).toBe(9801);
    expect(getHistoryStartBlock(100)).toBe(0);
  });

  it("creates indexed account topics for bridge history log filters", () => {
    const account = "0xc1bA0ACD3030321851889309497663998D87D8d6";
    const accountTopic = "0x000000000000000000000000c1ba0acd3030321851889309497663998d87d8d6";

    expect(getAddressTopic(account)).toBe(accountTopic);
    expect(createAccountEventTopics("0xtopic", account)).toEqual([
      ["0xtopic", accountTopic],
      ["0xtopic", null, accountTopic]
    ]);
  });

  it("falls back to the event topic when the account address is unavailable", () => {
    expect(createAccountEventTopics("0xtopic")).toEqual([["0xtopic"]]);
    expect(createAccountEventTopics("0xtopic", "invalid")).toEqual([["0xtopic"]]);
  });

  it("dedupes logs that match both indexed account filters", () => {
    expect(
      dedupeLogs([
        { transactionHash: "0x1", logIndex: 2, value: "from-match" },
        { transactionHash: "0x1", logIndex: 2, value: "to-match" },
        { transactionHash: "0x2", logIndex: 1, value: "other" }
      ])
    ).toEqual([
      { transactionHash: "0x1", logIndex: 2, value: "to-match" },
      { transactionHash: "0x2", logIndex: 1, value: "other" }
    ]);
  });

  it("merges cached history rows and keeps chain sync state", () => {
    const nowMs = new Date("2026-06-29T00:00:00.000Z").getTime();
    const recentTimestamp = Math.floor(nowMs / 1000) - 60;
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
          timestamp: "1",
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
      }
    );

    expect(nextCache.BridgeRequest).toHaveLength(2);
    expect(nextCache.BridgeRequest?.[1].transactionHash).toBe("0xkeep-updated");
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
