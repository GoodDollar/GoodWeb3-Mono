import { ethers } from "ethers";

/**
 * Bridge configuration changes very rarely. Keeping one bounded cache for the
 * limits and protocol fee avoids repeating the same RPC reads when components
 * remount, routes change, or validation runs immediately before submission.
 */
export const MPB_STATIC_DATA_CACHE_TTL_MS = 20 * 60 * 1000;

const STATIC_DATA_STORAGE_KEY = "mpb_bridge_static_data_cache_v1";

type SerializedStaticBridgeData = {
  minAmount: string;
  txLimit: string;
  protocolFeeBps: string;
  timestamp: number;
};

export type MPBStaticBridgeData = {
  minAmount: ethers.BigNumber;
  txLimit: ethers.BigNumber;
  protocolFeeBps: ethers.BigNumber;
};

const memoryCache = new Map<string, SerializedStaticBridgeData>();
const inFlightRequests = new Map<string, Promise<MPBStaticBridgeData>>();

const getCacheKey = (contract: ethers.Contract, chainId: number) => `${chainId}:${contract.address.toLowerCase()}`;

const readStoredCache = (): Record<string, SerializedStaticBridgeData> => {
  if (typeof localStorage === "undefined") {
    return {};
  }

  try {
    return JSON.parse(localStorage.getItem(STATIC_DATA_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const writeStoredCache = (cache: Record<string, SerializedStaticBridgeData>) => {
  if (typeof localStorage === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STATIC_DATA_STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Storage can be disabled or full. The in-memory cache still prevents
    // duplicate calls during the current session.
  }
};

const deserializeStaticData = (cached: SerializedStaticBridgeData): MPBStaticBridgeData => ({
  minAmount: ethers.BigNumber.from(cached.minAmount),
  txLimit: ethers.BigNumber.from(cached.txLimit),
  protocolFeeBps: ethers.BigNumber.from(cached.protocolFeeBps)
});

const getCachedStaticData = (cacheKey: string) => {
  const cached = memoryCache.get(cacheKey) || readStoredCache()[cacheKey];

  if (cached) {
    memoryCache.set(cacheKey, cached);
  }

  return cached;
};

const storeStaticData = (cacheKey: string, data: MPBStaticBridgeData) => {
  const serialized: SerializedStaticBridgeData = {
    minAmount: data.minAmount.toString(),
    txLimit: data.txLimit.toString(),
    protocolFeeBps: data.protocolFeeBps.toString(),
    timestamp: Date.now()
  };

  memoryCache.set(cacheKey, serialized);
  writeStoredCache({ ...readStoredCache(), [cacheKey]: serialized });
};

/**
 * Returns fresh cached configuration when available and deduplicates callers
 * while a refresh is running. If the RPC is temporarily unavailable, stale
 * configuration is preferred over making the bridge unusable; transaction-time
 * dynamic checks still run separately.
 */
export const fetchMPBStaticBridgeData = async (
  contract: ethers.Contract,
  chainId: number
): Promise<MPBStaticBridgeData> => {
  const cacheKey = getCacheKey(contract, chainId);
  const cached = getCachedStaticData(cacheKey);

  if (cached && Date.now() - cached.timestamp < MPB_STATIC_DATA_CACHE_TTL_MS) {
    return deserializeStaticData(cached);
  }

  const existingRequest = inFlightRequests.get(cacheKey);
  if (existingRequest) {
    return existingRequest;
  }

  const request = Promise.all([contract.bridgeLimits(), contract.bridgeFees()])
    .then(([limits, fees]) => {
      const data = {
        minAmount: ethers.BigNumber.from(limits.minAmount),
        txLimit: ethers.BigNumber.from(limits.txLimit),
        protocolFeeBps: ethers.BigNumber.from(fees.fee || 0)
      };

      storeStaticData(cacheKey, data);
      return data;
    })
    .catch(error => {
      if (cached) {
        return deserializeStaticData(cached);
      }

      throw error;
    })
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  inFlightRequests.set(cacheKey, request);
  return request;
};

export const clearMPBStaticBridgeDataCache = () => {
  memoryCache.clear();
  inFlightRequests.clear();

  if (typeof localStorage !== "undefined") {
    try {
      localStorage.removeItem(STATIC_DATA_STORAGE_KEY);
    } catch {
      // No action is required when storage is unavailable.
    }
  }
};
