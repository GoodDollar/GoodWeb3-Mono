import React, { useCallback, useEffect, useState } from "react";
import { Spinner, VStack } from "native-base";
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

  // Validation configuration for better readability
  const VALIDATION_RULES = {
    MIN_AMOUNT: ethers.BigNumber.from("1000000000000000000000"), // 1000 G$
    MAX_AMOUNT: ethers.BigNumber.from("1000000000000000000000000"), // 1M G$
    REASONS: {
      MIN_AMOUNT: "minAmount",
      MAX_AMOUNT: "maxAmount",
      INVALID_CHAIN: "invalidChain",
      INSUFFICIENT_BALANCE: "insufficientBalance"
    }
  } as const;

  // Validation helper functions for better readability
  const validateAmount = (amount: ethers.BigNumber, min: ethers.BigNumber, max: ethers.BigNumber) => {
    if (amount.lt(min)) return VALIDATION_RULES.REASONS.MIN_AMOUNT;
    if (amount.gt(max)) return VALIDATION_RULES.REASONS.MAX_AMOUNT;
    return null;
  };

  const validateChain = (chain: string) => {
    const validChains = ["fuse", "celo", "mainnet"];
    return validChains.includes(chain) ? null : VALIDATION_RULES.REASONS.INVALID_CHAIN;
  };

  // Create a stable validation function that doesn't use hooks inside
  const useCanMPBBridge = useCallback((chain: string, amountWei: string) => {
    // Parse and validate input
    const amountBN = ethers.BigNumber.from(amountWei || "0");

    // Check each validation rule and return the first failure reason
    const validationChecks = [
      () => validateChain(chain),
      () => validateAmount(amountBN, VALIDATION_RULES.MIN_AMOUNT, VALIDATION_RULES.MAX_AMOUNT)
    ];

    // Find the first validation failure
    for (const check of validationChecks) {
      const reason = check();
      if (reason) {
        return { isValid: false, reason };
      }
    }

    return { isValid: true, reason: "" };
  }, []);

  const onBridgeStartHandler = useCallback(
    async (sourceChain: string, targetChain: string) => {
      const [inputWei] = inputTransaction;

      try {
        await sendMPBBridgeRequest(inputWei, sourceChain, targetChain);
      } catch (e: any) {
        onBridgeFailed?.(e);
      }
    },
    [inputTransaction, sendMPBBridgeRequest, onBridgeFailed, originChain, chainId, bridgeFees]
  );

  useEffect(() => {
    if (bridgeRequestStatus?.status === "Exception") {
      // Handle error silently for now
    }
  }, [bridgeRequestStatus]);

  // Check if bridge data is loaded and fees are available
  if (!bridgeFees?.nativeFee || !bridgeLimits) {
    return <Spinner variant="page-loader" size="lg" />;
  }

  return (
    <VStack space={4} width="100%">
      <MPBBridge
        useCanMPBBridge={useCanMPBBridge}
        originChain={originChain}
        inputTransaction={inputTransaction}
        pendingTransaction={pendingTransaction}
        limits={{
          fuse: {
            minAmount: scaleFrom18(bridgeLimits.minAmount, fuseDecimals),
            maxAmount: scaleFrom18(bridgeLimits.maxAmount, fuseDecimals)
          },
          celo: {
            minAmount: scaleFrom18(bridgeLimits.minAmount, celoDecimals),
            maxAmount: scaleFrom18(bridgeLimits.maxAmount, celoDecimals)
          },
          mainnet: {
            minAmount: scaleFrom18(bridgeLimits.minAmount, mainnetDecimals),
            maxAmount: scaleFrom18(bridgeLimits.maxAmount, mainnetDecimals)
          }
        }}
        fees={{
          fuse: {
            nativeFee: bridgeFees.nativeFee || ethers.BigNumber.from(0),
            zroFee: bridgeFees.zroFee || ethers.BigNumber.from(0)
          },
          celo: {
            nativeFee: bridgeFees.nativeFee || ethers.BigNumber.from(0),
            zroFee: bridgeFees.zroFee || ethers.BigNumber.from(0)
          },
          mainnet: {
            nativeFee: bridgeFees.nativeFee || ethers.BigNumber.from(0),
            zroFee: bridgeFees.zroFee || ethers.BigNumber.from(0)
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
