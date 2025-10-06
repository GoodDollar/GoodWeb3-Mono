import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useContractFunction, useEthers } from "@usedapp/core";
import { useSwitchNetwork } from "../../contexts";
import { useRefreshOrNever } from "../../hooks";
import { useLogs } from "@usedapp/core";
import { ethers } from "ethers";
import { SupportedChains } from "../constants";
import { TransactionStatus } from "@usedapp/core";
import { useGetContract } from "../base/react";
import { IGoodDollar } from "@gooddollar/goodprotocol/types";
import { MPBBridgeABI, MPB_CONTRACTS, BridgeService, MPBBridgeData, BridgeRequest } from "./types";
import { fetchBridgeFees } from "./api";
import {
  BRIDGE_CONSTANTS,
  VALIDATION_REASONS,
  ERROR_MESSAGES,
  BridgeProvider,
  safeBigNumber,
  resetStates,
  createEmptyBridgeFees,
  handleError,
  getChainName,
  getTargetChainId,
  getSourceChainId,
  calculateBridgeFees
} from "./constants";

export const useGetMPBContracts = () => {
  const { library } = useEthers();

  return {
    [SupportedChains.FUSE]: library
      ? (new ethers.Contract(MPB_CONTRACTS[SupportedChains.FUSE], MPBBridgeABI, library) as ethers.Contract)
      : null,
    [SupportedChains.CELO]: library
      ? (new ethers.Contract(MPB_CONTRACTS[SupportedChains.CELO], MPBBridgeABI, library) as ethers.Contract)
      : null,
    [SupportedChains.MAINNET]: library
      ? (new ethers.Contract(MPB_CONTRACTS[SupportedChains.MAINNET], MPBBridgeABI, library) as ethers.Contract)
      : null
  };
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
  const mpbContracts = useGetMPBContracts();
  const targetChainId = chainId || BRIDGE_CONSTANTS.DEFAULT_CHAIN_ID;
  const bridgeContract = mpbContracts[targetChainId];

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

  // Helper function to fetch bridge limits
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

  // Basic amount validation with hardcoded limits
  const basicValidation = validateAmount(amountBigNumber, BRIDGE_CONSTANTS.MIN_AMOUNT, BRIDGE_CONSTANTS.MAX_AMOUNT);
  if (!basicValidation.isValid) {
    return basicValidation;
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

  // Validate against contract limits
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
  const [bridgeFees, setBridgeFees] = useState<BridgeFees>(createEmptyBridgeFees());
  const [bridgeLimits, setBridgeLimits] = useState<BridgeLimitsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to set fallback limits
  const setFallbackLimits = useCallback(() => {
    setBridgeLimits({
      minAmount: BRIDGE_CONSTANTS.MIN_AMOUNT,
      maxAmount: BRIDGE_CONSTANTS.MAX_AMOUNT
    });
  }, []);

  // Helper function to calculate fees using the service
  const calculateFees = useCallback((fees: any, source: string, target: string, provider: BridgeProvider) => {
    console.log("calculateFees called with:", { fees, source, target, provider });
    const calculatedFees = calculateBridgeFees(fees, provider, source, target);
    console.log("calculatedFees:", calculatedFees);

    if (calculatedFees.nativeFee) {
      console.log("Setting bridge fees:", calculatedFees);
      setBridgeFees(calculatedFees);
    } else {
      const sourceUpper = source.toUpperCase();
      const targetUpper = target.toUpperCase();
      console.log("No native fee found, setting error");
      setError(`Bridge fees not available for ${sourceUpper}→${targetUpper} route`);
      setBridgeFees(createEmptyBridgeFees());
    }
  }, []);

  // Main effect to load bridge data
  useEffect(() => {
    console.log("useGetMPBBridgeData effect running with:", { sourceChain, targetChain, bridgeProvider });
    let isMounted = true;

    resetStates(setIsLoading, setError);
    setFallbackLimits();

    const loadBridgeData = async () => {
      const sourceChainName = sourceChain || "celo";
      const targetChainName = targetChain || "fuse";

      // Fallback fees to use if API fails
      const fallbackFees = {
        LAYERZERO: {
          LZ_ETH_TO_CELO: "0.000313656721807939 ETH",
          LZ_ETH_TO_FUSE: "0.000192497159840898 ETH",
          LZ_CELO_TO_ETH: "37.03567383217732 Celo",
          LZ_CELO_TO_FUSE: "0.09256173546554455 CELO",
          LZ_FUSE_TO_ETH: "579.0125764968107 Fuse",
          LZ_FUSE_TO_CELO: "5.0301068434398175 Fuse"
        }
      };

      try {
        console.log("Fetching live bridge fees...");
        const fees = await fetchBridgeFees();
        console.log("Fetched live fees:", fees);

        if (!isMounted) return;

        if (fees) {
          console.log("Using live fees");
          calculateFees(fees, sourceChainName, targetChainName, bridgeProvider);
        } else {
          console.log("No live fees received, using fallback fees");
          calculateFees(fallbackFees, sourceChainName, targetChainName, bridgeProvider);
        }
      } catch (error) {
        console.log("Live fees fetch failed, using fallback fees:", error);
        if (isMounted) {
          calculateFees(fallbackFees, sourceChainName, targetChainName, bridgeProvider);
        }
      } finally {
        if (isMounted) {
          console.log("Setting isLoading to false");
          setIsLoading(false);
        }
      }
    };

    void loadBridgeData();

    return () => {
      isMounted = false;
    };
  }, [sourceChain, targetChain, bridgeProvider, setFallbackLimits, calculateFees]);

  return { bridgeFees, bridgeLimits, isLoading, error };
};

// Helper function to extract bridge request ID from logs
const extractBridgeRequestId = (logs: any[], bridgeContract: any): string | undefined => {
  const bridgeRequestTopic = BRIDGE_CONSTANTS.BRIDGE_REQUEST_TOPIC;

  for (const log of logs) {
    if (log.address === bridgeContract?.address && log.topics[0] === bridgeRequestTopic) {
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

export const useMPBBridge = (bridgeProvider: BridgeProvider = "axelar") => {
  const bridgeLock = useRef(false);
  const { switchNetwork } = useSwitchNetwork();
  const { account, chainId } = useEthers();
  const mpbContracts = useGetMPBContracts();

  const [bridgeRequest, setBridgeRequest] = useState<BridgeRequest | undefined>();

  // Get G$ token contract for the current chain
  const gdContract = useGetContract("GoodDollar", true, "base", chainId) as IGoodDollar;

  // Use transferAndCall on the G$ token contract to transfer and call bridge in one transaction
  const bridgeContract = mpbContracts[chainId || BRIDGE_CONSTANTS.DEFAULT_CHAIN_ID];
  const transferAndCall = useContractFunction(gdContract, "transferAndCall", {
    transactionName: "MPBBridgeTransfer"
  });

  // Extract bridge request ID from transferAndCall logs
  const bridgeRequestId = useMemo(() => {
    if (transferAndCall.state?.status !== "Success" || !transferAndCall.state?.receipt?.logs) {
      return undefined;
    }

    return extractBridgeRequestId(transferAndCall.state.receipt.logs, bridgeContract);
  }, [transferAndCall.state?.status, transferAndCall.state?.receipt?.logs, bridgeContract]);

  // Poll target chain for bridge completion
  const bridgeCompletedEvent = useLogs(
    bridgeRequest &&
      bridgeRequestId && {
        contract: mpbContracts[bridgeRequest.targetChainId] ?? { address: ethers.constants.AddressZero },
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
    if (transferAndCall.state.status === "Mining" || transferAndCall.state.status === "PendingSignature") {
      return {
        chainId: bridgeRequest?.sourceChainId,
        status: transferAndCall.state.status,
        transaction: transferAndCall.state.transaction
      } as TransactionStatus;
    }

    if (transferAndCall.state.status === "Success" && bridgeCompletedEvent?.value?.length) {
      return {
        chainId: bridgeRequest?.targetChainId,
        status: "Success",
        transaction: { hash: bridgeCompletedEvent.value[0].transactionHash }
      } as TransactionStatus;
    }

    if (transferAndCall.state.status === "Exception") {
      return {
        chainId: bridgeRequest?.sourceChainId,
        status: "Fail",
        errorMessage: transferAndCall.state.errorMessage
      } as TransactionStatus;
    }

    return undefined;
  })();

  const sendMPBBridgeRequest = useCallback(
    async (amount: string, sourceChain: string, targetChain: string, target = account) => {
      setBridgeRequest(undefined);
      bridgeLock.current = false;
      transferAndCall.resetState();

      const targetChainId = getTargetChainId(targetChain);
      const sourceChainId = getSourceChainId(sourceChain);

      try {
        if (sourceChainId !== chainId) {
          await switchNetwork(sourceChainId);
        }

        setBridgeRequest({ amount, sourceChainId, targetChainId, target });
      } catch (error) {
        console.error("MPB Bridge error:", error);
        throw error;
      }
    },
    [account, transferAndCall, chainId, switchNetwork]
  );

  // Handle transferAndCall errors
  useEffect(() => {
    if (transferAndCall.state.status === "Exception") {
      console.error("TransferAndCall failed:", transferAndCall.state.errorMessage);
      bridgeLock.current = false; // Reset lock so user can try again
    }
  }, [transferAndCall.state.status]);

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

      // Encode the bridge parameters for transferAndCall
      const encoded = ethers.utils.defaultAbiCoder.encode(
        ["uint256", "address", "uint8"],
        [bridgeRequest.targetChainId, bridgeRequest.target || account, bridgeService]
      );

      // Use transferAndCall to transfer tokens and call bridge in one transaction
      void transferAndCall.send(bridgeContract?.address, bridgeRequest.amount, encoded);
    },
    [bridgeProvider, bridgeContract, account]
  );

  // Trigger the bridge request using transferAndCall
  useEffect(() => {
    if (transferAndCall.state.status === "None" && bridgeRequest && account && !bridgeLock.current) {
      bridgeLock.current = true;
      console.log("🌉 Starting bridge process with transferAndCall...");

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
          throw error;
        });
    }
  }, [transferAndCall.state.status, bridgeRequest, account, executeBridgeTransaction]);

  return {
    sendMPBBridgeRequest,
    bridgeRequestStatus: transferAndCall.state,
    bridgeStatus,
    bridgeRequest
  };
};
