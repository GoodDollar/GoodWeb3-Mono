import { useBlockNumbers, useEthers } from "@usedapp/core";
import { useReadonlyNetworks } from "@usedapp/core/dist/esm/src/providers/network/readonlyNetworks";
import { Contract } from "ethers";
import { useEffect, useMemo, useRef, useState } from "react";
import useRefreshOrNever from "../../hooks/useRefreshOrNever";
import { AsyncStorage } from "../storage";
import {
  decodeMicroBridgeHistoryLogs,
  getMicroBridgeHistoryCacheKey,
  MicroBridgeHistoryCache,
  syncMicroBridgeHistory
} from "./history.helpers";

/** Both event types share one per-chain queue, cache and successful cursor. */
export const useMicroBridgeHistory = (chainId: number, bridge?: Contract) => {
  const { account } = useEthers();
  const providers = useReadonlyNetworks();
  const provider = providers[chainId];
  const blockNumber = useBlockNumbers()[chainId];
  const refresh = useRefreshOrNever(5);
  const address = bridge?.address;
  const abi = bridge?.interface.format("json") as string | undefined;
  const contract = useMemo(
    () => (address && provider && abi ? new Contract(address, abi, provider) : undefined),
    [address, provider, abi]
  );
  const cacheKey = account && address ? getMicroBridgeHistoryCacheKey(chainId, address, account) : undefined;
  const [history, setHistory] = useState<{ key: string; cache: MicroBridgeHistoryCache }>();
  const syncRef = useRef<(block?: number) => Promise<void>>();

  useEffect(() => {
    if (!cacheKey || !account || !contract) return;
    let cancelled = false;
    let busy = false;
    let cache: MicroBridgeHistoryCache = {};
    let lastAttemptBlock: number | undefined;
    const hydrated = AsyncStorage.getItem<MicroBridgeHistoryCache>(cacheKey)
      .then(stored => {
        cache = stored || {};
        if (!cancelled) setHistory({ key: cacheKey, cache });
      })
      .catch(() => undefined);

    const sync = async (block?: number) => {
      if (busy || cancelled) return;
      busy = true;
      try {
        await hydrated;
        if (cancelled) return;
        const latestBlock = block ?? (await contract.provider.getBlockNumber());
        if (lastAttemptBlock !== undefined && latestBlock - lastAttemptBlock < 5) return;
        lastAttemptBlock = latestBlock;
        const result = await syncMicroBridgeHistory(contract, latestBlock, account, cache, () => cancelled);
        if (cancelled) return;
        cache = result.cache;
        setHistory({ key: cacheKey, cache });
        await AsyncStorage.setItem(cacheKey, cache).catch(() => undefined);
        if (result.error) console.warn("Microbridge history refresh failed", { chainId });
      } catch {
        // History failures remain independent of the form and transaction state.
        console.warn("Microbridge history refresh failed", { chainId });
      } finally {
        busy = false;
      }
    };

    syncRef.current = sync;
    void sync();
    return () => {
      cancelled = true;
      syncRef.current = undefined;
    };
  }, [account, cacheKey, chainId, contract]);

  useEffect(() => {
    if (refresh !== "never" && blockNumber !== undefined) void syncRef.current?.(blockNumber);
  }, [blockNumber, refresh]);

  return useMemo(() => {
    if (!contract || !cacheKey || history?.key !== cacheKey) return {};
    return {
      requests: { value: decodeMicroBridgeHistoryLogs(contract, "BridgeRequest", history.cache.BridgeRequest) },
      transfers: { value: decodeMicroBridgeHistoryLogs(contract, "ExecutedTransfer", history.cache.ExecutedTransfer) }
    };
  }, [cacheKey, contract, history]);
};
