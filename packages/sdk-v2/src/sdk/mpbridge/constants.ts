import { ethers } from "ethers";
import { SupportedChains } from "../constants";

/**
 * Bridge configuration constants
 */
export const BRIDGE_CONSTANTS = {
  // Amount limits (in wei)
  MIN_AMOUNT: ethers.BigNumber.from("1000000000000000000000"), // 1000 G$
  MAX_AMOUNT: ethers.BigNumber.from("1000000000000000000000000"), // 1M G$

  // Default chain IDs
  DEFAULT_CHAIN_ID: 122, // Fuse

  // Event topic hashes
  BRIDGE_REQUEST_TOPIC: "0x4246d22454f5bd543c70e6ffcca20eed2dcf09d3beef6d39e415385538b02d0a",

  // Timing constants
  DEBOUNCE_DELAY: 300, // ms
  POLLING_INTERVAL: 5000, // ms

  // Bridge request topic index
  BRIDGE_ID_TOPIC_INDEX: 6
} as const;

/**
 * Validation reasons for better error handling
 */
export const VALIDATION_REASONS = {
  MIN_AMOUNT: "minAmount",
  MAX_AMOUNT: "maxAmount",
  CANNOT_BRIDGE: "cannotBridge",
  ERROR: "error",
  INSUFFICIENT_BALANCE: "insufficientBalance",
  INVALID_CHAIN: "invalidChain"
} as const;

/**
 * Error messages for consistent user feedback
 */
export const ERROR_MESSAGES = {
  BRIDGE_LIMITS_ERROR: "Something went wrong while determining transaction limits. Please try again later.",
  BRIDGE_ELIGIBILITY_ERROR: "Unable to verify bridge eligibility. Please try again later.",
  BRIDGE_SERVICE_UNAVAILABLE: "Bridge service is currently unavailable. Please try again later.",
  BRIDGE_FEES_ERROR: "Failed to fetch bridge fees. Please try again later.",
  BRIDGE_FEES_UNAVAILABLE: "Bridge fees not available for this route",
  TRANSACTION_LIMITS_UNAVAILABLE: "Transaction limits unavailable",
  UNEXPECTED_ERROR: "An unexpected error occurred. Please try again later."
} as const;

/**
 * Chain name mappings for better readability
 */
export const CHAIN_NAMES = {
  FUSE: "fuse",
  CELO: "celo",
  MAINNET: "mainnet"
} as const;

/**
 * Bridge provider types
 */
export const BRIDGE_PROVIDERS = {
  LAYERZERO: "layerzero",
  AXELAR: "axelar"
} as const;

// Types for better type safety
export type ChainName = "fuse" | "celo" | "mainnet";
export type BridgeProvider = "axelar" | "layerzero";
export type ValidationReason =
  | "minAmount"
  | "maxAmount"
  | "cannotBridge"
  | "error"
  | "insufficientBalance"
  | "invalidChain";

// Error message mappings (DRY principle)
export const VALIDATION_ERROR_MESSAGES: Record<ValidationReason, string> = {
  minAmount: "Minimum amount is 1000 G$",
  maxAmount: "Amount exceeds maximum limit",
  cannotBridge: "Bridge not available for this amount",
  error: "Invalid amount",
  insufficientBalance: "Insufficient balance",
  invalidChain: "Invalid chain selection"
} as const;

// Chain mapping configuration (DRY principle)
export const CHAIN_MAPPING: Record<number, ChainName> = {
  [SupportedChains.FUSE]: "fuse",
  [SupportedChains.CELO]: "celo",
  [SupportedChains.MAINNET]: "mainnet"
} as const;

export const REVERSE_CHAIN_MAPPING: Record<ChainName, number> = {
  fuse: SupportedChains.FUSE,
  celo: SupportedChains.CELO,
  mainnet: SupportedChains.MAINNET
} as const;

// Fee route mappings for different bridge providers (DRY - single source of truth)
export const FEE_ROUTES: Record<BridgeProvider, Record<string, string>> = {
  [BRIDGE_PROVIDERS.AXELAR]: {
    CELO_MAINNET: "AXL_CELO_TO_ETH",
    MAINNET_CELO: "AXL_ETH_TO_CELO"
  },
  [BRIDGE_PROVIDERS.LAYERZERO]: {
    CELO_FUSE: "LZ_CELO_TO_FUSE",
    FUSE_CELO: "LZ_FUSE_TO_CELO",
    CELO_MAINNET: "LZ_CELO_TO_ETH",
    MAINNET_CELO: "LZ_ETH_TO_CELO",
    FUSE_MAINNET: "LZ_FUSE_TO_ETH",
    MAINNET_FUSE: "LZ_ETH_TO_FUSE"
  }
} as const;

// Utility functions (DRY principle)
export const safeBigNumber = (value: string | number | undefined, fallback = "0"): ethers.BigNumber => {
  return ethers.BigNumber.from(value || fallback);
};

export const resetStates = (setLoading: (loading: boolean) => void, setError: (error: string | null) => void) => {
  setLoading(true);
  setError(null);
};

export const createEmptyBridgeFees = () => ({
  nativeFee: null as ethers.BigNumber | null,
  zroFee: null as ethers.BigNumber | null
});

export const handleError = (
  error: any,
  operation: string,
  setError: (error: string) => void,
  setState?: (value: any) => void,
  fallbackValue?: any
) => {
  console.error(`Error during ${operation}:`, error);
  setError(error?.message || `Error during ${operation}`);
  if (setState && fallbackValue !== undefined) {
    setState(fallbackValue);
  }
};

// Chain utility functions
export const getChainName = (chainId: number): ChainName => {
  return CHAIN_MAPPING[chainId] || "mainnet";
};

export const getChainId = (chainName: string): number => {
  const normalizedName = chainName.toLowerCase() as ChainName;
  return REVERSE_CHAIN_MAPPING[normalizedName] || SupportedChains.MAINNET;
};

export const getTargetChainId = (chainName: string): number => {
  return getChainId(chainName);
};

export const getSourceChainId = (chainName: string): number => {
  return getChainId(chainName);
};

export const isSupportedChain = (chainId: number): boolean => {
  return Object.values(SupportedChains).includes(chainId);
};

// Fee calculation functions
export const getFeeString = (
  fees: any,
  provider: BridgeProvider,
  sourceChain: string,
  targetChain: string
): string | null => {
  const route = `${sourceChain.toUpperCase()}_${targetChain.toUpperCase()}`;
  const feeKey = FEE_ROUTES[provider]?.[route];
  return feeKey ? fees[provider]?.[feeKey] : null;
};

export const parseFeeToWei = (feeString: string): ethers.BigNumber => {
  const feeValue = parseFloat(feeString.split(" ")[0]);
  return ethers.BigNumber.from(ethers.utils.parseEther(feeValue.toString()));
};

export const calculateBridgeFees = (
  fees: any,
  provider: BridgeProvider,
  sourceChain: string,
  targetChain: string
): { nativeFee: ethers.BigNumber | null; zroFee: ethers.BigNumber | null } => {
  const feeString = getFeeString(fees, provider, sourceChain, targetChain);

  if (!feeString || typeof feeString !== "string") {
    return {
      nativeFee: null,
      zroFee: null
    };
  }

  try {
    const nativeFee = parseFeeToWei(feeString);
    return {
      nativeFee,
      zroFee: ethers.BigNumber.from(0)
    };
  } catch (error) {
    console.error("Error parsing fee:", error);
    return {
      nativeFee: null,
      zroFee: null
    };
  }
};
