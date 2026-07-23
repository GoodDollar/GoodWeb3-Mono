import { useState, useEffect, useCallback, useMemo } from "react";
import { useEthers } from "@usedapp/core";
import { ethers } from "ethers";
import { fetchBridgeFees } from "../api";
import { fetchMPBStaticBridgeData } from "../cache";
import { G$Decimals, SupportedChains } from "../../constants";
import {
  VALIDATION_REASONS,
  ERROR_MESSAGES,
  BridgeProvider,
  getSourceChainId,
  calculateBridgeFees,
  normalizeAmountTo18
} from "../constants";
import { MPBBridgeData, MPBBridgeReadOnlyUrls } from "../types";
import { useMPBBridgeContracts } from "./useMPBBridgeContracts";

const THRESHOLD_18_DECIMALS = ethers.BigNumber.from(10).pow(15);

interface BridgeFees {
  nativeFee: ethers.BigNumber | null;
  zroFee: ethers.BigNumber | null;
}

interface BridgeLimitsData {
  minAmount: ethers.BigNumber;
  maxAmount: ethers.BigNumber;
}

export interface ValidationResult {
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
  address?: string,
  readOnlyUrls?: MPBBridgeReadOnlyUrls
): MPBBridgeData & { validation: ValidationResult } => {
  const [bridgeFees, setBridgeFees] = useState<BridgeFees>({ nativeFee: null, zroFee: null });
  const [bridgeLimits, setBridgeLimits] = useState<BridgeLimitsData | null>(null);
  const [protocolFeePercent, setProtocolFeePercent] = useState<number | null>(null);
  const [allowance, setAllowance] = useState<ethers.BigNumber>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { account } = useEthers();
  const effectiveAccount = address || account;

  const sourceChainId = getSourceChainId(sourceChain || "celo");
  const { bridgeContract: mpbContract, tokenContract: gdContract } = useMPBBridgeContracts(sourceChainId, readOnlyUrls);

  /**
   * Allowance is informational in this flow because MPB currently requests a
   * fresh approval before bridging. Read it once per account/source combination
   * instead of subscribing to usedapp's block polling.
   */
  useEffect(() => {
    let isMounted = true;

    if (!gdContract || !mpbContract || !effectiveAccount) {
      setAllowance(undefined);
      return;
    }

    gdContract
      .allowance(effectiveAccount, mpbContract.address)
      .then((value: ethers.BigNumberish) => {
        if (isMounted) {
          setAllowance(ethers.BigNumber.from(value));
        }
      })
      .catch(() => {
        if (isMounted) {
          setAllowance(undefined);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [effectiveAccount, gdContract, mpbContract]);

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

  // The static contract values and API fees each have a shared 20-minute cache.
  // This effect can safely rerun when the route changes without producing
  // duplicate network traffic.
  useEffect(() => {
    let isMounted = true;

    setError(null);
    setIsLoading(true);

    const loadStaticBridgeData = async () => {
      const sourceChainName = sourceChain || "celo";
      const targetChainName = targetChain || "fuse";
      const sourceDecimals = G$Decimals["G$"][sourceChainId as SupportedChains] ?? 18;

      try {
        const [fees, staticContractData] = await Promise.allSettled([
          fetchBridgeFees(),
          mpbContract ? fetchMPBStaticBridgeData(mpbContract, sourceChainId) : Promise.reject()
        ]);

        if (!isMounted) return;

        if (staticContractData.status === "fulfilled") {
          const to18IfSourceDecimals = (value: ethers.BigNumber): ethers.BigNumber => {
            if (value.lt(THRESHOLD_18_DECIMALS)) {
              return normalizeAmountTo18(value, sourceChainId);
            }

            return value;
          };

          const rawMin = staticContractData.value.minAmount.gt(0)
            ? staticContractData.value.minAmount
            : ethers.utils.parseUnits("10", sourceDecimals);
          const rawMax = staticContractData.value.txLimit.gt(0)
            ? staticContractData.value.txLimit
            : ethers.constants.MaxUint256;

          setBridgeLimits({
            minAmount: to18IfSourceDecimals(rawMin),
            maxAmount: to18IfSourceDecimals(rawMax)
          });
          setProtocolFeePercent(staticContractData.value.protocolFeeBps.toNumber() / 10000);
        } else {
          // Preserve the existing conservative fallback so a temporary RPC
          // outage does not leave the form without usable limits.
          setBridgeLimits({
            minAmount: normalizeAmountTo18(ethers.utils.parseUnits("10", sourceDecimals), sourceChainId),
            maxAmount: ethers.constants.MaxUint256
          });
          setProtocolFeePercent(null);
        }

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
  }, [sourceChain, targetChain, bridgeProvider, calculateFees, mpbContract, sourceChainId]);

  // Local-only validation against cached limits — no network calls
  // canBridge is checked at transaction time by useBridgeValidators
  const validation = useMemo<ValidationResult>(() => {
    const amountBN = ethers.BigNumber.from(amount || "0");
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
