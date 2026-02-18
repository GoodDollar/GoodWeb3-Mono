import { useState, useEffect, useCallback, useMemo } from "react";
import { useEthers, useTokenAllowance } from "@usedapp/core";
import { ethers } from "ethers";
import { fetchBridgeFees } from "../api";
import { G$Decimals, SupportedChains } from "../../constants";
import {
  VALIDATION_REASONS,
  ERROR_MESSAGES,
  BridgeProvider,
  safeBigNumber,
  getSourceChainId,
  calculateBridgeFees,
  normalizeAmountTo18
} from "../constants";
import { MPBBridgeData } from "../types";
import { useGetContract } from "../../base/react";
import { useMPBG$TokenContract } from "./useMPBG$TokenContract";

const THRESHOLD_18_DECIMALS = ethers.BigNumber.from(10).pow(15);

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { account } = useEthers();
  const effectiveAccount = address || account;

  const sourceChainId = getSourceChainId(sourceChain || "celo");
  const mpbContract = useGetContract("MPBBridge", true, "base", sourceChainId);

  const gdContract = useMPBG$TokenContract(sourceChainId, true);
  const tokenAddress = gdContract?.address;
  const spenderAddress = mpbContract?.address;

  const allowance = useTokenAllowance(tokenAddress, effectiveAccount, spenderAddress, { chainId: sourceChainId });

  const fetchContractLimits = useCallback(async (contract: any, chainId: number) => {
    const sourceDecimals = G$Decimals["G$"][chainId as SupportedChains] ?? 18;

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

  const fetchProtocolFee = useCallback(async (contract: any) => {
    try {
      const fees = await contract.bridgeFees();
      const bps = Number(fees.fee?.toString() || "0");
      setProtocolFeePercent(bps / 10000);
    } catch (error) {
      setProtocolFeePercent(null);
    }
  }, []);

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

  // Static bridge data — only re-fetch when chain/provider/contract changes
  useEffect(() => {
    let isMounted = true;

    setError(null);
    setIsLoading(true);

    const loadStaticBridgeData = async () => {
      const sourceChainName = sourceChain || "celo";
      const targetChainName = targetChain || "fuse";

      try {
        const [fees] = await Promise.allSettled([
          fetchBridgeFees(),
          mpbContract ? fetchContractLimits(mpbContract, sourceChainId) : Promise.resolve(),
          mpbContract ? fetchProtocolFee(mpbContract) : Promise.resolve()
        ]);

        if (!isMounted) return;

        if (fees.status === "fulfilled" && fees.value) {
          calculateFees(fees.value, sourceChainName, targetChainName, bridgeProvider);
        } else {
          setError("We were unable to fetch bridge fees. Try again later or contact support.");
        }

        setIsLoading(false);
      } catch (error) {
        if (isMounted) {
          setError("We were unable to fetch bridge data. Try again later or contact support.");
          setIsLoading(false);
        }
      }
    };

    void loadStaticBridgeData();

    return () => {
      isMounted = false;
    };
  }, [
    sourceChain,
    targetChain,
    bridgeProvider,
    calculateFees,
    mpbContract,
    fetchContractLimits,
    fetchProtocolFee,
    sourceChainId
  ]);

  // Local-only validation against cached limits — no network calls
  // canBridge is checked at transaction time by useBridgeValidators
  const validation = useMemo<ValidationResult>(() => {
    const amountBN = safeBigNumber(amount);
    const hasAllowance = allowance ? allowance.gte(amountBN) : false;

    if (isLoading) {
      return { isValid: true, reason: "", canBridge: true, hasAllowance };
    }

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

    const normalizedAmount = normalizeAmountTo18(amountBN, sourceChainId);

    if (normalizedAmount.lt(bridgeLimits.minAmount)) {
      return {
        isValid: false,
        reason: VALIDATION_REASONS.MIN_AMOUNT,
        canBridge: true,
        hasAllowance
      };
    }

    if (normalizedAmount.gt(bridgeLimits.maxAmount)) {
      return {
        isValid: false,
        reason: VALIDATION_REASONS.MAX_AMOUNT,
        canBridge: true,
        hasAllowance
      };
    }

    return { isValid: true, reason: "", canBridge: true, hasAllowance };
  }, [amount, bridgeLimits, error, allowance, sourceChainId, isLoading]);

  return { bridgeFees, bridgeLimits, protocolFeePercent, isLoading, error, validation, allowance };
};
