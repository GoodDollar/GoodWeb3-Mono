import { FEE_ROUTES } from "@gooddollar/web3sdk-v2";

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

// Use centralized provider route mapping from sdk-v2 (avoid duplication)
const PROVIDER_ROUTES = FEE_ROUTES as Record<BridgeProvider, Record<string, string>>;

// Utility: list all provider-supported source/target pairs (static capability, independent of fee API)
export const getProviderSupportedPairs = (provider: BridgeProvider): [ChainName, ChainName][] => {
  const mappings = PROVIDER_ROUTES[provider] || {};
  return Object.keys(mappings).reduce<[ChainName, ChainName][]>((pairs, key) => {
    const [src, dst] = key.split("_");
    const source = src.toLowerCase() as ChainName;
    const target = dst.toLowerCase() as ChainName;
    if (
      (["celo", "fuse", "mainnet"] as string[]).includes(source) &&
      (["celo", "fuse", "mainnet"] as string[]).includes(target)
    ) {
      pairs.push([source as ChainName, target as ChainName]);
    }
    return pairs;
  }, []);
};

// Utility: check if the static mapping supports a given route for a provider
export const isRouteSupportedByProvider = (source: string, target: string, provider: BridgeProvider): boolean => {
  const routeKey = `${source.toUpperCase()}_${target.toUpperCase()}`;
  return Boolean(PROVIDER_ROUTES[provider]?.[routeKey]);
};

const hasRouteFees = (source: string, target: string, bridgeProvider: string, bridgeFees: any): boolean => {
  const sourceUpper = source.toUpperCase();
  const targetUpper = target.toUpperCase();
  const routeKey = `${sourceUpper}_${targetUpper}`;

  const routeMappings = PROVIDER_ROUTES[bridgeProvider as BridgeProvider];
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
  const possibleTargets = DEFAULT_TARGET_CHAINS[source as ChainName] || [];

  // While fees are loading or absent, fall back to static provider support (based on configured routes)
  if (!bridgeFees || feesLoading) {
    const providerMappings = PROVIDER_ROUTES[bridgeProvider as BridgeProvider] || {};
    return possibleTargets.filter(target => {
      const routeKey = `${source.toUpperCase()}_${target.toUpperCase()}`;
      return Boolean(providerMappings[routeKey]);
    });
  }

  // With fees available, ensure the route also has current fee data
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

  const providerMappings = PROVIDER_ROUTES[bridgeProvider as BridgeProvider];
  const feeProperty = providerMappings[routeKey];
  const providerFees = bridgeFees[bridgeProvider.toUpperCase()];

  return providerFees[feeProperty] || "Fee not available";
};
