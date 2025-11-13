import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useContractFunction, useEthers } from "@usedapp/core";
import { useSwitchNetwork } from "../../contexts";
import { useRefreshOrNever } from "../../hooks";
import { useLogs } from "@usedapp/core";
import { ethers } from "ethers";
import { TransactionStatus } from "@usedapp/core";
import { useGetContract, useGetEnvChainId } from "../base/react";
import { IGoodDollar } from "@gooddollar/goodprotocol/types";
import { BridgeService, MPBBridgeData, BridgeRequest, UseMPBBridgeReturn, getMPBContractAddress } from "./types";
import { fetchBridgeFees } from "./api";
import {
  BRIDGE_CONSTANTS,
  VALIDATION_REASONS,
  ERROR_MESSAGES,
  BridgeProvider,
  safeBigNumber,
  handleError,
  getChainName,
  getTargetChainId,
  getSourceChainId,
  calculateBridgeFees
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
const useGetMPBContract = (chainId?: number) => {
  const { library } = useEthers();
  const { baseEnv } = useGetEnvChainId();
  const mpbABI = CONTRACT_TO_ABI["MPBBridge"]?.abi || [];
  const targetChainId = chainId || BRIDGE_CONSTANTS.DEFAULT_CHAIN_ID;

  return useMemo(() => {
    if (!library) return null;

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
    return new ethers.Contract(contractAddress, mpbABI, library);
  }, [library, mpbABI, targetChainId, baseEnv]);
};

const getBridgeRequestTopic = (): string => {
  // Calculate the keccak256 hash of the event signature
  return ethers.utils.id("BridgeRequest(address,address,uint256,uint256,uint256,uint8,uint256)");
};

// Types for better readability
interface BridgeLimits {
  dailyLimit: ethers.BigNumber;
  txLimit: ethers.BigNumber;
  accountDailyLimit: ethers.BigNumber;
  minAmount: ethers.BigNumber;
  onlyWhitelisted: boolean;
}

interface ValidationResult {
  isValid: boolean;
  reason: string;
  errorMessage?: string;
}

export const useMPBBridgeLimits = (amount: string, chainId?: number): ValidationResult => {
  const { account } = useEthers();
  const targetChainId = chainId || BRIDGE_CONSTANTS.DEFAULT_CHAIN_ID;
  const bridgeContract = useGetMPBContract(targetChainId);

  const [bridgeLimits, setBridgeLimits] = useState<BridgeLimits | null>(null);
  const [canUserBridge, setCanUserBridge] = useState<boolean>(false);
  const [isLoadingLimits, setIsLoadingLimits] = useState<boolean>(false);
  const [bridgeError, setBridgeError] = useState<string | null>(null);

  // Helper function to validate bridge eligibility
  const validateBridgeEligibility = useCallback(async (contract: any, account: string, amountWei: string) => {
    try {
      const amountBigNumber = safeBigNumber(amountWei);
      if (amountBigNumber.gt(0)) {
        const canBridge = await contract.canBridge(account, amountBigNumber);
        setCanUserBridge(canBridge);
      }
    } catch (error) {
      handleError(error, "bridge eligibility", setBridgeError, setCanUserBridge, false);
    }
  }, []);

  // Helper function to fetch bridge limits from contract
  const fetchBridgeLimits = useCallback(async (contract: any) => {
    try {
      const limits = await contract.bridgeLimits();
      setBridgeLimits({
        dailyLimit: limits.dailyLimit,
        txLimit: limits.txLimit,
        accountDailyLimit: limits.accountDailyLimit,
        minAmount: limits.minAmount,
        onlyWhitelisted: limits.onlyWhitelisted
      });
    } catch (error) {
      handleError(error, "bridge limits", setBridgeError, setBridgeLimits, null);
    }
  }, []);

  // Main effect to load bridge data
  useEffect(() => {
    if (!bridgeContract || !account) {
      setIsLoadingLimits(false);
      return;
    }

    setIsLoadingLimits(true);
    setBridgeError(null);

    const loadBridgeData = async () => {
      await Promise.allSettled([
        fetchBridgeLimits(bridgeContract),
        validateBridgeEligibility(bridgeContract, account, amount)
      ]);
      setIsLoadingLimits(false);
    };

    void loadBridgeData();
  }, [bridgeContract, account, amount, fetchBridgeLimits, validateBridgeEligibility]);

  // Convert amount to BigNumber for validation
  const amountBigNumber = safeBigNumber(amount);

  // Helper function to validate amount against limits
  const validateAmount = (amount: ethers.BigNumber, minAmount: ethers.BigNumber, maxAmount: ethers.BigNumber) => {
    if (amount.lt(minAmount)) {
      return { isValid: false, reason: VALIDATION_REASONS.MIN_AMOUNT };
    }
    if (amount.gt(maxAmount)) {
      return { isValid: false, reason: VALIDATION_REASONS.MAX_AMOUNT };
    }
    return { isValid: true, reason: "" };
  };

  // Early return for errors
  if (bridgeError) {
    return {
      isValid: false,
      reason: VALIDATION_REASONS.ERROR,
      errorMessage: bridgeError
    };
  }

  // Return valid while loading (optimistic validation)
  if (isLoadingLimits) {
    return { isValid: true, reason: "", errorMessage: undefined };
  }

  // Return error if limits couldn't be loaded
  if (!bridgeLimits) {
    return {
      isValid: false,
      reason: VALIDATION_REASONS.ERROR,
      errorMessage: ERROR_MESSAGES.TRANSACTION_LIMITS_UNAVAILABLE
    };
  }

  // Validate against contract limits (now using actual contract values)
  const contractValidation = validateAmount(amountBigNumber, bridgeLimits.minAmount, bridgeLimits.txLimit);
  if (!contractValidation.isValid) {
    return contractValidation;
  }

  // Check bridge eligibility
  if (!canUserBridge) {
    return {
      isValid: false,
      reason: VALIDATION_REASONS.CANNOT_BRIDGE,
      errorMessage: undefined
    };
  }

  return { isValid: true, reason: "", errorMessage: undefined };
};

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
  bridgeProvider: BridgeProvider = "layerzero"
): MPBBridgeData => {
  const [bridgeFees, setBridgeFees] = useState<BridgeFees>({ nativeFee: null, zroFee: null });
  const [bridgeLimits, setBridgeLimits] = useState<BridgeLimitsData | null>(null);
  const [protocolFeePercent, setProtocolFeePercent] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true while fetching
  const [error, setError] = useState<string | null>(null);

  // Get contract for the source chain to fetch limits
  const sourceChainId = getSourceChainId(sourceChain || "celo");
  const bridgeContract = useGetMPBContract(sourceChainId);

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
        // Fetch third-party fees, contract limits, and protocol fee in parallel
        const [fees, limitsResult, protoFeeResult] = await Promise.allSettled([
          fetchBridgeFees(),
          bridgeContract ? fetchContractLimits(bridgeContract) : Promise.resolve(),
          bridgeContract ? fetchProtocolFee(bridgeContract) : Promise.resolve()
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
  }, [sourceChain, targetChain, bridgeProvider, calculateFees, bridgeContract, fetchContractLimits]);

  return { bridgeFees, bridgeLimits, protocolFeePercent, isLoading, error };
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
  const { switchNetwork } = useSwitchNetwork();
  const { account, chainId } = useEthers();

  const [bridgeRequest, setBridgeRequest] = useState<BridgeRequest | undefined>();
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);
  const [switchChainError, setSwitchChainError] = useState<string | undefined>();

  // Get G$ token contract for the current chain
  const gdContract = useGetContract("GoodDollar", true, "base", chainId) as IGoodDollar;

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

  const sendMPBBridgeRequest = useCallback(
    async (amount: string, sourceChain: string, targetChain: string, target = account) => {
      // Don't reset if transaction is currently being mined
      const isActivelyMining = approve.state.status === "Mining" || bridgeTo.state.status === "Mining";

      if (!isActivelyMining) {
        // Always reset state for a new bridge attempt
        console.log("🔄 Resetting bridge state for new attempt");
        setBridgeRequest(undefined);
        bridgeLock.current = false;
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
    const handleTransactionError = (status: string, errorMessage: string, txName: string) => {
      if (status === "Exception") {
        console.error(`${txName} failed:`, errorMessage);

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
      }

      // Reset lock on success to allow new transactions
      if (status === "Success") {
        bridgeLock.current = false;
      }
    };

    handleTransactionError(approve.state.status, approve.state.errorMessage || "", "Approve");
    handleTransactionError(bridgeTo.state.status, bridgeTo.state.errorMessage || "", "BridgeTo");
  }, [
    approve.state.status,
    approve.state.errorMessage,
    bridgeTo.state.status,
    bridgeTo.state.errorMessage,
    approve,
    bridgeTo
  ]);

  // Reset chain switching state when chain successfully changes
  useEffect(() => {
    if (isSwitchingChain && bridgeRequest && chainId === bridgeRequest.sourceChainId) {
      setIsSwitchingChain(false);
    }
  }, [chainId, bridgeRequest, isSwitchingChain]);

  // Helper function to execute bridge transaction
  const executeBridgeTransaction = useCallback(
    async (bridgeRequest: BridgeRequest, fees: any) => {
      const { source, target } = getChainNames(bridgeRequest.sourceChainId, bridgeRequest.targetChainId);

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
    if (approve.state.status === "Success" && bridgeRequest && bridgeContract) {
      console.log("✅ Approval successful! Step 2: Calling bridgeTo...");

      fetchBridgeFees()
        .then(fees => {
          if (!fees) {
            throw new Error("Failed to fetch bridge fees");
          }

          const { source, target } = getChainNames(bridgeRequest.sourceChainId, bridgeRequest.targetChainId);
          const calculatedFees = calculateBridgeFees(fees, bridgeProvider, source, target);

          if (!calculatedFees.nativeFee) {
            throw new Error(`Bridge fee not available for ${source}→${target} route`);
          }

          const bridgeService = bridgeProvider === "layerzero" ? BridgeService.LAYERZERO : BridgeService.AXELAR;

          console.log("🌉 Calling bridgeTo with native fee:", calculatedFees.nativeFee.toString());
          void bridgeTo.send(
            bridgeRequest.target || account,
            bridgeRequest.targetChainId,
            bridgeRequest.amount,
            bridgeService,
            { value: calculatedFees.nativeFee } // Pass native fee as msg.value
          );
        })
        .catch(error => {
          console.error("BridgeTo preparation error:", error);
        });
    }
  }, [approve.state.status, bridgeRequest, bridgeContract, bridgeTo, account, bridgeProvider]);

  return {
    sendMPBBridgeRequest,
    bridgeRequestStatus: bridgeTo.state, // Return bridgeTo state as the main status
    bridgeStatus,
    bridgeRequest,
    isSwitchingChain
  };
};
