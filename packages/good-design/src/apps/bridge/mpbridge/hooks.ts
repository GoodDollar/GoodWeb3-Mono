import { useState, useEffect, useMemo, useRef } from "react";
import { CurrencyValue } from "@usedapp/core";
import { useG$Amounts, useProductionG$Balance, G$Amount, useGetEnvChainId } from "@gooddollar/web3sdk-v2";
import { BigNumber } from "ethers";
import { fetchBridgeFees, useMPBBridgeHistory } from "@gooddollar/web3sdk-v2";
import type { IMPBFees, IMPBLimits } from "./types";
import { convertTransaction } from "./utils";

const CACHE_KEY = "mpb-bridge-fees-cache";
const CACHE_DURATION_MS = 5 * 60 * 1000;

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
    const isCacheValid = cached && cached.data && now - cached.timestamp < CACHE_DURATION_MS;

    if (cached && cached.data) {
      setFees(cached.data);
      setLoading(false);

      if (isCacheValid) {
        return;
      }
    }

    fetchBridgeFees()
      .then((feesData: any) => {
        if (feesData) {
          setStoredCache(feesData);
          setFees(feesData);
          setLoading(false);
          setError(null);
        } else {
          setError("We were unable to fetch bridge fees. Try again later or contact support.");
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(" Failed to fetch bridge fees:", err);
        setError("We were unable to fetch bridge fees. Try again later or contact support.");
        setLoading(false);
      });
  }, []);

  return { fees, loading, error };
};

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

  const expectedFee = useMemo(
    () =>
      fees?.[sourceChain]?.nativeFee
        ? G$Amount("G$", fees[sourceChain].nativeFee, chain, defaultEnv)
        : G$Amount("G$", BigNumber.from(0), chain, defaultEnv),
    [fees, sourceChain, chain, defaultEnv]
  );

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

export const useChainBalances = () => {
  const { G$: fuseBalance } = useProductionG$Balance(5, 122);
  const { G$: celoBalance } = useProductionG$Balance(5, 42220);
  const { G$: mainnetBalance } = useProductionG$Balance(5, 1);

  const getBalanceForChain = useMemo(
    () => (chain: string) => {
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
    },
    [fuseBalance, celoBalance, mainnetBalance]
  );

  return { getBalanceForChain };
};

export const useDebouncedTransactionHistory = (delay = 1000) => {
  const { historySorted: realTransactionHistory } = useMPBBridgeHistory() ?? {};
  const [debouncedHistory, setDebouncedHistory] = useState(realTransactionHistory);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setDebouncedHistory(realTransactionHistory), delay);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [realTransactionHistory, delay]);

  return {
    realTransactionHistory: debouncedHistory,
    historyLoading: !realTransactionHistory
  };
};

export const useConvertedTransactionHistory = (realTransactionHistory: any[] | undefined, sourceChain: string) => {
  const chain = sourceChain === "celo" ? 42220 : sourceChain === "mainnet" ? 1 : 122;
  return useMemo(
    () => realTransactionHistory?.slice(0, 5).map(tx => convertTransaction(tx, chain)) ?? [],
    [realTransactionHistory, chain]
  );
};

export { useBridgeStatusHandler } from "./useBridgeStatusHandler";
