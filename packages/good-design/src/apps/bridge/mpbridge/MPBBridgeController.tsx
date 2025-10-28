import React, { useCallback, useEffect, useState } from "react";
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
  const { bridgeFees, bridgeLimits } = useGetMPBBridgeData(currentChain, "fuse", "layerzero");

  // Per-chain decimals to scale 18-decimal limits to the active chain units
  const fuseDecimals = useG$Decimals("G$", 122);
  const celoDecimals = useG$Decimals("G$", 42220);
  const mainnetDecimals = useG$Decimals("G$", 1);

  const scaleFrom18 = (value18?: ethers.BigNumber, targetDecimals?: number): ethers.BigNumber => {
    const v = value18 ?? ethers.BigNumber.from(0);
    const d = targetDecimals ?? 18;
    if (d === 18) return v;
    if (d < 18) return v.div(ethers.BigNumber.from(10).pow(18 - d));
    return v.mul(ethers.BigNumber.from(10).pow(d - 18));
  };

  // Use contract limits directly (hook handles fallback internally)
  const effectiveLimits = bridgeLimits;

  // Validation configuration
  const VALIDATION_REASONS = {
    MIN_AMOUNT: "minAmount",
    MAX_AMOUNT: "maxAmount",
    INVALID_CHAIN: "invalidChain"
  } as const;

  // Create validation function that uses actual contract limits
  const useCanMPBBridge = useCallback(
    (chain: string, amountWei: string) => {
      // Validate chain
      const validChains = ["fuse", "celo", "mainnet"];
      if (!validChains.includes(chain)) {
        return { isValid: false, reason: VALIDATION_REASONS.INVALID_CHAIN };
      }

      // Return valid while loading limits
      if (!effectiveLimits) {
        return { isValid: true, reason: "" };
      }

      // Parse amount
      const amountBN = ethers.BigNumber.from(amountWei || "0");

      // Get limits for the source chain (need to scale from 18 decimals to chain decimals)
      const chainDecimals = chain === "fuse" ? fuseDecimals : chain === "celo" ? celoDecimals : mainnetDecimals;
      const minAmount = scaleFrom18(effectiveLimits.minAmount, chainDecimals);
      const maxAmount = scaleFrom18(effectiveLimits.maxAmount, chainDecimals);

      // Validate amount against actual contract limits
      if (amountBN.lt(minAmount)) {
        return { isValid: false, reason: VALIDATION_REASONS.MIN_AMOUNT };
      }
      if (amountBN.gt(maxAmount)) {
        return { isValid: false, reason: VALIDATION_REASONS.MAX_AMOUNT };
      }

      return { isValid: true, reason: "" };
    },
    [effectiveLimits, fuseDecimals, celoDecimals, mainnetDecimals]
  );

  const onBridgeStartHandler = useCallback(
    async (sourceChain: string, targetChain: string) => {
      const [inputWei] = inputTransaction;

      try {
        await sendMPBBridgeRequest(inputWei, sourceChain, targetChain);
      } catch (e: any) {
        // Error handling is done in the hook and UI component
        // Just log it here for debugging
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
        limits={{
          fuse: effectiveLimits
            ? {
                minAmount: scaleFrom18(effectiveLimits.minAmount, fuseDecimals),
                maxAmount: scaleFrom18(effectiveLimits.maxAmount, fuseDecimals)
              }
            : {
                minAmount: ethers.BigNumber.from("1000000000000000000000"), // Fallback: 1000 G$
                maxAmount: ethers.BigNumber.from("1000000000000000000000000") // Fallback: 1M G$
              },
          celo: effectiveLimits
            ? {
                minAmount: scaleFrom18(effectiveLimits.minAmount, celoDecimals),
                maxAmount: scaleFrom18(effectiveLimits.maxAmount, celoDecimals)
              }
            : {
                minAmount: ethers.BigNumber.from("1000000000000000000000"), // Fallback: 1000 G$
                maxAmount: ethers.BigNumber.from("1000000000000000000000000") // Fallback: 1M G$
              },
          mainnet: effectiveLimits
            ? {
                minAmount: scaleFrom18(effectiveLimits.minAmount, mainnetDecimals),
                maxAmount: scaleFrom18(effectiveLimits.maxAmount, mainnetDecimals)
              }
            : {
                minAmount: ethers.BigNumber.from("1000000000000000000000"), // Fallback: 1000 G$
                maxAmount: ethers.BigNumber.from("1000000000000000000000000") // Fallback: 1M G$
              }
        }}
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
