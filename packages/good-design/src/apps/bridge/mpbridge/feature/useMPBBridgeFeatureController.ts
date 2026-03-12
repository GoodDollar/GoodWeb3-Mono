import { useCallback, useEffect, useMemo, useState } from "react";
import { useEthers } from "@usedapp/core";
import { ethers } from "ethers";
import { useMPBBridgeFlow, useG$Decimals, SupportedChains, VALIDATION_REASONS } from "@gooddollar/web3sdk-v2";

import { BridgeProvider, MPBBridgeProps } from "../types";
import { getDefaultTargetChain } from "../utils/chainHelpers";

interface UseMPBBridgeFeatureControllerParams {
  onBridgeStart?: () => void;
  onBridgeSuccess?: () => void;
  onBridgeFailed?: (e: Error) => void;
}

const ZERO_FEE = { nativeFee: ethers.BigNumber.from(0), zroFee: ethers.BigNumber.from(0) };

export const useMPBBridgeFeatureController = ({
  onBridgeStart,
  onBridgeSuccess,
  onBridgeFailed
}: UseMPBBridgeFeatureControllerParams): MPBBridgeProps => {
  const { chainId, account } = useEthers();
  const [bridgeProvider, setBridgeProvider] = useState<BridgeProvider>("layerzero");

  const inputTransaction = useState<string>("0");
  const pendingTransaction = useState<any>(false);
  const [sourceChain, setSourceChain] = useState<string>(
    chainId && SupportedChains[chainId] ? SupportedChains[chainId].toLowerCase() : "celo"
  );
  const [targetChain, setTargetChain] = useState<string>("fuse");

  useEffect(() => {
    if (chainId && SupportedChains[chainId]) {
      const chain = SupportedChains[chainId].toLowerCase();
      setSourceChain(chain);
      setTargetChain(getDefaultTargetChain(chain));
    }
  }, [chainId]);

  const { sendMPBBridgeRequest, bridgeRequestStatus, bridgeStatus, bridgeData, flow } = useMPBBridgeFlow({
    bridgeProvider,
    sourceChain,
    targetChain,
    amountWei: inputTransaction[0],
    account
  });
  const { bridgeFees, bridgeLimits, validation, isLoading: bridgeDataLoading } = bridgeData;
  const protocolFeePercent = (bridgeData as any).protocolFeePercent as number | null;

  const fuseDecimals = useG$Decimals("G$", 122);
  const celoDecimals = useG$Decimals("G$", 42220);
  const mainnetDecimals = useG$Decimals("G$", 1);
  const xdcDecimals = useG$Decimals("G$", 50);

  const scaleFrom18 = useCallback((value18?: ethers.BigNumber, targetDecimals?: number): ethers.BigNumber => {
    const value = value18 ?? ethers.BigNumber.from(0);
    const decimals = targetDecimals ?? 18;

    if (decimals === 18) {
      return value;
    }

    if (decimals < 18) {
      return value.div(ethers.BigNumber.from(10).pow(18 - decimals));
    }

    return value.mul(ethers.BigNumber.from(10).pow(decimals - 18));
  }, []);

  const limitsByChain = useMemo(() => {
    if (!bridgeLimits) {
      return undefined;
    }

    const toMinimum = (decimals?: number) => {
      const targetDecimals = decimals ?? 18;
      return scaleFrom18(bridgeLimits.minAmount, targetDecimals);
    };

    const buildLimits = (decimals?: number) => {
      const targetDecimals = decimals ?? 18;
      return {
        minAmount: toMinimum(targetDecimals),
        maxAmount: scaleFrom18(bridgeLimits.maxAmount, targetDecimals)
      };
    };

    return {
      [sourceChain]: buildLimits(
        sourceChain === "fuse"
          ? fuseDecimals
          : sourceChain === "celo"
          ? celoDecimals
          : sourceChain === "mainnet"
          ? mainnetDecimals
          : xdcDecimals
      )
    };
  }, [bridgeLimits, fuseDecimals, celoDecimals, mainnetDecimals, xdcDecimals, scaleFrom18, sourceChain]);

  const useCanMPBBridge = useCallback(
    (chain: string, amountWei: string) => {
      if (bridgeDataLoading) {
        return { isValid: true, reason: "" };
      }

      if (amountWei === inputTransaction[0]) {
        if (!validation.isValid) {
          return { isValid: false, reason: validation.reason, errorMessage: validation.errorMessage };
        }

        if (!validation.canBridge) {
          return { isValid: false, reason: VALIDATION_REASONS.CANNOT_BRIDGE };
        }

        return { isValid: true, reason: "" };
      }

      return { isValid: true, reason: "" };
    },
    [validation, inputTransaction, bridgeDataLoading]
  );

  const onBridgeStartHandler = useCallback(
    async (sourceChain: string, targetChain: string) => {
      const [inputWei] = inputTransaction;

      try {
        onBridgeStart?.();
        await sendMPBBridgeRequest(inputWei, sourceChain, targetChain, account);
      } catch (e: any) {
        console.error("Bridge start error:", e);
      }
    },
    [inputTransaction, sendMPBBridgeRequest, account, onBridgeStart]
  );

  useEffect(() => {
    if (bridgeRequestStatus?.status === "Exception") {
      console.error("Bridge transaction exception:", bridgeRequestStatus.errorMessage);
      pendingTransaction[1](false);
      onBridgeFailed?.(new Error(bridgeRequestStatus.errorMessage || "Bridge transaction failed"));
    }
  }, [bridgeRequestStatus, pendingTransaction, onBridgeFailed]);

  const effectiveFees = bridgeFees || ZERO_FEE;

  return {
    useCanMPBBridge,
    originChain: [sourceChain, setSourceChain],
    targetChainState: [targetChain, setTargetChain],
    inputTransaction,
    pendingTransaction,
    protocolFeePercent: protocolFeePercent || 0,
    limits: limitsByChain,
    fees: {
      fuse: {
        nativeFee: effectiveFees.nativeFee || ethers.BigNumber.from(0),
        zroFee: effectiveFees.zroFee || ethers.BigNumber.from(0)
      },
      celo: {
        nativeFee: effectiveFees.nativeFee || ethers.BigNumber.from(0),
        zroFee: effectiveFees.zroFee || ethers.BigNumber.from(0)
      },
      mainnet: {
        nativeFee: effectiveFees.nativeFee || ethers.BigNumber.from(0),
        zroFee: effectiveFees.zroFee || ethers.BigNumber.from(0)
      },
      xdc: {
        nativeFee: effectiveFees.nativeFee || ethers.BigNumber.from(0),
        zroFee: effectiveFees.zroFee || ethers.BigNumber.from(0)
      }
    },
    bridgeStatus,
    bridgeFlow: flow,
    onBridgeStart: onBridgeStartHandler,
    onBridgeFailed,
    onBridgeSuccess,
    bridgeProvider,
    onBridgeProviderChange: setBridgeProvider
  };
};
