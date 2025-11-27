import { useState, useEffect, useMemo, useRef } from "react";
import { CurrencyValue } from "@usedapp/core";
import { useG$Amounts, useProductionG$Balance, G$Amount, useGetEnvChainId } from "@gooddollar/web3sdk-v2";
import { BigNumber } from "ethers";
import { fetchBridgeFees, useMPBBridgeHistory } from "@gooddollar/web3sdk-v2";
import type { IMPBFees, IMPBLimits } from "./types";
import { convertTransaction } from "./utils";

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

    if (cached && cached.data) {
      console.log("⚡ Using cached bridge fees (age:", Math.round((now - cached.timestamp) / 1000), "seconds)");
      setFees(cached.data);
      setLoading(false);

      if (isCacheValid) {
        return;
      }
    }

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
  const { historySorted: realTransactionHistory } = useMPBBridgeHistory() ?? {};

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
    console.log("🔍 useConvertedTransactionHistory - Raw input:", {
      historyLength: realTransactionHistory?.length,
      sourceChain,
      chain,
      firstTx: realTransactionHistory?.[0]
    });

    const converted =
      realTransactionHistory?.slice(0, 5).map((tx, index) => {
        console.log(`🔍 Converting transaction ${index}:`, {
          fullTx: tx,
          amount: tx.amount,
          data: tx.data,
          dataAmount: tx.data?.amount,
          dataAmountString: tx.data?.amount?.toString(),
          relayEvent: tx.relayEvent,
          completedEvent: tx.completedEvent
        });

        const convertedTx = convertTransaction(tx, chain);
        console.log(`✅ Converted transaction ${index}:`, convertedTx);
        return convertedTx;
      }) || [];

    console.log("✅ useConvertedTransactionHistory - Final output:", converted);
    return converted;
  }, [realTransactionHistory, chain]);
};
