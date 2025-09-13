import { BigNumber } from "ethers";
import { G$Amount, useGetEnvChainId } from "@gooddollar/web3sdk-v2";

// Chain utility functions
export const getChainIcon = (chain: string) => {
  switch (chain) {
    case "celo":
      return "C";
    case "fuse":
      return "F";
    case "mainnet":
      return "E";
    default:
      return "?";
  }
};

export const getChainColor = (chain: string) => {
  switch (chain) {
    case "celo":
      return "green.500";
    case "fuse":
      return "blue.500";
    case "mainnet":
      return "red.500";
    default:
      return "gray.500";
  }
};

export const getChainLabel = (chain: string) => {
  switch (chain) {
    case "celo":
      return "G$ Celo";
    case "fuse":
      return "G$ Fuse";
    case "mainnet":
      return "G$ Ethereum";
    default:
      return "G$ Unknown";
  }
};

// Get valid target chains based on bridge provider and available fees
export const getValidTargetChains = (source: string, bridgeFees: any, bridgeProvider: string, feesLoading: boolean) => {
  if (!bridgeFees || feesLoading) {
    // Fallback to default valid chains if fees are not loaded yet
    switch (source) {
      case "fuse":
        return ["celo", "mainnet"];
      case "celo":
        return ["fuse", "mainnet"];
      case "mainnet":
        return ["fuse", "celo"];
      default:
        return ["celo", "mainnet"];
    }
  }

  const validTargets: string[] = [];
  const sourceUpper = source.toUpperCase();

  // Check Axelar fees - only Celo ↔ Mainnet
  if (bridgeProvider === "axelar" && bridgeFees.AXELAR) {
    const axelarFees = bridgeFees.AXELAR;
    if (sourceUpper === "CELO" && axelarFees.AXL_CELO_TO_ETH) {
      validTargets.push("mainnet");
    }
    if (sourceUpper === "MAINNET" && axelarFees.AXL_ETH_TO_CELO) {
      validTargets.push("celo");
    }
    // Axelar only supports Celo ↔ Mainnet, so return only these options
    return validTargets;
  }

  // Check LayerZero fees - all combinations
  if (bridgeProvider === "layerzero" && bridgeFees.LAYERZERO) {
    const layerzeroFees = bridgeFees.LAYERZERO;
    if (sourceUpper === "MAINNET") {
      if (layerzeroFees.LZ_ETH_TO_CELO) validTargets.push("celo");
      if (layerzeroFees.LZ_ETH_TO_FUSE) validTargets.push("fuse");
    }
    if (sourceUpper === "CELO") {
      if (layerzeroFees.LZ_CELO_TO_ETH) validTargets.push("mainnet");
      if (layerzeroFees.LZ_CELO_TO_FUSE) validTargets.push("fuse");
    }
    if (sourceUpper === "FUSE") {
      if (layerzeroFees.LZ_FUSE_TO_ETH) validTargets.push("mainnet");
      if (layerzeroFees.LZ_FUSE_TO_CELO) validTargets.push("celo");
    }
    return validTargets;
  }

  // If no valid targets found for current provider, return empty array
  return validTargets;
};

// Get current bridge fee for display
export const getCurrentBridgeFee = (
  sourceChain: string,
  targetChain: string,
  bridgeProvider: string,
  bridgeFees: any,
  feesLoading: boolean
) => {
  if (!bridgeFees || feesLoading) return "Loading...";

  const sourceUpper = sourceChain.toUpperCase();
  const targetUpper = targetChain.toUpperCase();

  if (bridgeProvider === "axelar") {
    const axelarFees = bridgeFees.AXELAR;
    if (sourceUpper === "CELO" && targetUpper === "MAINNET" && axelarFees.AXL_CELO_TO_ETH) {
      return axelarFees.AXL_CELO_TO_ETH;
    }
    if (sourceUpper === "MAINNET" && targetUpper === "CELO" && axelarFees.AXL_ETH_TO_CELO) {
      return axelarFees.AXL_ETH_TO_CELO;
    }
  } else if (bridgeProvider === "layerzero") {
    const layerzeroFees = bridgeFees.LAYERZERO;
    // Check specific routes first to avoid wrong matches
    if (sourceUpper === "CELO" && targetUpper === "FUSE" && layerzeroFees.LZ_CELO_TO_FUSE) {
      return layerzeroFees.LZ_CELO_TO_FUSE;
    }
    if (sourceUpper === "FUSE" && targetUpper === "CELO" && layerzeroFees.LZ_FUSE_TO_CELO) {
      return layerzeroFees.LZ_FUSE_TO_CELO;
    }
    if (sourceUpper === "CELO" && targetUpper === "MAINNET" && layerzeroFees.LZ_CELO_TO_ETH) {
      return layerzeroFees.LZ_CELO_TO_ETH;
    }
    if (sourceUpper === "MAINNET" && targetUpper === "CELO" && layerzeroFees.LZ_ETH_TO_CELO) {
      return layerzeroFees.LZ_ETH_TO_CELO;
    }
    if (sourceUpper === "FUSE" && targetUpper === "MAINNET" && layerzeroFees.LZ_FUSE_TO_ETH) {
      return layerzeroFees.LZ_FUSE_TO_ETH;
    }
    if (sourceUpper === "MAINNET" && targetUpper === "FUSE" && layerzeroFees.LZ_ETH_TO_FUSE) {
      return layerzeroFees.LZ_ETH_TO_FUSE;
    }
  }

  return "Fee not available";
};

// Convert transaction history to format expected by TransactionList
export const convertTransactionHistory = (realTransactionHistory: any[], sourceChain: string) => {
  return (
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
      tokenValue: G$Amount(
        "G$",
        BigNumber.from(tx.amount || "0"),
        sourceChain === "celo" ? 42220 : sourceChain === "mainnet" ? 1 : 122,
        useGetEnvChainId(sourceChain === "celo" ? 42220 : sourceChain === "mainnet" ? 1 : 122).defaultEnv
      ),
      transactionHash: tx.transactionHash,
      timestamp: tx.timestamp,
      sourceChain: tx.sourceChain,
      targetChain: tx.targetChain
    })) || []
  );
};
