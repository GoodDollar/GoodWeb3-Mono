import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useContractFunction, useEthers, useTokenAllowance, useCalls, CurrencyValue, QueryParams } from "@usedapp/core";
import { useSwitchNetwork } from "../../contexts";
import { useRefreshOrNever, useReadOnlyProvider } from "../../hooks";
import { useLogs } from "@usedapp/core";
import { ethers, BigNumber } from "ethers";
import { TransactionStatus } from "@usedapp/core";
import { useGetEnvChainId, useG$Amount } from "../base/react";
import { IGoodDollar } from "@gooddollar/goodprotocol/types";
import { BridgeService, MPBBridgeData, BridgeRequest, UseMPBBridgeReturn, getMPBContractAddress } from "./types";
import { fetchBridgeFees } from "./api";
import {
  BRIDGE_CONSTANTS,
  VALIDATION_REASONS,
  ERROR_MESSAGES,
  BridgeProvider,
  safeBigNumber,
  getChainName,
  getTargetChainId,
  getSourceChainId,
  calculateBridgeFees,
  createEmptyBridgeFees,
  isSupportedChain
} from "./constants";
import { CONTRACT_TO_ABI } from "../base/sdk";
import { SupportedChains } from "../constants";

/**
 * Maps SDK environment names to mpb.json deployment names for each chain
 */
const getDeploymentName = (baseEnv: string, chainId: number): string => {
  // For Fuse chain (122)
  if (chainId === SupportedChains.FUSE) {
    // production, staging, or fuse all use "fuse" deployment
    return "fuse";
  }

  // For Celo chain (42220)
  if (chainId === SupportedChains.CELO) {
    // production and staging use "celo", development uses "alfajores" testnet
    if (baseEnv === "production" || baseEnv === "staging") {
      return "celo";
    }
    return "celo"; // Default to celo mainnet
  }

  // For Ethereum mainnet (1)
  if (chainId === SupportedChains.MAINNET) {
    return "mainnet";
  }

  // Fallback
  console.warn(`Unknown chain ID ${chainId}, defaulting to mainnet deployment`);
  return "mainnet";
};

/**
 * Hook to get MPB Bridge contract for a specific chain
 * Uses centralized ABI but MPB-specific addresses from @gooddollar/bridge-contracts mpb.json
 * Dynamically selects the correct contract address based on the current environment
 */
const useGetMPBContract = (chainId?: number, readOnly = false) => {
  const { library } = useEthers();
  const { baseEnv } = useGetEnvChainId();
  const mpbABI = CONTRACT_TO_ABI["MPBBridge"]?.abi || [];
  const targetChainId = chainId || BRIDGE_CONSTANTS.DEFAULT_CHAIN_ID;
  const readOnlyProvider = useReadOnlyProvider(targetChainId);

  return useMemo(() => {
    const provider = readOnly ? readOnlyProvider : library;
    if (!provider) return null;

    // Get the deployment name for this chain and environment
    const deploymentName = getDeploymentName(baseEnv, targetChainId);

    // Get the contract address from mpb.json
    const contractAddress = getMPBContractAddress(targetChainId, deploymentName);

    if (!contractAddress) {
      console.error(
        `No MPB bridge contract found for chain ${targetChainId} in environment ${baseEnv} (deployment: ${deploymentName})`
      );
      return null;
    }

    console.log(`Using MPB bridge contract for chain ${targetChainId}, env ${baseEnv}: ${contractAddress}`);
    return new ethers.Contract(contractAddress, mpbABI, provider);
  }, [library, mpbABI, targetChainId, baseEnv, readOnly, readOnlyProvider]);
};

/**
 * Hook to get the native token contract that the bridge uses
 * Queries the bridge contract's nativeToken() to ensure we use the correct token
 * Falls back to production G$ address if query fails (always use production token)
 */
const useNativeTokenContract = (chainId?: number, readOnly = false): IGoodDollar | null => {
  const { library } = useEthers();
  const bridgeContract = useGetMPBContract(chainId, readOnly);
  const [nativeTokenAddress, setNativeTokenAddress] = useState<string | null>(null);
  const readOnlyProvider = useReadOnlyProvider(chainId || BRIDGE_CONSTANTS.DEFAULT_CHAIN_ID);

  // Query the bridge contract's nativeToken address
  useEffect(() => {
    let isMounted = true;

    if (!bridgeContract) {
      console.warn(`⚠️ No bridge contract available for chain ${chainId}, using production G$ fallback`);
      // Use production G$ as fallback
      setNativeTokenAddress(BRIDGE_CONSTANTS.PRODUCTION_GDOLLAR_ADDRESS);
      return;
    }

    // Log bridge contract details for debugging
    console.log(`🔍 Bridge contract for chain ${chainId}:`, {
      address: bridgeContract.address,
      hasnativeTokenMethod: typeof bridgeContract.nativeToken === "function",
      availableFunctions: Object.keys(bridgeContract.functions || {})
        .filter(key => !key.includes("("))
        .slice(0, 10)
    });

    // Check if nativeToken method exists
    if (typeof bridgeContract.nativeToken !== "function") {
      console.error(`❌ Bridge contract at ${bridgeContract.address} does not have nativeToken() method`);
      console.error(`Available methods:`, Object.keys(bridgeContract.functions || {}));
      setNativeTokenAddress(BRIDGE_CONSTANTS.PRODUCTION_GDOLLAR_ADDRESS);
      return;
    }

    bridgeContract
      .nativeToken()
      .then((address: string) => {
        if (isMounted) {
          console.log(`✅ Bridge contract nativeToken for chain ${chainId}: ${address}`);
          setNativeTokenAddress(address);
        }
      })
      .catch((error: any) => {
        console.error(
          `❌ Failed to query bridge nativeToken on chain ${chainId}, using production G$ fallback: ${BRIDGE_CONSTANTS.PRODUCTION_GDOLLAR_ADDRESS}`
        );
        console.error(`Bridge contract address: ${bridgeContract.address}`);
        console.error(`Error details:`, {
          message: error.message,
          code: error.code,
          data: error.data,
          reason: error.reason,
          transaction: error.transaction
        });
        if (isMounted) {
          // Always fallback to production G$, never dev G$
          setNativeTokenAddress(BRIDGE_CONSTANTS.PRODUCTION_GDOLLAR_ADDRESS);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [bridgeContract, chainId]);

  // Create token contract instance for the queried or fallback address
  return useMemo(() => {
    if (!nativeTokenAddress) return null;

    const provider = readOnly ? readOnlyProvider : library;
    if (!provider) return null;

    console.log(`💰 Using native token address for chain ${chainId}: ${nativeTokenAddress}`);

    // Use minimal ERC20 ABI that includes the methods we need
    const tokenABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function decimals() view returns (uint8)",
      "function transfer(address to, uint256 amount) returns (bool)",
      "function transferFrom(address from, address to, uint256 amount) returns (bool)"
    ];

    return new ethers.Contract(nativeTokenAddress, tokenABI, provider) as IGoodDollar;
  }, [nativeTokenAddress, library, readOnly, readOnlyProvider, chainId]);
};

const getBridgeRequestTopic = (): string => {
  // Calculate the keccak256 hash of the event signature
  return ethers.utils.id("BridgeRequest(address,address,uint256,uint256,uint256,uint8,uint256)");
};

// Types for better readability
interface ValidationResult {
  isValid: boolean;
  reason: string;
  errorMessage?: string;
  canBridge: boolean;
  hasAllowance: boolean;
}

// Types for better readability
interface BridgeFees {
  nativeFee: ethers.BigNumber | null;
  zroFee: ethers.BigNumber | null;
}

interface BridgeLimitsData {
  minAmount: ethers.BigNumber;
  maxAmount: ethers.BigNumber;
}

export const useGetMPBBridgeData = (
  sourceChain?: string,
  targetChain?: string,
  bridgeProvider: BridgeProvider = "layerzero",
  amount = "0",
  address?: string
): MPBBridgeData & { validation: ValidationResult } => {
  const [bridgeFees, setBridgeFees] = useState<BridgeFees>({ nativeFee: null, zroFee: null });
  const [bridgeLimits, setBridgeLimits] = useState<BridgeLimitsData | null>(null);
  const [protocolFeePercent, setProtocolFeePercent] = useState<number | null>(null);
  const [canUserBridge, setCanUserBridge] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true); // Start as true while fetching
  const [error, setError] = useState<string | null>(null);

  const { account } = useEthers();
  const effectiveAccount = address || account;

  // Get contract for the source chain to fetch limits
  const sourceChainId = getSourceChainId(sourceChain || "celo");
  const bridgeContract = useGetMPBContract(sourceChainId, true);

  // Get the native token contract that the bridge uses (instead of hardcoded dev G$)
  const gdContract = useNativeTokenContract(sourceChainId, true);
  const tokenAddress = gdContract?.address;
  const spenderAddress = bridgeContract?.address;

  // Check allowance
  const allowance = useTokenAllowance(tokenAddress, effectiveAccount, spenderAddress, { chainId: sourceChainId });

  // Helper function to fetch bridge limits from contract
  const fetchContractLimits = useCallback(async (contract: any) => {
    try {
      const limits = await contract.bridgeLimits();
      setBridgeLimits({
        minAmount: limits.minAmount,
        maxAmount: limits.txLimit // Use txLimit as maxAmount
      });
    } catch (error) {
      console.error("Failed to fetch contract limits:", error);
      setBridgeLimits(null);
    }
  }, []);

  // Helper function to validate bridge eligibility
  const validateBridgeEligibility = useCallback(async (contract: any, account: string, amountWei: string) => {
    try {
      const amountBigNumber = safeBigNumber(amountWei);
      if (amountBigNumber.gt(0)) {
        const canBridge = await contract.canBridge(account, amountBigNumber);
        setCanUserBridge(canBridge);
      } else {
        setCanUserBridge(true); // Default to true if amount is 0
      }
    } catch (error) {
      console.error("Failed to validate bridge eligibility:", error);
      setCanUserBridge(false);
    }
  }, []);

  // Helper to fetch protocol fee (bps) from contract and convert to percent
  const fetchProtocolFee = useCallback(async (contract: any) => {
    try {
      const fees = await contract.bridgeFees();
      // fees.fee is in basis points (bps). 15 => 0.15%
      const bps = Number(fees.fee?.toString() || "0");
      setProtocolFeePercent(bps / 10000);
    } catch (error) {
      console.error("Failed to fetch protocol fee:", error);
      setProtocolFeePercent(null);
    }
  }, []);

  // Helper function to calculate fees using the service
  const calculateFees = useCallback((fees: any, source: string, target: string, provider: BridgeProvider) => {
    const calculatedFees = calculateBridgeFees(fees, provider, source, target);

    if (calculatedFees.nativeFee) {
      setBridgeFees(calculatedFees);
    } else {
      const sourceUpper = source.toUpperCase();
      const targetUpper = target.toUpperCase();
      setError(`Bridge fees not available for ${sourceUpper}→${targetUpper} route`);
    }
  }, []);

  // Main effect to load bridge data
  useEffect(() => {
    let isMounted = true;

    setError(null);
    setIsLoading(true);

    const loadBridgeData = async () => {
      const sourceChainName = sourceChain || "celo";
      const targetChainName = targetChain || "fuse";

      try {
        // Fetch third-party fees, contract limits, protocol fee, and eligibility in parallel
        const [fees, limitsResult, protoFeeResult] = await Promise.allSettled([
          fetchBridgeFees(),
          bridgeContract ? fetchContractLimits(bridgeContract) : Promise.resolve(),
          bridgeContract ? fetchProtocolFee(bridgeContract) : Promise.resolve(),
          bridgeContract && effectiveAccount
            ? validateBridgeEligibility(bridgeContract, effectiveAccount, amount)
            : Promise.resolve()
        ]);

        if (!isMounted) return;

        if (fees.status === "fulfilled" && fees.value) {
          calculateFees(fees.value, sourceChainName, targetChainName, bridgeProvider);
        } else {
          setError("We were unable to fetch bridge fees. Try again later or contact support.");
        }

        if (limitsResult.status === "rejected") {
          console.error("Failed to fetch bridge limits:", limitsResult.reason);
        }
        if (protoFeeResult.status === "rejected") {
          console.error("Failed to fetch protocol fee:", protoFeeResult.reason);
        }

        setIsLoading(false);
      } catch (error) {
        if (isMounted) {
          setError("We were unable to fetch bridge data. Try again later or contact support.");
          setIsLoading(false);
        }
      }
    };

    void loadBridgeData();

    return () => {
      isMounted = false;
    };
  }, [
    sourceChain,
    targetChain,
    bridgeProvider,
    calculateFees,
    bridgeContract,
    fetchContractLimits,
    fetchProtocolFee,
    validateBridgeEligibility,
    effectiveAccount,
    amount
  ]);

  // Calculate validation result
  const validation = useMemo<ValidationResult>(() => {
    const amountBN = safeBigNumber(amount);
    const hasAllowance = allowance ? allowance.gte(amountBN) : false;

    if (error) {
      return { isValid: false, reason: VALIDATION_REASONS.ERROR, errorMessage: error, canBridge: false, hasAllowance };
    }

    if (!bridgeLimits) {
      return {
        isValid: false,
        reason: VALIDATION_REASONS.ERROR,
        errorMessage: ERROR_MESSAGES.TRANSACTION_LIMITS_UNAVAILABLE,
        canBridge: false,
        hasAllowance
      };
    }

    if (amountBN.lt(bridgeLimits.minAmount)) {
      return {
        isValid: false,
        reason: VALIDATION_REASONS.MIN_AMOUNT,
        canBridge: canUserBridge,
        hasAllowance
      };
    }

    if (amountBN.gt(bridgeLimits.maxAmount)) {
      return {
        isValid: false,
        reason: VALIDATION_REASONS.MAX_AMOUNT,
        canBridge: canUserBridge,
        hasAllowance
      };
    }

    if (!canUserBridge) {
      return {
        isValid: false,
        reason: VALIDATION_REASONS.CANNOT_BRIDGE,
        canBridge: false,
        hasAllowance
      };
    }

    return { isValid: true, reason: "", canBridge: true, hasAllowance };
  }, [amount, bridgeLimits, canUserBridge, error, allowance]);

  return { bridgeFees, bridgeLimits, protocolFeePercent, isLoading, error, validation };
};

// Helper function to extract bridge request ID from logs
const extractBridgeRequestId = (logs: any[], bridgeContract: any): string | undefined => {
  const bridgeTopic = getBridgeRequestTopic();

  for (const log of logs) {
    if (log.address === bridgeContract?.address && log.topics[0] === bridgeTopic) {
      const bridgeIdTopicIndex = BRIDGE_CONSTANTS.BRIDGE_ID_TOPIC_INDEX;
      if (log.topics[bridgeIdTopicIndex]) {
        return safeBigNumber(log.topics[bridgeIdTopicIndex]).toString();
      }
    }
  }
  return undefined;
};

// Helper function to get chain names from IDs
const getChainNames = (sourceChainId: number, targetChainId: number) => {
  return {
    source: getChainName(sourceChainId),
    target: getChainName(targetChainId)
  };
};

export const useMPBBridge = (bridgeProvider: BridgeProvider = "axelar"): UseMPBBridgeReturn => {
  const bridgeLock = useRef(false);
  const bridgeToTriggered = useRef(false);
  const { switchNetwork } = useSwitchNetwork();
  const { account, chainId, library } = useEthers();

  const [bridgeRequest, setBridgeRequest] = useState<BridgeRequest | undefined>();
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);
  const [switchChainError, setSwitchChainError] = useState<string | undefined>();
  const [tokenDecimals, setTokenDecimals] = useState<number | undefined>();

  // Get the native token contract that the bridge uses (instead of hardcoded dev G$)
  const gdContract = useNativeTokenContract(chainId);

  // Get MPB bridge contract for the current chain
  const bridgeContract = useGetMPBContract(chainId);

  // MPB uses approve + bridgeTo pattern (not transferAndCall like the old TokenBridge)
  const approve = useContractFunction(gdContract, "approve", {
    transactionName: "MPBBridgeApprove"
  });

  const bridgeTo = useContractFunction(bridgeContract, "bridgeTo", {
    transactionName: "MPBBridgeTo"
  });

  // Extract bridge request ID from bridgeTo logs
  const bridgeRequestId = useMemo(() => {
    if (bridgeTo.state?.status !== "Success" || !bridgeTo.state?.receipt?.logs) {
      return undefined;
    }

    return extractBridgeRequestId(bridgeTo.state.receipt.logs, bridgeContract);
  }, [bridgeTo.state?.status, bridgeTo.state?.receipt?.logs, bridgeContract]);

  // Get target chain bridge contract for polling completion
  const targetBridgeContract = useGetMPBContract(bridgeRequest?.targetChainId);

  // Poll target chain for bridge completion
  const bridgeCompletedEvent = useLogs(
    bridgeRequest &&
      bridgeRequestId &&
      targetBridgeContract && {
        contract: targetBridgeContract,
        event: "BridgeCompleted",
        args: [null, null, null, bridgeRequestId]
      },
    {
      refresh: useRefreshOrNever(bridgeRequestId ? 5 : "never"),
      chainId: bridgeRequest?.targetChainId,
      fromBlock: -1000
    }
  );

  useEffect(() => {
    let isMounted = true;

    if (!gdContract) {
      setTokenDecimals(undefined);
      return;
    }

    gdContract
      .decimals()
      .then(dec => {
        if (isMounted) {
          setTokenDecimals(Number(dec));
        }
      })
      .catch(error => {
        console.error("Failed to load token decimals:", error);
        if (isMounted) {
          setTokenDecimals(undefined);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [gdContract]);

  const normalizeAmountTo18 = useCallback((amount: ethers.BigNumber, decimals?: number) => {
    if (!amount) {
      return ethers.BigNumber.from(0);
    }

    const tokenDec = decimals ?? 18;

    if (tokenDec === 18) {
      return amount;
    }

    const diff = Math.abs(tokenDec - 18);
    const scale = ethers.BigNumber.from(10).pow(diff);

    if (tokenDec < 18) {
      return amount.mul(scale);
    }

    return amount.div(scale);
  }, []);

  const layerZeroAdapterParams = useMemo(() => ethers.utils.solidityPack(["uint16", "uint256"], [1, 400000]), []);

  // Bridge status based on local transaction status and bridge completion
  const bridgeStatus: Partial<TransactionStatus> | undefined = (() => {
    // Show chain switching status
    if (isSwitchingChain) {
      return {
        chainId: bridgeRequest?.sourceChainId,
        status: "PendingSignature", // Use PendingSignature to indicate user action needed
        errorMessage: switchChainError
      } as TransactionStatus;
    }

    // Show approve status
    if (approve.state.status === "Mining" || approve.state.status === "PendingSignature") {
      return {
        chainId: bridgeRequest?.sourceChainId,
        status: approve.state.status,
        transaction: approve.state.transaction
      } as TransactionStatus;
    }

    // Show bridgeTo status
    if (bridgeTo.state.status === "Mining" || bridgeTo.state.status === "PendingSignature") {
      return {
        chainId: bridgeRequest?.sourceChainId,
        status: bridgeTo.state.status,
        transaction: bridgeTo.state.transaction
      } as TransactionStatus;
    }

    if (bridgeTo.state.status === "Success" && bridgeCompletedEvent?.value?.length) {
      return {
        chainId: bridgeRequest?.targetChainId,
        status: "Success",
        transaction: { hash: bridgeCompletedEvent.value[0].transactionHash }
      } as TransactionStatus;
    }

    if (approve.state.status === "Exception") {
      return {
        chainId: bridgeRequest?.sourceChainId,
        status: "Fail",
        errorMessage: approve.state.errorMessage
      } as TransactionStatus;
    }

    if (bridgeTo.state.status === "Exception") {
      return {
        chainId: bridgeRequest?.sourceChainId,
        status: "Fail",
        errorMessage: bridgeTo.state.errorMessage
      } as TransactionStatus;
    }

    // If we have a switchChainError, show it
    if (switchChainError) {
      return {
        chainId: bridgeRequest?.sourceChainId,
        status: "Fail",
        errorMessage: switchChainError
      } as TransactionStatus;
    }

    return undefined;
  })();

  const computeLayerZeroFee = useCallback(
    async (request: BridgeRequest, fallbackFee?: ethers.BigNumber | null): Promise<ethers.BigNumber | undefined> => {
      if (!bridgeContract || bridgeProvider !== "layerzero" || !account) {
        return fallbackFee ?? undefined;
      }

      try {
        let lzChainId;
        try {
          lzChainId = await bridgeContract.toLzChainId(request.targetChainId);
          // If toLzChainId returns 0 or falsy, use fallback fee - proxy will handle routing
          if (!lzChainId || lzChainId.toString() === "0") {
            console.warn(
              `LayerZero chain ID not configured for target chain ${request.targetChainId}, using fallback fee`
            );
            return fallbackFee ?? undefined;
          }
        } catch (error) {
          console.warn("Failed to get LayerZero chain ID, using fallback fee:", error);
          return fallbackFee ?? undefined;
        }

        let decimals = tokenDecimals;

        if (decimals === undefined && gdContract) {
          const fetchedDecimals = await gdContract.decimals();
          decimals = Number(fetchedDecimals);
          setTokenDecimals(decimals);
        }

        const normalizedAmount = normalizeAmountTo18(ethers.BigNumber.from(request.amount), decimals);
        const destination = request.target;
        if (!destination) {
          console.warn("Target address is missing for fee estimation");
          return fallbackFee ?? undefined;
        }

        const [nativeFee] = await bridgeContract.estimateSendFee(
          lzChainId,
          account,
          destination,
          normalizedAmount,
          false,
          layerZeroAdapterParams
        );

        if (!fallbackFee) {
          return nativeFee;
        }

        return nativeFee.gt(fallbackFee) ? nativeFee : fallbackFee;
      } catch (error: any) {
        // If fee estimation fails, return fallback fee instead of throwing
        // The proxy contract will handle routing when the transaction is sent
        const errorMessage = error?.message || "";
        if (errorMessage.includes("not configured") || errorMessage.includes("routing")) {
          console.warn("Contract rejected fee estimation, using fallback fee:", errorMessage);
        } else {
          console.warn("LayerZero fee estimation failed, using fallback fee:", error);
        }
        return fallbackFee ?? undefined;
      }
    },
    [account, bridgeContract, bridgeProvider, gdContract, layerZeroAdapterParams, normalizeAmountTo18, tokenDecimals]
  );

  const sendMPBBridgeRequest = useCallback(
    async (amount: string, sourceChain: string, targetChain: string, target?: string) => {
      // Don't reset if transaction is currently being mined
      const isActivelyMining = approve.state.status === "Mining" || bridgeTo.state.status === "Mining";

      if (!isActivelyMining) {
        // Always reset state for a new bridge attempt
        console.log("🔄 Resetting bridge state for new attempt");
        setBridgeRequest(undefined);
        bridgeLock.current = false;
        bridgeToTriggered.current = false;
        approve.resetState();
        bridgeTo.resetState();
        setSwitchChainError(undefined);
        setIsSwitchingChain(false);
      } else {
        console.log("⚠️ Transaction already mining, ignoring new bridge request");
        return;
      }

      const targetChainId = getTargetChainId(targetChain);
      const sourceChainId = getSourceChainId(sourceChain);

      try {
        if (sourceChainId !== chainId) {
          setIsSwitchingChain(true);
          console.log(`🔄 Switching network from ${chainId} to ${sourceChainId}...`);
          await switchNetwork(sourceChainId);
          setIsSwitchingChain(false);
        }

        setBridgeRequest({ amount, sourceChainId, targetChainId, target });
      } catch (error: any) {
        setIsSwitchingChain(false);
        const errorMessage = error?.message || "Failed to switch network";

        // Check if user rejected the chain switch
        const isUserRejection =
          errorMessage.toLowerCase().includes("user rejected") ||
          errorMessage.toLowerCase().includes("user denied") ||
          errorMessage.toLowerCase().includes("user cancelled");

        if (isUserRejection) {
          console.log("👤 User rejected chain switch, resetting state");
          // Reset all state on user rejection
          setBridgeRequest(undefined);
          bridgeLock.current = false;
          setSwitchChainError(undefined);
        } else {
          setSwitchChainError(errorMessage);
        }

        console.error("MPB Bridge error:", error);
        throw error;
      }
    },
    [account, approve, bridgeTo, chainId, switchNetwork]
  );

  // Handle approve and bridgeTo errors and completion
  useEffect(() => {
    const handleTransactionError = (
      status: string,
      errorMessage: string,
      txName: string,
      details?: any,
      stack?: string
    ) => {
      if (status === "Exception") {
        console.error(`${txName} failed:`, errorMessage);

        // Try to extract error data from various possible locations
        // The error structure from useContractFunction has errorHash.data
        console.log("🔍 Attempting to extract error data from:", {
          hasErrorHash: !!details?.errorHash,
          errorHashData: details?.errorHash?.data,
          hasError: !!details?.error,
          errorData: details?.error?.data,
          hasData: !!details?.data
        });

        const errorData =
          details?.errorHash?.data || // Primary location (from useContractFunction)
          details?.error?.data?.data || // Nested error data
          details?.error?.data || // Direct error data
          details?.data?.data || // Nested data
          details?.data || // Direct data
          details?.error?.error?.data || // Deeply nested
          (details?.error?.message?.includes("0x") ? details.error.message.match(/0x[a-fA-F0-9]+/)?.[0] : null); // Extract from message

        console.log("🔍 Extracted error data:", errorData);

        if (errorData) {
          if (typeof errorData === "string" && errorData.startsWith("0x")) {
            console.error(`❌ Contract error code: ${errorData}`);

            // Try to decode the error using the contract interface
            let decodedErrorName: string | null = null;
            try {
              if (bridgeContract?.interface) {
                const decodedError = bridgeContract.interface.parseError(errorData);
                if (decodedError) {
                  decodedErrorName = decodedError.name;
                  console.error(`❌ Decoded error: ${decodedError.name}(${decodedError.args.join(", ")})`);

                  // Handle specific errors
                  if (decodedError.name === "UNSUPPORTED_CHAIN") {
                    const chainId = decodedError.args[0]?.toString();
                    console.error(`❌ Target chain ${chainId} is not supported by the bridge contract`);
                    console.error(`Supported chains: ${Object.values(SupportedChains).join(", ")}`);
                  } else if (decodedError.name === "INVALID_TARGET_OR_CHAINID") {
                    console.error(`❌ Invalid target address or chain ID`);
                    console.error(`Target: ${decodedError.args[0]}, Chain ID: ${decodedError.args[1]}`);
                  } else if (decodedError.name === "LZ_FEE") {
                    console.error(`❌ Insufficient LayerZero fee`);
                    console.error(`Required: ${decodedError.args[0]}, Sent: ${decodedError.args[1]}`);
                  }
                }
              }
            } catch (decodeError) {
              // Error couldn't be decoded, that's okay - we'll show generic message
              console.warn("Could not decode error using contract interface:", decodeError);
            }

            // Common error codes (if decoding failed):
            // 0x10ecdf44 - might be a custom error, need contract ABI to decode
            if (!decodedErrorName && errorData === "0x10ecdf44") {
              console.error("❌ Contract reverted with error 0x10ecdf44. This might indicate:");
              console.error("  - Invalid bridge parameters (chain ID, service, etc.)");
              console.error("  - Contract validation failed (limits, whitelist, etc.)");
              console.error("  - LayerZero routing not configured in contract");
              console.error("  - Insufficient balance or allowance");
              console.error("  - Bridge service (LayerZero/Axelar) not properly configured");
              console.error("  - Target chain not supported or not configured");
            }
          }
        } else {
          console.warn("⚠️ Could not extract error code from error details");
        }

        // Log full details for debugging
        console.error(`📋 ${txName} full error details:`, details);
        if (stack) {
          console.error(`${txName} stack:`, stack);
        }

        // Check if user rejected the transaction
        const isUserRejection =
          errorMessage.toLowerCase().includes("user rejected") ||
          errorMessage.toLowerCase().includes("user denied") ||
          errorMessage.toLowerCase().includes("rejected") ||
          errorMessage.toLowerCase().includes("cancelled");

        if (isUserRejection) {
          console.log("👤 User rejected transaction, fully resetting state");
          // Fully reset state on user rejection
          setBridgeRequest(undefined);
          bridgeLock.current = false;
          approve.resetState();
          bridgeTo.resetState();
        } else {
          // For other errors, just reset the lock
          bridgeLock.current = false;
        }

        bridgeToTriggered.current = false;
      }

      // Reset lock on success to allow new transactions
      if (status === "Success") {
        bridgeLock.current = false;
        bridgeToTriggered.current = false;
      }
    };

    handleTransactionError(
      approve.state.status,
      approve.state.errorMessage || "",
      "Approve",
      (approve.state as any)?.error?.data,
      (approve.state as any)?.error?.stack
    );
    // Log the full error state for debugging
    if (bridgeTo.state.status === "Exception") {
      const bridgeToState = bridgeTo.state as any;
      console.error("🔍 Full bridgeTo error state:", JSON.stringify(bridgeToState, null, 2));
      console.error("🔍 bridgeTo.state.error:", bridgeToState.error);
      console.error("🔍 bridgeTo.state.errorMessage:", bridgeToState.errorMessage);
    }

    handleTransactionError(
      bridgeTo.state.status,
      bridgeTo.state.errorMessage || "",
      "BridgeTo",
      bridgeTo.state as any, // Pass the entire state object to access all error data
      (bridgeTo.state as any)?.error?.stack
    );
  }, [
    approve.state.status,
    approve.state.errorMessage,
    bridgeTo.state.status,
    bridgeTo.state.errorMessage,
    approve,
    bridgeTo,
    bridgeContract
  ]);

  // Reset chain switching state when chain successfully changes
  useEffect(() => {
    if (isSwitchingChain && bridgeRequest && chainId === bridgeRequest.sourceChainId) {
      setIsSwitchingChain(false);
    }
  }, [chainId, bridgeRequest, isSwitchingChain]);

  // Comprehensive pre-flight validation function
  const validateBridgeTransaction = useCallback(
    async (bridgeRequest: BridgeRequest, fees: any) => {
      console.log("🔍 Running pre-flight validation checks...");

      if (!account) {
        throw new Error("Wallet not connected");
      }

      if (!gdContract) {
        throw new Error("Token contract not available");
      }

      if (!bridgeContract) {
        throw new Error("Bridge contract not available");
      }

      const amountBN = ethers.BigNumber.from(bridgeRequest.amount);
      const calculatedFees = calculateBridgeFees(
        fees,
        bridgeProvider,
        getChainName(bridgeRequest.sourceChainId),
        getChainName(bridgeRequest.targetChainId)
      );
      const nativeFee = calculatedFees.nativeFee || ethers.BigNumber.from(0);

      // ✅ Check 1: User has sufficient token balance
      try {
        const balance = await gdContract.balanceOf(account);
        console.log("🔍 Check 1 - Token balance:", {
          balance: balance.toString(),
          required: amountBN.toString(),
          sufficient: balance.gte(amountBN)
        });

        if (balance.lt(amountBN)) {
          const balanceFormatted = ethers.utils.formatUnits(balance, tokenDecimals || 18);
          const amountFormatted = ethers.utils.formatUnits(amountBN, tokenDecimals || 18);
          throw new Error(`Insufficient balance. You have ${balanceFormatted} G$ but need ${amountFormatted} G$`);
        }
      } catch (error: any) {
        if (error.message.includes("Insufficient balance")) {
          throw error;
        }
        console.warn("Could not check token balance:", error.message);
      }

      // ✅ Check 2: Token allowance is sufficient
      try {
        const allowance = await gdContract.allowance(account, bridgeContract.address);
        console.log("🔍 Check 2 - Token allowance:", {
          allowance: allowance.toString(),
          required: amountBN.toString(),
          sufficient: allowance.gte(amountBN)
        });

        if (allowance.lt(amountBN)) {
          const allowanceFormatted = ethers.utils.formatUnits(allowance, tokenDecimals || 18);
          const amountFormatted = ethers.utils.formatUnits(amountBN, tokenDecimals || 18);
          throw new Error(
            `Insufficient allowance. Approved: ${allowanceFormatted} G$, Required: ${amountFormatted} G$. Please approve tokens first.`
          );
        }
      } catch (error: any) {
        if (error.message.includes("Insufficient allowance")) {
          throw error;
        }
        console.warn("Could not check token allowance:", error.message);
      }

      // ✅ Check 3: Destination chain is supported
      if (!isSupportedChain(bridgeRequest.sourceChainId)) {
        throw new Error(
          `Unsupported source chain: ${bridgeRequest.sourceChainId}. Supported chains: ${Object.values(
            SupportedChains
          ).join(", ")}`
        );
      }

      if (!isSupportedChain(bridgeRequest.targetChainId)) {
        throw new Error(
          `Unsupported target chain: ${bridgeRequest.targetChainId}. Supported chains: ${Object.values(
            SupportedChains
          ).join(", ")}`
        );
      }

      // Check with contract if method exists
      try {
        if (typeof bridgeContract.isSupportedChain === "function") {
          const isSupported = await bridgeContract.isSupportedChain(bridgeRequest.targetChainId);
          if (!isSupported) {
            throw new Error(`Chain ${bridgeRequest.targetChainId} is not supported for bridging`);
          }
        }
      } catch (checkError: any) {
        if (checkError.message.includes("not supported")) {
          throw checkError;
        }
        console.warn("Could not check chain support with contract:", checkError.message);
      }

      // ✅ Check 4: Bridge is not paused
      try {
        if (typeof bridgeContract.paused === "function") {
          const isPaused = await bridgeContract.paused();
          if (isPaused) {
            throw new Error("Bridge is currently paused. Please try again later.");
          }
        }
      } catch (checkError: any) {
        if (checkError.message.includes("paused")) {
          throw checkError;
        }
        console.warn("Could not check pause status:", checkError.message);
      }

      // ✅ Check 5: User has enough native token for gas
      try {
        if (library && account) {
          const nativeBalance = await library.getBalance(account);
          // Minimum 0.01 native token (CELO, ETH, etc.)
          const minGasBalance = ethers.utils.parseEther("0.01");
          // Add buffer for the bridge fee
          const requiredBalance = minGasBalance.add(nativeFee);

          console.log("🔍 Check 5 - Native token balance:", {
            balance: nativeBalance.toString(),
            required: requiredBalance.toString(),
            fee: nativeFee.toString(),
            sufficient: nativeBalance.gte(requiredBalance)
          });

          if (nativeBalance.lt(requiredBalance)) {
            const balanceFormatted = ethers.utils.formatEther(nativeBalance);
            const requiredFormatted = ethers.utils.formatEther(requiredBalance);
            const chainName = getChainName(bridgeRequest.sourceChainId);
            throw new Error(
              `Insufficient ${
                chainName === "celo" ? "CELO" : chainName === "fuse" ? "FUSE" : "ETH"
              } for gas. You have ${balanceFormatted} but need at least ${requiredFormatted} (including bridge fee)`
            );
          }
        }
      } catch (error: any) {
        if (error.message.includes("Insufficient")) {
          throw error;
        }
        console.warn("Could not check native token balance:", error.message);
      }

      // ✅ Check 6: Amount meets minimum requirements
      try {
        const limits = await bridgeContract.bridgeLimits();
        const minAmount = limits.minAmount;
        console.log("🔍 Check 6 - Minimum amount:", {
          amount: amountBN.toString(),
          minAmount: minAmount.toString(),
          meetsMinimum: amountBN.gte(minAmount)
        });

        if (amountBN.lt(minAmount)) {
          const minFormatted = ethers.utils.formatUnits(minAmount, tokenDecimals || 18);
          throw new Error(`Amount too small. Minimum: ${minFormatted} G$`);
        }
      } catch (error: any) {
        if (error.message.includes("Amount too small") || error.message.includes("Minimum")) {
          throw error;
        }
        console.warn("Could not check minimum amount:", error.message);
      }

      // ✅ Check 7: User hasn't exceeded bridge limits
      try {
        const limits = await bridgeContract.bridgeLimits();
        const txLimit = limits.txLimit;
        console.log("🔍 Check 7 - Transaction limit:", {
          amount: amountBN.toString(),
          txLimit: txLimit.toString(),
          withinLimit: amountBN.lte(txLimit)
        });

        if (amountBN.gt(txLimit)) {
          const limitFormatted = ethers.utils.formatUnits(txLimit, tokenDecimals || 18);
          throw new Error(`Amount exceeds transaction limit. Maximum: ${limitFormatted} G$`);
        }

        // Check daily limits if available
        if (typeof bridgeContract.canBridge === "function") {
          const canBridge = await bridgeContract.canBridge(account, amountBN);
          if (!canBridge) {
            throw new Error("Bridge limit exceeded. Please check your daily limits or try a smaller amount.");
          }
        }
      } catch (error: any) {
        if (error.message.includes("limit") || error.message.includes("exceeded")) {
          throw error;
        }
        console.warn("Could not check bridge limits:", error.message);
      }

      console.log("✅ All pre-flight checks passed!");
      return true;
    },
    [account, gdContract, bridgeContract, bridgeProvider, tokenDecimals, library]
  );

  // Helper function to execute bridge transaction
  const executeBridgeTransaction = useCallback(
    async (bridgeRequest: BridgeRequest, fees: any) => {
      const { source, target } = getChainNames(bridgeRequest.sourceChainId, bridgeRequest.targetChainId);

      // 🚀 PRE-FLIGHT VALIDATION
      await validateBridgeTransaction(bridgeRequest, fees);

      // No need to check toLzChainId - the proxy contract handles routing internally
      // The proxy at 0xa3247276DbCC76Dd7705273f766eB3E8a5ecF4a5 manages routing configuration

      const calculatedFees = calculateBridgeFees(fees, bridgeProvider, source, target);

      if (!calculatedFees.nativeFee) {
        const sourceUpper = source.toUpperCase();
        const targetUpper = target.toUpperCase();
        throw new Error(`Bridge fee not available for ${sourceUpper}→${targetUpper} route`);
      }

      const bridgeService = bridgeProvider === "layerzero" ? BridgeService.LAYERZERO : BridgeService.AXELAR;

      if (!bridgeContract?.address) {
        console.error("❌ Bridge contract address is missing!", bridgeContract);
        return;
      }

      console.log("🚀 Starting MPB bridge transaction:", {
        bridgeContractAddress: bridgeContract.address,
        amount: bridgeRequest.amount,
        targetChainId: bridgeRequest.targetChainId,
        target: bridgeRequest.target || account,
        bridgeService,
        nativeFee: calculatedFees.nativeFee.toString()
      });

      // Step 1: Approve the bridge contract to spend tokens
      console.log("📝 Step 1: Approving bridge contract to spend G$ tokens...");
      void approve.send(bridgeContract.address, bridgeRequest.amount);
    },
    [bridgeProvider, bridgeContract, account, approve]
  );

  // Trigger the approve when bridge request is ready
  useEffect(() => {
    // Only execute if:
    // 1. No transaction in progress (status is "None")
    // 2. We have a bridge request
    // 3. We have an account
    // 4. The bridge lock is not set
    // 5. We're not currently switching chains
    const shouldExecute =
      approve.state.status === "None" &&
      bridgeTo.state.status === "None" &&
      bridgeRequest &&
      account &&
      !bridgeLock.current &&
      !isSwitchingChain;

    if (shouldExecute) {
      bridgeLock.current = true;
      console.log("🌉 Starting bridge process...", {
        bridgeRequest,
        account,
        chainId
      });

      fetchBridgeFees()
        .then(fees => {
          if (fees) {
            return executeBridgeTransaction(bridgeRequest, fees);
          } else {
            throw new Error("Failed to fetch bridge fees");
          }
        })
        .catch(error => {
          bridgeLock.current = false; // Reset lock on error
          console.error("Bridge execution error:", error);
          // Don't throw - let the state management handle it
        });
    }
  }, [
    approve.state.status,
    bridgeTo.state.status,
    bridgeRequest,
    account,
    executeBridgeTransaction,
    isSwitchingChain,
    chainId
  ]);

  // Trigger bridgeTo after approve succeeds
  useEffect(() => {
    const isApproveSuccess = approve.state.status === "Success";
    const isBridgeIdle = bridgeTo.state.status === "None";

    if (!isApproveSuccess || !isBridgeIdle || !bridgeRequest || !bridgeContract) {
      return;
    }

    if (bridgeToTriggered.current) {
      return;
    }

    let isMounted = true;
    bridgeToTriggered.current = true;

    const proceed = async () => {
      try {
        console.log("✅ Approval successful! Step 2: Calling bridgeTo...");

        const fees = await fetchBridgeFees();
        const { source, target } = getChainNames(bridgeRequest.sourceChainId, bridgeRequest.targetChainId);
        const calculatedFees = fees
          ? calculateBridgeFees(fees, bridgeProvider, source, target)
          : createEmptyBridgeFees();

        let nativeFee = calculatedFees.nativeFee ?? ethers.BigNumber.from(0);

        if (bridgeProvider === "layerzero") {
          nativeFee = (await computeLayerZeroFee(bridgeRequest, nativeFee)) ?? nativeFee;
        }

        if (!nativeFee || nativeFee.isZero()) {
          throw new Error("Bridge fee not available for the selected route.");
        }

        // Add a 5% buffer to reduce the odds of underpaying due to fee estimation drift
        const bufferedFee = nativeFee.mul(105).div(100);
        const bridgeService = bridgeProvider === "layerzero" ? BridgeService.LAYERZERO : BridgeService.AXELAR;

        // Verify allowance before calling bridgeTo
        if (gdContract && bridgeContract && account) {
          try {
            const allowance = await gdContract.allowance(account, bridgeContract.address);
            const amountBN = ethers.BigNumber.from(bridgeRequest.amount);
            console.log("🔍 Checking allowance:", {
              allowance: allowance.toString(),
              required: amountBN.toString(),
              sufficient: allowance.gte(amountBN)
            });

            if (allowance.lt(amountBN)) {
              throw new Error(
                `Insufficient allowance. Approved: ${allowance.toString()}, Required: ${amountBN.toString()}`
              );
            }
          } catch (allowanceError: any) {
            console.error("❌ Allowance check failed:", allowanceError);
            throw allowanceError;
          }
        }

        if (!bridgeRequest.target) {
          throw new Error("Target address is required");
        }

        console.log("🌉 Calling bridgeTo with:", {
          target: bridgeRequest.target,
          targetChainId: bridgeRequest.targetChainId,
          amount: bridgeRequest.amount,
          bridgeService,
          nativeFee: bufferedFee.toString()
        });

        if (!isMounted) {
          return;
        }

        // Try to call bridgeTo - if it fails, the error will be caught and handled
        void bridgeTo.send(bridgeRequest.target, bridgeRequest.targetChainId, bridgeRequest.amount, bridgeService, {
          value: bufferedFee
        });
      } catch (error: any) {
        console.error("BridgeTo preparation error:", error);
        bridgeLock.current = false;
        bridgeToTriggered.current = false;
        setSwitchChainError(error?.message || "Failed to prepare bridge transaction");
        setBridgeRequest(undefined);
      }
    };

    void proceed();

    return () => {
      isMounted = false;
    };
  }, [account, approve.state.status, bridgeContract, bridgeProvider, bridgeRequest, bridgeTo, computeLayerZeroFee]);

  return {
    sendMPBBridgeRequest,
    bridgeRequestStatus: bridgeTo.state, // Return bridgeTo state as the main status
    bridgeStatus,
    bridgeRequest,
    isSwitchingChain
  };
};

/**
 * Hook to query production G$ balance for a specific chain
 * This is specifically for MPBBridge UI to show production G$ balances
 * Since bridge operations use production G$ token, the UI should also display production G$ balance
 *
 * @param refresh - Refresh interval for balance queries
 * @param chainId - Chain ID to query balance on
 * @returns Production G$ balance in CurrencyValue format
 */
export function useProductionG$Balance(refresh: QueryParams["refresh"] = "never", requiredChainId?: number) {
  const refreshOrNever = useRefreshOrNever(refresh);
  const { account } = useEthers();
  const { chainId: envChainId } = useGetEnvChainId(requiredChainId);
  const chainId = requiredChainId || envChainId;

  // Use production G$ token address instead of contract from deployment.json
  const productionG$Address = BRIDGE_CONSTANTS.PRODUCTION_GDOLLAR_ADDRESS;

  // Create a contract instance for production G$
  const readOnlyProvider = useReadOnlyProvider(chainId);
  const productionG$Contract = useMemo(() => {
    if (!readOnlyProvider) return null;

    const tokenABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ];

    return new ethers.Contract(productionG$Address, tokenABI, readOnlyProvider);
  }, [readOnlyProvider, productionG$Address]);

  // Query balance
  const results = useCalls(
    productionG$Contract && account
      ? [
          {
            contract: productionG$Contract,
            method: "balanceOf",
            args: [account]
          }
        ]
      : [],
    {
      refresh: refreshOrNever,
      chainId
    }
  );

  const g$Value = results[0]?.value?.[0] as BigNumber | undefined;

  // Format balance as CurrencyValue matching useG$Balance interface
  const g$Balance = useG$Amount(g$Value, "G$", chainId) as CurrencyValue;

  return { G$: g$Balance };
}
