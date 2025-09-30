// Types for better type safety
type ChainName = "celo" | "fuse" | "mainnet";
type BridgeProvider = "axelar" | "layerzero";

interface ChainConfig {
  icon: string;
  color: string;
  label: string;
}

// Chain configuration mapping (DRY principle)
const CHAIN_CONFIG: Record<ChainName, ChainConfig> = {
  celo: {
    icon: "C",
    color: "green.500",
    label: "G$ Celo"
  },
  fuse: {
    icon: "F",
    color: "blue.500",
    label: "G$ Fuse"
  },
  mainnet: {
    icon: "E",
    color: "red.500",
    label: "G$ Ethereum"
  }
} as const;

// Chain utility functions using the mapping
export const getChainIcon = (chain: string): string => {
  return CHAIN_CONFIG[chain as ChainName]?.icon || "?";
};

export const getChainColor = (chain: string): string => {
  return CHAIN_CONFIG[chain as ChainName]?.color || "gray.500";
};

export const getChainLabel = (chain: string): string => {
  return CHAIN_CONFIG[chain as ChainName]?.label || "G$ Unknown";
};

// Default target chains for each source chain
const DEFAULT_TARGET_CHAINS: Record<ChainName, ChainName[]> = {
  fuse: ["celo", "mainnet"] as ChainName[],
  celo: ["fuse", "mainnet"] as ChainName[],
  mainnet: ["fuse", "celo"] as ChainName[]
};

// Fee mapping configuration (single source of truth)
const FEE_MAPPINGS: Record<BridgeProvider, Record<string, string>> = {
  axelar: {
    CELO_MAINNET: "AXL_CELO_TO_ETH",
    MAINNET_CELO: "AXL_ETH_TO_CELO"
  },
  layerzero: {
    CELO_FUSE: "LZ_CELO_TO_FUSE",
    FUSE_CELO: "LZ_FUSE_TO_CELO",
    CELO_MAINNET: "LZ_CELO_TO_ETH",
    MAINNET_CELO: "LZ_ETH_TO_CELO",
    FUSE_MAINNET: "LZ_FUSE_TO_ETH",
    MAINNET_FUSE: "LZ_ETH_TO_FUSE"
  }
} as const;

// Helper function to check if a route has available fees
const hasRouteFees = (source: string, target: string, bridgeProvider: string, bridgeFees: any): boolean => {
  const sourceUpper = source.toUpperCase();
  const targetUpper = target.toUpperCase();
  const routeKey = `${sourceUpper}_${targetUpper}`;

  const routeMappings = FEE_MAPPINGS[bridgeProvider as BridgeProvider];
  if (!routeMappings) return false;

  const feeProperty = routeMappings[routeKey];
  if (!feeProperty) return false;

  const providerFees = bridgeFees[bridgeProvider.toUpperCase()];
  return !!(providerFees && providerFees[feeProperty]);
};

export const getValidTargetChains = (
  source: string,
  bridgeFees: any,
  bridgeProvider: string,
  feesLoading: boolean
): ChainName[] => {
  // Return default targets if no fees or still loading
  if (!bridgeFees || feesLoading) {
    return DEFAULT_TARGET_CHAINS[source as ChainName] || ["celo", "mainnet"];
  }

  const possibleTargets = DEFAULT_TARGET_CHAINS[source as ChainName] || [];

  // Filter targets that have available fees
  return possibleTargets.filter(target => hasRouteFees(source, target, bridgeProvider, bridgeFees));
};

// Get current bridge fee for display
export const getCurrentBridgeFee = (
  sourceChain: string,
  targetChain: string,
  bridgeProvider: string,
  bridgeFees: any,
  feesLoading: boolean
): string => {
  if (!bridgeFees || feesLoading) return "Loading...";

  if (!hasRouteFees(sourceChain, targetChain, bridgeProvider, bridgeFees)) {
    return "Fee not available";
  }

  const sourceUpper = sourceChain.toUpperCase();
  const targetUpper = targetChain.toUpperCase();
  const routeKey = `${sourceUpper}_${targetUpper}`;

  const providerMappings = FEE_MAPPINGS[bridgeProvider as BridgeProvider];
  const feeProperty = providerMappings[routeKey];
  const providerFees = bridgeFees[bridgeProvider.toUpperCase()];

  return providerFees[feeProperty] || "Fee not available";
};
