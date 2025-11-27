import { useState, useEffect, useCallback, useMemo } from "react";
import { useEthers, useTokenAllowance } from "@usedapp/core";
import { ethers } from "ethers";
import { fetchBridgeFees } from "../api";
import {
  VALIDATION_REASONS,
  ERROR_MESSAGES,
  BridgeProvider,
  safeBigNumber,
  getSourceChainId,
  calculateBridgeFees
} from "../constants";
import { MPBBridgeData } from "../types";
import { useGetMPBContract, useNativeTokenContract } from "./useGetMPBContract";

// Types for better readability
interface BridgeFees {
  nativeFee: ethers.BigNumber | null;
  zroFee: ethers.BigNumber | null;
}

interface BridgeLimitsData {
  minAmount: ethers.BigNumber;
  maxAmount: ethers.BigNumber;
}

interface ValidationResult {
  isValid: boolean;
  reason: string;
  errorMessage?: string;
  canBridge: boolean;
  hasAllowance: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
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
        maxAmount: limits.txLimit
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
        setCanUserBridge(true);
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

  return { bridgeFees, bridgeLimits, protocolFeePercent, isLoading, error, validation, allowance };
};
