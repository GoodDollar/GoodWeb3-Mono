import React, { useCallback, useEffect, useMemo, useState } from "react";
import { VStack } from "native-base";
import { useEthers } from "@usedapp/core";
import { ethers } from "ethers";

import { MPBBridge } from "./MPBBridge";
import { useMPBBridge, useGetMPBBridgeData, useG$Decimals } from "@gooddollar/web3sdk-v2";

interface IMPBBridgeControllerProps {
  withHistory?: boolean;
  onBridgeStart?: () => void;
  onBridgeSuccess?: () => void;
  onBridgeFailed?: (e: Error) => void;
}

export const MPBBridgeController: React.FC<IMPBBridgeControllerProps> = ({ onBridgeSuccess, onBridgeFailed }) => {
  const { chainId } = useEthers();
  const { sendMPBBridgeRequest, bridgeRequestStatus, bridgeStatus } = useMPBBridge("layerzero");

  const inputTransaction = useState<string>("0");
  const pendingTransaction = useState<any>(false);
  const originChain = useState<string>(chainId === 122 ? "fuse" : chainId === 42220 ? "celo" : "mainnet");
  const [, setSourceChain] = originChain;

  // Update sourceChain when user switches chains
  useEffect(() => {
    const currentChain = chainId === 122 ? "fuse" : chainId === 42220 ? "celo" : "mainnet";
    setSourceChain(currentChain);
  }, [chainId, setSourceChain]);

  const currentChain = chainId === 122 ? "fuse" : chainId === 42220 ? "celo" : "mainnet";
  const bridgeData = useGetMPBBridgeData(currentChain, "fuse", "layerzero");
  const { bridgeFees, bridgeLimits } = bridgeData;
  const protocolFeePercent = (bridgeData as any).protocolFeePercent as number | null;

  const fuseDecimals = useG$Decimals("G$", 122);
  const celoDecimals = useG$Decimals("G$", 42220);
  const mainnetDecimals = useG$Decimals("G$", 1);

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
      const hardMinimum = ethers.utils.parseUnits("1000", targetDecimals);
      const contractMinimum = scaleFrom18(bridgeLimits.minAmount, targetDecimals);
      return contractMinimum.gte(hardMinimum) ? contractMinimum : hardMinimum;
    };

    const buildLimits = (decimals?: number) => {
      const targetDecimals = decimals ?? 18;
      return {
        minAmount: toMinimum(targetDecimals),
        maxAmount: scaleFrom18(bridgeLimits.maxAmount, targetDecimals)
      };
    };

    return {
      fuse: buildLimits(fuseDecimals),
      celo: buildLimits(celoDecimals),
      mainnet: buildLimits(mainnetDecimals)
    };
  }, [bridgeLimits, fuseDecimals, celoDecimals, mainnetDecimals, scaleFrom18]);

  // Validation configuration
  const VALIDATION_REASONS = {
    MIN_AMOUNT: "minAmount",
    MAX_AMOUNT: "maxAmount",
    INVALID_CHAIN: "invalidChain",
    ERROR: "error"
  } as const;

  const useCanMPBBridge = useCallback(
    (chain: string, amountWei: string) => {
      // Validate chain
      const validChains = ["fuse", "celo", "mainnet"];
      if (!validChains.includes(chain)) {
        return { isValid: false, reason: VALIDATION_REASONS.INVALID_CHAIN };
      }

      // Return invalid if limits not available from contract
      if (!limitsByChain) {
        return { isValid: false, reason: VALIDATION_REASONS.ERROR };
      }

      // Parse amount
      const amountBN = ethers.BigNumber.from(amountWei || "0");

      const chainLimits = limitsByChain?.[chain as keyof typeof limitsByChain];
      if (!chainLimits) {
        return { isValid: false, reason: VALIDATION_REASONS.ERROR };
      }

      const minAmount = chainLimits.minAmount ?? ethers.BigNumber.from(0);

      // Validate amount against actual contract limits
      if (amountBN.lt(minAmount)) {
        return { isValid: false, reason: VALIDATION_REASONS.MIN_AMOUNT };
      }

      return { isValid: true, reason: "" };
    },
    [limitsByChain]
  );

  const onBridgeStartHandler = useCallback(
    async (sourceChain: string, targetChain: string) => {
      const [inputWei] = inputTransaction;

      try {
        await sendMPBBridgeRequest(inputWei, sourceChain, targetChain);
      } catch (e: any) {
        console.error("Bridge start error:", e);
      }
    },
    [inputTransaction, sendMPBBridgeRequest]
  );

  useEffect(() => {
    if (bridgeRequestStatus?.status === "Exception") {
      // The error is now handled in the bridge hook and propagated through bridgeStatus
      console.error("Bridge transaction exception:", bridgeRequestStatus.errorMessage);
    }
  }, [bridgeRequestStatus]);

  const effectiveFees = bridgeFees || { nativeFee: ethers.BigNumber.from(0), zroFee: ethers.BigNumber.from(0) };

  return (
    <VStack space={4} width="100%">
      <MPBBridge
        useCanMPBBridge={useCanMPBBridge}
        originChain={originChain}
        inputTransaction={inputTransaction}
        pendingTransaction={pendingTransaction}
        protocolFeePercent={protocolFeePercent || 0}
        limits={limitsByChain}
        fees={{
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
          }
        }}
        bridgeStatus={bridgeStatus}
        onBridgeStart={onBridgeStartHandler}
        onBridgeFailed={onBridgeFailed}
        onBridgeSuccess={onBridgeSuccess}
      />
    </VStack>
  );
};
