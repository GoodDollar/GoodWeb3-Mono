import { useState, useEffect } from "react";
import { CurrencyValue } from "@usedapp/core";
import { useG$Amounts, useG$Balance, G$Amount, useGetEnvChainId } from "@gooddollar/web3sdk-v2";
import { BigNumber } from "ethers";
import { fetchBridgeFees, useMPBBridgeHistory } from "@gooddollar/web3sdk-v2";
import type { IMPBFees, IMPBLimits } from "./types";

// Hook to get real bridge fees
export const useBridgeFees = () => {
  const [fees, setFees] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBridgeFees()
      .then((feesData: any) => {
        setFees(feesData);
        setLoading(false);
      })
      .catch((error: any) => {
        console.error("Error fetching bridge fees:", error);
        setLoading(false);
      });
  }, []);

  return { fees, loading };
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
  const chain = sourceChain === "celo" ? 42220 : sourceChain === "mainnet" ? 1 : 122;
  const { defaultEnv } = useGetEnvChainId(chain);

  const { minimumAmount, maximumAmount, bridgeFee, input } = useG$Amounts(
    {
      minimumAmount: limits?.[sourceChain]?.minAmount,
      maximumAmount: limits?.[sourceChain]?.maxAmount,
      bridgeFee: fees?.[sourceChain]?.nativeFee,
      minFee: fees?.[sourceChain]?.nativeFee,
      maxFee: fees?.[sourceChain]?.nativeFee,
      input: BigNumber.from(inputWei)
    },
    "G$",
    chain
  );

  // For MPB, the fee is the native fee from LayerZero/Axelar
  const expectedFee = fees?.[sourceChain]?.nativeFee
    ? G$Amount("G$", fees[sourceChain].nativeFee, chain, defaultEnv)
    : G$Amount("G$", BigNumber.from(0), chain, defaultEnv);

  // The fee is paid in the native token (CELO, ETH, etc.), not in G$
  const expectedToReceive = input;

  return {
    expectedFee,
    expectedToReceive,
    minimumAmount,
    maximumAmount,
    bridgeFee,
    nativeFee: expectedFee,
    zroFee: fees?.[sourceChain]?.zroFee
      ? G$Amount("G$", fees[sourceChain].zroFee, chain, defaultEnv)
      : G$Amount("G$", BigNumber.from(0), chain, defaultEnv)
  };
};

// Hook to get balances for all chains
export const useChainBalances = () => {
  // Query balances every 5 blocks, so balance is updated after bridging
  const { G$: fuseBalance } = useG$Balance(5, 122);
  const { G$: celoBalance } = useG$Balance(5, 42220);
  const { G$: mainnetBalance } = useG$Balance(5, 1);

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

// Hook to get transaction history
export const useTransactionHistory = () => {
  console.log("🚀 useTransactionHistory: Starting to fetch transaction history");

  // Get real transaction history
  const { history: realTransactionHistory, loading: historyLoading } = useMPBBridgeHistory();

  console.log("🔍 Transaction History Debug:", {
    realTransactionHistory: realTransactionHistory?.length || 0,
    historyLoading,
    firstTx: realTransactionHistory?.[0]
  });

  return { realTransactionHistory, historyLoading };
};

// Hook to convert transaction history to the format expected by TransactionList
export const useConvertedTransactionHistory = (realTransactionHistory: any[], sourceChain: string) => {
  const chain = sourceChain === "celo" ? 42220 : sourceChain === "mainnet" ? 1 : 122;
  const { defaultEnv } = useGetEnvChainId(chain);

  const converted =
    realTransactionHistory?.slice(0, 5).map(tx => ({
      address: tx.data?.from || "",
      account: tx.data?.target || "",
      network: tx.sourceChain?.toUpperCase() || sourceChain.toUpperCase(),
      contractAddress: "",
      token: "G$",
      status: tx.status === "Completed" ? "success" : tx.status === "Pending" ? "pending" : "failed",
      type: "bridge-in",
      contractName: "GoodDollar",
      displayName: `Bridged via ${tx.bridgeService}`,
      tokenValue: G$Amount("G$", BigNumber.from(tx.amount || "0"), chain, defaultEnv),
      transactionHash: tx.transactionHash,
      timestamp: tx.timestamp,
      sourceChain: tx.sourceChain,
      targetChain: tx.targetChain
    })) || [];

  console.log("🔄 Converted Transaction History Debug:", {
    originalCount: realTransactionHistory?.length || 0,
    convertedCount: converted.length,
    firstConverted: converted[0]
  });

  return converted;
};
