import { FEE_ROUTES } from "@gooddollar/web3sdk-v2";

type ChainName = "celo" | "fuse" | "mainnet";
type BridgeProvider = "axelar" | "layerzero";

interface ChainConfig {
  icon: string;
  color: string;
  label: string;
}

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

export const getChainIcon = (chain: string): string => {
  return CHAIN_CONFIG[chain as ChainName]?.icon || "?";
};

export const getChainColor = (chain: string): string => {
  return CHAIN_CONFIG[chain as ChainName]?.color || "gray.500";
};

export const getChainLabel = (chain: string): string => {
  return CHAIN_CONFIG[chain as ChainName]?.label || "G$ Unknown";
};

const DEFAULT_TARGET_CHAINS: Record<ChainName, ChainName[]> = {
  fuse: ["celo", "mainnet"] as ChainName[],
  celo: ["fuse", "mainnet"] as ChainName[],
  mainnet: ["fuse", "celo"] as ChainName[]
};

// Use centralized provider route mapping from sdk-v2 (avoid duplication)
const PROVIDER_ROUTES = FEE_ROUTES as Record<BridgeProvider, Record<string, string>>;

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

  if (!bridgeFees || feesLoading) {
    const providerMappings = PROVIDER_ROUTES[bridgeProvider as BridgeProvider] || {};
    return possibleTargets.filter(target => {
      const routeKey = `${source.toUpperCase()}_${target.toUpperCase()}`;
      return Boolean(providerMappings[routeKey]);
    });
  }

  return possibleTargets.filter(target => hasRouteFees(source, target, bridgeProvider, bridgeFees));
};

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

export const CHAIN_ID_TO_NAME: Record<number, string> = {
  122: "Fuse",
  42220: "Celo",
  1: "Mainnet"
} as const;

export const BRIDGE_SERVICE_MAPPING = {
  0: "axelar",
  1: "layerzero"
} as const;

export const DEFAULT_BRIDGE_PROVIDER = "layerzero";
export const RECENT_TRANSACTION_THRESHOLD = 30 * 24 * 60 * 60;

export const getChainName = (chainId: number): string => {
  return CHAIN_ID_TO_NAME[chainId] || "Unknown";
};

export const capitalizeChain = (chain: string): string => chain.charAt(0).toUpperCase() + chain.slice(1);

export const convertTransaction = (tx: any, currentChainId: number) => {
  const sourceChainId = tx.data?.sourceChainId?.toNumber();
  const targetChainId = tx.data?.targetChainId?.toNumber();
  const sourceChainName = getChainName(sourceChainId);
  const targetChainName = getChainName(targetChainId);

  const bridgeService = tx.data?.bridge;
  let bridgeProvider = DEFAULT_BRIDGE_PROVIDER;
  const txTimestamp = tx.data?.timestamp || tx.timestamp || 0;
  const now = Math.floor(Date.now() / 1000);

  if (bridgeService !== undefined) {
    const serviceKey = bridgeService as keyof typeof BRIDGE_SERVICE_MAPPING;
    bridgeProvider = BRIDGE_SERVICE_MAPPING[serviceKey] || DEFAULT_BRIDGE_PROVIDER;
  } else {
    const isRecent = now - txTimestamp < RECENT_TRANSACTION_THRESHOLD;
    bridgeProvider = isRecent ? "layerzero" : "axelar";
  }

  const txAgeMinutes = (now - txTimestamp) / 60;
  const OPTIMISTIC_COMPLETION_AGE_MINUTES = 10;
  const isLikelyCompleted = txAgeMinutes > OPTIMISTIC_COMPLETION_AGE_MINUTES && !tx.completedEvent;

  const status = tx.completedEvent || isLikelyCompleted ? "completed" : "pending";

  const timestamp = tx.data?.timestamp || tx.timestamp;
  return {
    id: tx.data?.id || tx.transactionHash,
    transactionHash: tx.transactionHash,
    sourceChain: sourceChainName,
    targetChain: targetChainName,
    amount: tx.amount || "0",
    bridgeProvider,
    status,
    ...(timestamp ? { date: new Date(Number(timestamp) * 1000) } : {}),
    chainId: currentChainId,
    network: targetChainName?.toUpperCase() || "FUSE",
    displayName: "GoodDollar Bridge",
    contractName: "GoodDollar",
    contractAddress: tx.data?.to || "",
    account: tx.data?.from || "",
    type: status === "completed" ? "bridge-in" : "bridge-pending",
    isPool: false
  };
};
