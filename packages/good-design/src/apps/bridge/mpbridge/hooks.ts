import { useState, useEffect, useMemo, useRef } from "react";
import { CurrencyValue } from "@usedapp/core";
import { useG$Amounts, useProductionG$Balance, G$Amount, useGetEnvChainId } from "@gooddollar/web3sdk-v2";
import { BigNumber } from "ethers";
import { fetchBridgeFees, useBridgeHistory } from "@gooddollar/web3sdk-v2";
import type { IMPBFees, IMPBLimits } from "./types";

// Chain ID to chain name mapping - single source of truth
const CHAIN_ID_TO_NAME: Record<number, string> = {
  122: "Fuse",
  42220: "Celo",
  1: "Mainnet"
} as const;

// Bridge service mapping (0 = LayerZero, 1 = Axelar)
const BRIDGE_SERVICE_MAPPING = {
  0: "layerzero",
  1: "axelar"
} as const;

// Default bridge provider fallback
const DEFAULT_BRIDGE_PROVIDER = "layerzero";

// Recent transaction threshold (30 days in seconds)
const RECENT_TRANSACTION_THRESHOLD = 30 * 24 * 60 * 60;

// Helper function to get chain name from chain ID
const getChainName = (chainId: number): string => {
  return CHAIN_ID_TO_NAME[chainId] || "Unknown";
};

// Cache for bridge fees to prevent unnecessary API calls
// Using localStorage for persistence across page reloads
const CACHE_KEY = "mpb-bridge-fees-cache";
const CACHE_DURATION = 5 * 60 * 1000;

// Helper functions for localStorage cache
const getStoredCache = () => {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn("Failed to read bridge fees cache:", error);
    return null;
  }
};

const setStoredCache = (data: any) => {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        data,
        timestamp: Date.now()
      })
    );
  } catch (error) {
    console.warn("Failed to store bridge fees cache:", error);
  }
};

export const useBridgeFees = () => {
  const [fees, setFees] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = getStoredCache();
    const now = Date.now();
    const isCacheValid = cached && cached.data && now - cached.timestamp < CACHE_DURATION;

    // Show cached data immediately if available (stale-while-revalidate)
    if (cached && cached.data) {
      console.log("⚡ Using cached bridge fees (age:", Math.round((now - cached.timestamp) / 1000), "seconds)");
      setFees(cached.data);
      setLoading(false);

      // If cache is still valid, no need to fetch
      if (isCacheValid) {
        return;
      }
    }

    // Fetch fresh data
    console.log("🔄 Fetching bridge fees from API...");

    fetchBridgeFees()
      .then((feesData: any) => {
        if (feesData) {
          // Cache the fees data in localStorage
          setStoredCache(feesData);
          setFees(feesData);
          setLoading(false);
          setError(null);
          console.log("✅ Bridge fees fetched successfully");
        } else {
          setError("We were unable to fetch bridge fees. Try again later or contact support.");
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("❌ Failed to fetch bridge fees:", err);
        setError("We were unable to fetch bridge fees. Try again later or contact support.");
        setLoading(false);
      });
  }, []);

  return { fees, loading, error };
};

// Hook to get bridge estimate
export const useMPBBridgeEstimate = ({
  limits,
  fees,
  sourceChain,
  inputWei
}: {
  limits?: IMPBLimits;
  fees?: IMPBFees;
  sourceChain: string;
  inputWei: string;
}): {
  expectedFee: CurrencyValue;
  expectedToReceive: CurrencyValue;
  minimumAmount: CurrencyValue;
  maximumAmount: CurrencyValue;
  bridgeFee: CurrencyValue;
  nativeFee: CurrencyValue;
  zroFee: CurrencyValue;
} => {
  const chain = useMemo(() => (sourceChain === "celo" ? 42220 : sourceChain === "mainnet" ? 1 : 122), [sourceChain]);
  const { defaultEnv } = useGetEnvChainId(chain);

  const amountsConfig = useMemo(
    () => ({
      minimumAmount: limits?.[sourceChain]?.minAmount,
      maximumAmount: limits?.[sourceChain]?.maxAmount,
      bridgeFee: fees?.[sourceChain]?.nativeFee,
      minFee: fees?.[sourceChain]?.nativeFee,
      maxFee: fees?.[sourceChain]?.nativeFee,
      input: BigNumber.from(inputWei)
    }),
    [limits, fees, sourceChain, inputWei]
  );

  const { minimumAmount, maximumAmount, bridgeFee, input } = useG$Amounts(amountsConfig, "G$", chain);

  // For MPB, the fee is the native fee from LayerZero/Axelar
  const expectedFee = useMemo(
    () =>
      fees?.[sourceChain]?.nativeFee
        ? G$Amount("G$", fees[sourceChain].nativeFee, chain, defaultEnv)
        : G$Amount("G$", BigNumber.from(0), chain, defaultEnv),
    [fees, sourceChain, chain, defaultEnv]
  );

  // The fee is paid in the native token (CELO, ETH, etc.), not in G$
  const expectedToReceive = useMemo(() => input, [input]);

  const zroFee = useMemo(
    () =>
      fees?.[sourceChain]?.zroFee
        ? G$Amount("G$", fees[sourceChain].zroFee, chain, defaultEnv)
        : G$Amount("G$", BigNumber.from(0), chain, defaultEnv),
    [fees, sourceChain, chain, defaultEnv]
  );

  return useMemo(
    () => ({
      expectedFee,
      expectedToReceive,
      minimumAmount,
      maximumAmount,
      bridgeFee,
      nativeFee: expectedFee,
      zroFee
    }),
    [expectedFee, expectedToReceive, minimumAmount, maximumAmount, bridgeFee, zroFee]
  );
};

// Hook to get balances for all chains
export const useChainBalances = () => {
  // Query production G$ balances every 5 blocks, so balance is updated after bridging
  // Using production G$ to match what bridge operations use (not dev G$)
  const { G$: fuseBalance } = useProductionG$Balance(5, 122);
  const { G$: celoBalance } = useProductionG$Balance(5, 42220);
  const { G$: mainnetBalance } = useProductionG$Balance(5, 1);

  const getBalanceForChain = (chain: string) => {
    switch (chain) {
      case "fuse":
        return fuseBalance;
      case "celo":
        return celoBalance;
      case "mainnet":
        return mainnetBalance;
      default:
        return fuseBalance;
    }
  };

  return { getBalanceForChain };
};

export const useTransactionHistory = () => {
  const { historySorted: realTransactionHistory } = useBridgeHistory() ?? {};

  // Memoize the result to prevent unnecessary re-renders
  return useMemo(() => {
    return {
      realTransactionHistory,
      historyLoading: !realTransactionHistory
    };
  }, [realTransactionHistory]);
};

export const useDebouncedTransactionHistory = (delay = 1000) => {
  const { realTransactionHistory, historyLoading } = useTransactionHistory();
  const [debouncedHistory, setDebouncedHistory] = useState(realTransactionHistory);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedHistory(realTransactionHistory);
    }, delay);

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [realTransactionHistory, delay]);

  return useMemo(
    () => ({
      realTransactionHistory: debouncedHistory,
      historyLoading
    }),
    [debouncedHistory, historyLoading]
  );
};

export const useConvertedTransactionHistory = (realTransactionHistory: any[] | undefined, sourceChain: string) => {
  const chain = sourceChain === "celo" ? 42220 : sourceChain === "mainnet" ? 1 : 122;

  // Memoize the conversion to prevent unnecessary re-computations
  return useMemo(() => {
    const converted =
      realTransactionHistory?.slice(0, 5).map(tx => {
        const sourceChainId = tx.data?.sourceChainId?.toNumber();
        const targetChainId = tx.data?.targetChainId?.toNumber();

        // Get chain names using dictionary lookup (DRY principle)
        const sourceChainName = getChainName(sourceChainId);
        const targetChainName = getChainName(targetChainId);

        // Get bridge provider from transaction data using dictionary lookup
        const bridgeService = tx.data?.bridge;
        let bridgeProvider = DEFAULT_BRIDGE_PROVIDER;

        if (bridgeService !== undefined) {
          // MPB bridge data includes bridge service information
          const serviceKey = bridgeService as keyof typeof BRIDGE_SERVICE_MAPPING;
          bridgeProvider = BRIDGE_SERVICE_MAPPING[serviceKey] || DEFAULT_BRIDGE_PROVIDER;
        } else {
          const txTimestamp = tx.data?.timestamp || tx.timestamp || 0;
          const now = Math.floor(Date.now() / 1000);
          const isRecent = now - txTimestamp < RECENT_TRANSACTION_THRESHOLD;

          bridgeProvider = isRecent ? "layerzero" : "axelar";
        }

        // Determine status based on relayEvent (microbridge pattern)
        const status = tx.relayEvent ? "completed" : "pending";

        return {
          id: tx.data?.id || tx.transactionHash,
          transactionHash: tx.transactionHash,
          sourceChain: sourceChainName,
          targetChain: targetChainName,
          amount: tx.amount || "0",
          bridgeProvider,
          status,
          date: new Date((tx.data?.timestamp || Date.now() / 1000) * 1000),
          chainId: chain,
          network: targetChainName?.toUpperCase() || "FUSE",
          displayName: "GoodDollar Bridge",
          contractName: "GoodDollar",
          contractAddress: tx.data?.to || "",
          account: tx.data?.from || "",
          type: status === "completed" ? "bridge-in" : "bridge-pending",
          isPool: false
        };
      }) || [];

    return converted;
  }, [realTransactionHistory, chain]);
};
