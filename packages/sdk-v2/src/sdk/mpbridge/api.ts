import { ethers } from "ethers";

const BRIDGE_FEES_CACHE_KEY = "mpb_bridge_fees_cache";
export const BRIDGE_FEES_CACHE_DURATION_MS = 20 * 60 * 1000;

interface CachedFees {
  data: any;
  timestamp: number;
}

let inFlightFeesRequest: Promise<any | null> | undefined;
let memoryFeesCache: CachedFees | null = null;

/**
 * The fee endpoint is shared by the route selector, validation, and final
 * transaction preparation. A single cache here keeps every caller consistent
 * and avoids each UI layer maintaining its own copy.
 */
const getCachedFees = (): CachedFees | null => {
  if (memoryFeesCache) {
    return memoryFeesCache;
  }

  if (typeof localStorage === "undefined") {
    return null;
  }

  try {
    const cached = localStorage.getItem(BRIDGE_FEES_CACHE_KEY);
    if (!cached) return null;

    memoryFeesCache = JSON.parse(cached);
    return memoryFeesCache;
  } catch {
    return null;
  }
};

const setCachedFees = (data: any): void => {
  const cached: CachedFees = {
    data,
    timestamp: Date.now()
  };
  memoryFeesCache = cached;

  if (typeof localStorage === "undefined") {
    return;
  }

  try {
    localStorage.setItem(BRIDGE_FEES_CACHE_KEY, JSON.stringify(cached));
  } catch {
    // Storage can be unavailable in privacy modes. The in-memory cache still
    // prevents duplicate requests during the current load.
  }
};

const requestBridgeFees = async (retries: number, delay: number, staleFees: any | null) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch("https://goodserver.gooddollar.org/bridge/estimatefees");

      if (response.ok) {
        const data = await response.json();
        setCachedFees(data);
        return data;
      }

      if (response.status === 429) {
        return staleFees;
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      console.error(`Error fetching bridge fees (attempt ${i + 1}/${retries}):`, error);
      if (i === retries - 1) {
        return staleFees;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return staleFees;
};

export const fetchBridgeFees = async (retries = 1, delay = 1000) => {
  const cached = getCachedFees();

  if (cached?.data && Date.now() - cached.timestamp < BRIDGE_FEES_CACHE_DURATION_MS) {
    return cached.data;
  }

  // Route selection and transaction preparation can request fees at nearly the
  // same time. Sharing the active promise guarantees one HTTP request per cache
  // refresh, while stale data remains available if the endpoint is rate-limited.
  if (!inFlightFeesRequest) {
    inFlightFeesRequest = requestBridgeFees(retries, delay, cached?.data ?? null).finally(() => {
      inFlightFeesRequest = undefined;
    });
  }

  return inFlightFeesRequest;
};

export const clearBridgeFeesCache = () => {
  memoryFeesCache = null;
  inFlightFeesRequest = undefined;

  if (typeof localStorage !== "undefined") {
    try {
      localStorage.removeItem(BRIDGE_FEES_CACHE_KEY);
    } catch {
      // No action is required when storage is unavailable.
    }
  }
};

export const convertFeeToWei = (fee: string): string => {
  const feeValue = parseFloat(fee);
  return ethers.utils.parseEther(feeValue.toString()).toString();
};

export const convertFeeFromWei = (weiAmount: string): string => {
  return ethers.utils.formatUnits(weiAmount, 18);
};

// Explorer link functions
export const getLayerZeroExplorerLink = (txHash: string, chainId: number) => {
  const chainName =
    chainId === 1
      ? "ethereum"
      : chainId === 122
      ? "fuse"
      : chainId === 42220
      ? "celo"
      : chainId === 50
      ? "xdc"
      : "ethereum";
  return `https://layerzeroscan.com/${chainName}/tx/${txHash}`;
};

export const getAxelarExplorerLink = (txHash: string, chainId: number) => {
  const chainName =
    chainId === 1
      ? "ethereum"
      : chainId === 122
      ? "fuse"
      : chainId === 42220
      ? "celo"
      : chainId === 50
      ? "xdc"
      : "ethereum";
  return `https://axelarscan.io/${chainName}/tx/${txHash}`;
};
