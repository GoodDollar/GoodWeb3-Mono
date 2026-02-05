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
  calculateBridgeFees,
  normalizeAmountTo18,
  SOURCE_CHAIN_DECIMALS
} from "../constants";
import { MPBBridgeData } from "../types";
import { useGetMPBContract, useMPBG$TokenContract } from "./useGetMPBContract";

const THRESHOLD_18_DECIMALS = ethers.BigNumber.from(10).pow(15);

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
  const gdContract = useMPBG$TokenContract(sourceChainId, true);
  const tokenAddress = gdContract?.address;
  const spenderAddress = bridgeContract?.address;

  // Check allowance
  const allowance = useTokenAllowance(tokenAddress, effectiveAccount, spenderAddress, { chainId: sourceChainId });

  const fetchContractLimits = useCallback(async (contract: any, chainId: number) => {
    const sourceDecimals = SOURCE_CHAIN_DECIMALS[chainId] ?? 18;

    const to18IfSourceDecimals = (value: ethers.BigNumber): ethers.BigNumber => {
      if (value.lt(THRESHOLD_18_DECIMALS)) {
        return normalizeAmountTo18(value, chainId);
      }
      return value;
    };

    try {
      const limits = await contract.bridgeLimits();

      const rawMin = limits.minAmount.gt(0) ? limits.minAmount : ethers.utils.parseUnits("10", sourceDecimals);
      const rawMax = limits.txLimit.gt(0) ? limits.txLimit : ethers.constants.MaxUint256;

      const minAmount = to18IfSourceDecimals(rawMin);
      const maxAmount = to18IfSourceDecimals(rawMax);

      setBridgeLimits({ minAmount, maxAmount });
    } catch (error) {
      const fallbackMin = normalizeAmountTo18(ethers.utils.parseUnits("10", sourceDecimals), chainId);
      setBridgeLimits({
        minAmount: fallbackMin,
        maxAmount: ethers.constants.MaxUint256
      });
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
      setCanUserBridge(false);
    }
  }, []);

  // Helper to fetch protocol fee (bps) from contract and convert to percent
  const fetchProtocolFee = useCallback(async (contract: any) => {
    try {
      const fees = await contract.bridgeFees();
      // fees.fee is in basis points (bps). e.g. 15 => 0.15%
      const bps = Number(fees.fee?.toString() || "0");
      setProtocolFeePercent(bps / 10000);
    } catch (error) {
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
          bridgeContract ? fetchContractLimits(bridgeContract, sourceChainId) : Promise.resolve(),
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
          // Failed to fetch limits, already handled by setting null
        }
        if (protoFeeResult.status === "rejected") {
          // Failed to fetch protocol fee, already handled by setting null
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

  // Validation: compare user input (in source chain decimals) with contract limits (in 18 decimals)
  // We need to normalize the user input to 18 decimals for proper comparison
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

    // Normalize user input to 18 decimals for comparison with contract limits
    const normalizedAmount = normalizeAmountTo18(amountBN, sourceChainId);
    const belowMin = normalizedAmount.lt(bridgeLimits.minAmount);
    const aboveMax = normalizedAmount.gt(bridgeLimits.maxAmount);

    if (belowMin) {
      return {
        isValid: false,
        reason: VALIDATION_REASONS.MIN_AMOUNT,
        canBridge: canUserBridge,
        hasAllowance
      };
    }

    if (aboveMax) {
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
  }, [amount, bridgeLimits, canUserBridge, error, allowance, sourceChainId]);

  return { bridgeFees, bridgeLimits, protocolFeePercent, isLoading, error, validation, allowance };
};
