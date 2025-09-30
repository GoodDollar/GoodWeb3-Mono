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

// Default target chains for each source chain
const DEFAULT_TARGET_CHAINS = {
  fuse: ["celo", "mainnet"],
  celo: ["fuse", "mainnet"],
  mainnet: ["fuse", "celo"]
} as const;

// Route to fee property mapping for valid target chain detection
const ROUTE_TO_FEE_PROPERTY = {
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

export const getValidTargetChains = (
  source: string,
  bridgeFees: any,
  bridgeProvider: string,
  feesLoading: boolean
): string[] => {
  if (!bridgeFees || feesLoading) {
    return [...(DEFAULT_TARGET_CHAINS[source as keyof typeof DEFAULT_TARGET_CHAINS] || ["celo", "mainnet"])];
  }

  const sourceUpper = source.toUpperCase();
  const validTargets: string[] = [];

  // Get the route mappings for this provider
  const routeMappings = ROUTE_TO_FEE_PROPERTY[bridgeProvider as keyof typeof ROUTE_TO_FEE_PROPERTY];
  if (!routeMappings) {
    return validTargets;
  }

  // Get the fees object for this provider
  const providerFees = bridgeFees[bridgeProvider.toUpperCase()];
  if (!providerFees) {
    return validTargets;
  }

  // Check each possible target chain
  const possibleTargets = DEFAULT_TARGET_CHAINS[source as keyof typeof DEFAULT_TARGET_CHAINS] || [];

  for (const target of possibleTargets) {
    const targetUpper = target.toUpperCase();
    const routeKey = `${sourceUpper}_${targetUpper}` as keyof typeof routeMappings;
    const feeProperty = routeMappings[routeKey];

    if (feeProperty && providerFees[feeProperty]) {
      validTargets.push(target);
    }
  }

  return validTargets;
};

// Fee mapping configuration for different bridge providers
const FEE_MAPPINGS = {
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
  const routeKey = `${sourceUpper}_${targetUpper}` as keyof typeof FEE_MAPPINGS.axelar;

  // Get the fee mapping for the current bridge provider
  const providerMappings = FEE_MAPPINGS[bridgeProvider as keyof typeof FEE_MAPPINGS];
  if (!providerMappings) {
    return "Fee not available";
  }

  // Get the fee property name for this route
  const feeProperty = providerMappings[routeKey];
  if (!feeProperty) {
    return "Fee not available";
  }

  // Get the fees object for this provider
  const providerFees = bridgeFees[bridgeProvider.toUpperCase()];
  if (!providerFees) {
    return "Fee not available";
  }

  // Return the fee value or fallback
  return providerFees[feeProperty] || "Fee not available";
};
