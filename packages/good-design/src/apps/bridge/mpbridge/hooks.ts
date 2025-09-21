import { useState, useEffect } from "react";
import { CurrencyValue } from "@usedapp/core";
import { useG$Amounts, useG$Balance, G$Amount, useGetEnvChainId } from "@gooddollar/web3sdk-v2";
import { BigNumber } from "ethers";
import { fetchBridgeFees, useBridgeHistory } from "@gooddollar/web3sdk-v2";
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

// Hook to get transaction history - Use microbridge history directly
export const useTransactionHistory = () => {
  console.log("🚀 useTransactionHistory: Starting to fetch transaction history");

  // Use microbridge history directly
  const { historySorted: realTransactionHistory } = useBridgeHistory() ?? {};

  console.log("🔍 Transaction History Debug:", {
    realTransactionHistory: realTransactionHistory?.length || 0,
    historyLoading: !realTransactionHistory,
    firstTx: realTransactionHistory?.[0]
  });

  return { realTransactionHistory, historyLoading: !realTransactionHistory };
};

// Hook to convert transaction history to the format expected by BridgeTransactionList
// Use microbridge data structure directly
export const useConvertedTransactionHistory = (realTransactionHistory: any[] | undefined, sourceChain: string) => {
  const chain = sourceChain === "celo" ? 42220 : sourceChain === "mainnet" ? 1 : 122;

  const converted =
    realTransactionHistory?.slice(0, 5).map(tx => {
      // Use microbridge data directly - it already has the correct chain information
      // Microbridge provides: tx.data.from, tx.data.to, tx.data.targetChainId
      const targetChainId = tx.data?.targetChainId?.toNumber();

      // Determine source and target chains based on the bridge direction
      let sourceChainName, targetChainName;
      if (targetChainId === 122) {
        // Bridging to Fuse, so source is Celo
        sourceChainName = "Celo";
        targetChainName = "Fuse";
      } else if (targetChainId === 42220) {
        // Bridging to Celo, so source is Fuse
        sourceChainName = "Fuse";
        targetChainName = "Celo";
      } else {
        sourceChainName = "Unknown";
        targetChainName = "Unknown";
      }

      // Default to axelar for microbridge (since it's the microbridge)
      const bridgeProvider = "axelar";

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
        // Add fields required by TxDetailsModal
        network: targetChainName?.toUpperCase() || "FUSE",
        displayName: "GoodDollar Bridge",
        contractName: "GoodDollar",
        contractAddress: tx.data?.to || "",
        account: tx.data?.from || "",
        type: status === "completed" ? "bridge-in" : "bridge-pending",
        isPool: false
      };
    }) || [];

  console.log("🔄 Converted Transaction History Debug:", {
    originalCount: realTransactionHistory?.length || 0,
    convertedCount: converted.length,
    firstConverted: converted[0]
  });

  return converted;
};
