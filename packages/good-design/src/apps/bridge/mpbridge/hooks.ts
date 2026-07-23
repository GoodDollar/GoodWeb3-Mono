import { useState, useEffect, useMemo, useRef } from "react";
import { CurrencyValue } from "@usedapp/core";
import { useG$Amounts, G$Amount, useGetEnvChainId, useMPBBridgeBalances } from "@gooddollar/web3sdk-v2";
import { BigNumber } from "ethers";
import { fetchBridgeFees, useMPBBridgeHistory } from "@gooddollar/web3sdk-v2";
import type { IMPBFees, IMPBLimits, MPBBridgeHistoryChainIds, MPBBridgeReadOnlyUrls } from "./types";
import { convertTransaction } from "./utils";

const CHAIN_NAME_TO_ID: Record<string, number> = {
  fuse: 122,
  celo: 42220,
  mainnet: 1,
  xdc: 50
};

export const useBridgeFees = () => {
  const [fees, setFees] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // fetchBridgeFees owns the shared 20-minute cache and in-flight request.
    // Keeping the cache in one layer prevents the view and transaction flow
    // from making duplicate calls with different cache keys.
    fetchBridgeFees()
      .then((feesData: any) => {
        if (feesData) {
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
  const chain = useMemo(() => CHAIN_NAME_TO_ID[sourceChain] || 122, [sourceChain]);
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

export const useChainBalances = (bridgeReadOnlyUrls?: MPBBridgeReadOnlyUrls) => {
  // All four balances are intentionally preloaded. The SDK hook caches and
  // refreshes them slowly, so source-chain switches remain immediate without
  // polling every chain every five blocks.
  const { balancesByChain } = useMPBBridgeBalances(bridgeReadOnlyUrls);

  const getBalanceForChain = useMemo(
    () => (chain: string) => {
      return balancesByChain[chain as keyof typeof balancesByChain] || balancesByChain.fuse;
    },
    [balancesByChain]
  );

  return { getBalanceForChain };
};

export const useDebouncedTransactionHistory = (
  delay = 1000,
  bridgeReadOnlyUrls?: MPBBridgeReadOnlyUrls,
  bridgeHistoryChainIds?: MPBBridgeHistoryChainIds
) => {
  const {
    historySorted: realTransactionHistory,
    initialLoading,
    refreshing,
    errorsByChain,
    refreshHistory
  } = useMPBBridgeHistory({
    readOnlyUrls: bridgeReadOnlyUrls,
    chainIds: bridgeHistoryChainIds
  }) ?? {};
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
    historyLoading: Boolean(initialLoading),
    historyRefreshing: Boolean(refreshing),
    historyErrorsByChain: errorsByChain || {},
    refreshHistory: refreshHistory || (() => undefined)
  };
};

export const useConvertedTransactionHistory = (realTransactionHistory: any[] | undefined, sourceChain: string) => {
  const chain = CHAIN_NAME_TO_ID[sourceChain] || 122;
  return useMemo(
    () => realTransactionHistory?.slice(0, 5).map(tx => convertTransaction(tx, chain)) ?? [],
    [realTransactionHistory, chain]
  );
};
