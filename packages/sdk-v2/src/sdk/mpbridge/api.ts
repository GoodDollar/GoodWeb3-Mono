import { ethers } from "ethers";

const BRIDGE_FEES_CACHE_KEY = "mpb_bridge_fees_cache";
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface CachedFees {
  data: any;
  timestamp: number;
}

// Get cached fees from localStorage
const getCachedFees = (): any | null => {
  try {
    const cached = localStorage.getItem(BRIDGE_FEES_CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp }: CachedFees = JSON.parse(cached);
    const age = Date.now() - timestamp;

    if (age < CACHE_DURATION_MS) {
      console.log(`⚡ Using cached bridge fees (age: ${Math.floor(age / 1000)} seconds)`);
      return data;
    }

    // Cache expired, remove it
    localStorage.removeItem(BRIDGE_FEES_CACHE_KEY);
    return null;
  } catch (error) {
    console.error("Error reading cached fees:", error);
    return null;
  }
};

// Save fees to cache
const setCachedFees = (data: any): void => {
  try {
    const cached: CachedFees = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(BRIDGE_FEES_CACHE_KEY, JSON.stringify(cached));
  } catch (error) {
    console.error("Error caching fees:", error);
  }
};

// GoodDollar Bridge API functions
export const fetchBridgeFees = async (retries = 1, delay = 1000) => {
  // Check cache first
  const cachedFees = getCachedFees();
  if (cachedFees) {
    return cachedFees;
  }

  console.log("🔄 Fetching bridge fees from API...");

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch("https://goodserver.gooddollar.org/bridge/estimatefees");

      if (response.ok) {
        const data = await response.json();
        // Cache the successful response
        setCachedFees(data);
        console.log("✅ Bridge fees fetched successfully");
        return data;
      }

      // If rate limited (429), return cached fees or null
      if (response.status === 429) {
        console.warn("⚠️ Rate limited (429) - using cached fees if available");
        // Try to return even expired cache
        try {
          const cached = localStorage.getItem(BRIDGE_FEES_CACHE_KEY);
          if (cached) {
            const { data } = JSON.parse(cached);
            console.log("⚡ Using expired cache due to rate limiting");
            return data;
          }
        } catch (e) {
          // Ignore cache read errors
        }
        return null;
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      console.error(`Error fetching bridge fees (attempt ${i + 1}/${retries}):`, error);
      if (i === retries - 1) {
        // On final retry failure, try to use even expired cache
        try {
          const cached = localStorage.getItem(BRIDGE_FEES_CACHE_KEY);
          if (cached) {
            const { data } = JSON.parse(cached);
            console.log("⚡ Using expired cache due to fetch error");
            return data;
          }
        } catch (e) {
          // Ignore cache read errors
        }
        return null;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return null;
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
  const chainName = chainId === 1 ? "ethereum" : chainId === 122 ? "fuse" : chainId === 42220 ? "celo" : "ethereum";
  return `https://layerzeroscan.com/${chainName}/tx/${txHash}`;
};

export const getAxelarExplorerLink = (txHash: string, chainId: number) => {
  const chainName = chainId === 1 ? "ethereum" : chainId === 122 ? "fuse" : chainId === 42220 ? "celo" : "ethereum";
  return `https://axelarscan.io/${chainName}/tx/${txHash}`;
};
