import { Contract, providers, utils } from "ethers";
import TokenBridgeABI from "@gooddollar/bridge-contracts/artifacts/contracts/bridge/TokenBridge.sol/TokenBridge.json";
import { decodeMicroBridgeHistoryLogs, getMicroBridgeHistoryCacheKey, syncMicroBridgeHistory } from "./history.helpers";

const account = "0x0000000000000000000000000000000000000001";
const other = "0x0000000000000000000000000000000000000002";
const address = "0x0000000000000000000000000000000000000003";
const iface = new utils.Interface(TokenBridgeABI.abi);
const contractWith = (getLogs: jest.Mock) =>
  ({ address, interface: iface, provider: { getLogs } } as unknown as Contract);
const logFor = (eventName: string, args: unknown[], blockNumber = 100, logIndex = 0): providers.Log => {
  const encoded = iface.encodeEventLog(iface.getEvent(eventName), args);
  return {
    ...encoded,
    address,
    blockNumber,
    blockHash: `0x${"1".repeat(64)}`,
    transactionHash: `0x${"2".repeat(64)}`,
    transactionIndex: 0,
    logIndex,
    removed: false
  };
};

const runTimers = async <T>(pending: Promise<T>): Promise<T> => {
  let finished = false;
  void pending.finally(() => {
    finished = true;
  });
  while (!finished) {
    await Promise.resolve();
    jest.runOnlyPendingTimers();
  }
  return pending;
};

describe("Microbridge history", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("preserves the 20,000-block inclusive window with sequential ranges no larger than 500 blocks", async () => {
    let pending = 0;
    let maximumPending = 0;
    const getLogs = jest.fn<Promise<providers.Log[]>, [providers.Filter]>(async () => {
      pending += 1;
      maximumPending = Math.max(maximumPending, pending);
      await Promise.resolve();
      pending -= 1;
      return [];
    });
    const result = await runTimers(syncMicroBridgeHistory(contractWith(getLogs), 30000, account, {}));
    const filters = getLogs.mock.calls.map(call => call[0]);
    expect(filters).toHaveLength(164); // 41 chunks x 2 indexed address filters x 2 event types
    expect(maximumPending).toBe(1);
    expect(Math.min(...filters.map(filter => Number(filter.fromBlock)))).toBe(10000);
    expect(Math.max(...filters.map(filter => Number(filter.toBlock)))).toBe(30000);
    expect(filters.every(filter => Number(filter.toBlock) - Number(filter.fromBlock) + 1 <= 500)).toBe(true);
    const ranges = filters.slice(0, 41).reverse();
    ranges.slice(1).forEach((range, i) => expect(Number(range.fromBlock)).toBe(Number(ranges[i].toBlock) + 1));
    expect(filters[0].topics).toEqual([iface.getEventTopic("BridgeRequest"), utils.hexZeroPad(account, 32)]);
    expect(filters[41].topics).toEqual([iface.getEventTopic("BridgeRequest"), null, utils.hexZeroPad(account, 32)]);
    expect(result.cache.lastSyncedBlock).toBe(30000);
  });

  it("fetches only new blocks after a successful cursor and retains cached events", async () => {
    const cachedLog = logFor("BridgeRequest", [account, other, 42220, 10, false, 123, 7]);
    const getLogs = jest.fn<Promise<providers.Log[]>, [providers.Filter]>().mockResolvedValue([]);
    const result = await runTimers(
      syncMicroBridgeHistory(contractWith(getLogs), 110, account, {
        BridgeRequest: [cachedLog],
        lastSyncedBlock: 100
      })
    );
    expect(getLogs.mock.calls.map(call => [call[0].fromBlock, call[0].toBlock])).toEqual(Array(4).fill([101, 110]));
    expect(result.cache.BridgeRequest).toEqual([cachedLog]);
    expect(result.cache.lastSyncedBlock).toBe(110);
  });

  it("stops after an RPC failure, retains partial rows, and retries without advancing its cursor", async () => {
    const row = logFor("BridgeRequest", [account, other, 42220, 10, false, 123, 7], 900);
    const getLogs = jest.fn().mockResolvedValueOnce([row]).mockRejectedValueOnce(new Error("HTTP 429"));
    const failed = await runTimers(
      syncMicroBridgeHistory(contractWith(getLogs), 1000, account, { lastSyncedBlock: 0 })
    );
    expect(getLogs).toHaveBeenCalledTimes(2);
    expect(failed.error).toBeInstanceOf(Error);
    expect(failed.cache.BridgeRequest).toEqual([row]);
    expect(failed.cache.lastSyncedBlock).toBe(0);
    getLogs.mockReset().mockResolvedValue([row]);
    const retried = await runTimers(syncMicroBridgeHistory(contractWith(getLogs), 1000, account, failed.cache));
    expect(retried.cache.BridgeRequest).toEqual([row]);
    expect(retried.cache.lastSyncedBlock).toBe(1000);
  });

  it("dedupes sender/recipient matches and preserves Microbridge decoding and relay IDs", async () => {
    const request = logFor("BridgeRequest", [account, account, 42220, 10, false, 123, 7]);
    const executed = logFor("ExecutedTransfer", [account, account, other, 10, 1, 122, 99, 7], 101, 1);
    const getLogs = jest.fn(async (filter: providers.Filter) =>
      filter.topics?.[0] === iface.getEventTopic("BridgeRequest") ? [request] : [executed]
    );
    const contract = contractWith(getLogs);
    const result = await runTimers(syncMicroBridgeHistory(contract, 101, account, {}));
    expect(result.cache.BridgeRequest).toHaveLength(1);
    expect(result.cache.ExecutedTransfer).toHaveLength(1);
    const [decodedRequest] = decodeMicroBridgeHistoryLogs(contract, "BridgeRequest", result.cache.BridgeRequest);
    const [decodedExecution] = decodeMicroBridgeHistoryLogs(
      contract,
      "ExecutedTransfer",
      result.cache.ExecutedTransfer
    );
    expect(decodedRequest.data.timestamp.toString()).toBe("123");
    expect(decodedRequest.data.withRelay).toBe(false);
    expect(decodedRequest.data.targetChainId.toString()).toBe("42220");
    expect(decodedExecution.data.sourceChainId.toString()).toBe("122");
    expect(decodedExecution.data.id.toString()).toBe(decodedRequest.data.id.toString());
    expect(Object.keys(decodedRequest)).toEqual([
      "data",
      "blockNumber",
      "blockHash",
      "transactionIndex",
      "transactionHash",
      "removed"
    ]);
  });

  it("prunes the rolling lookback without adopting MPB's shorter 5,000-block coverage", async () => {
    const old = logFor("BridgeRequest", [account, other, 42220, 10, false, 123, 7], 9999);
    const retained = { ...old, blockNumber: 10000, logIndex: 1 };
    const getLogs = jest.fn(async () => []);
    const result = await runTimers(
      syncMicroBridgeHistory(contractWith(getLogs), 30000, account, {
        BridgeRequest: [old, retained],
        lastSyncedBlock: 29999
      })
    );
    expect(result.cache.BridgeRequest).toEqual([retained]);
  });

  it("scopes cache entries to account, chain and deployment", () => {
    const key = getMicroBridgeHistoryCacheKey(122, address, account);
    expect(getMicroBridgeHistoryCacheKey(122, address.toUpperCase(), account.toUpperCase())).toBe(key);
    expect(getMicroBridgeHistoryCacheKey(122, address, other)).not.toBe(key);
    expect(getMicroBridgeHistoryCacheKey(42220, address, account)).not.toBe(key);
    expect(getMicroBridgeHistoryCacheKey(122, other, account)).not.toBe(key);
  });

  it("cancels between paced requests without publishing a successful cursor", async () => {
    const getLogs = jest.fn(async () => []);
    const result = await runTimers(
      syncMicroBridgeHistory(contractWith(getLogs), 1000, account, {}, () => getLogs.mock.calls.length > 0)
    );
    expect(getLogs).toHaveBeenCalledTimes(1);
    expect(result.cache.lastSyncedBlock).toBeUndefined();
  });
});
