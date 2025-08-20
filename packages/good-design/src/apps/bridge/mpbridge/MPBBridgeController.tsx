import React, { useCallback, useEffect, useState } from "react";
import { Spinner, VStack } from "native-base";
import { useEthers } from "@usedapp/core";

import { MPBBridge } from "./MPBBridge";
import { useMPBBridge, useGetMPBBridgeData } from "@gooddollar/web3sdk-v2";

interface IMPBBridgeControllerProps {
  withHistory?: boolean;
  onBridgeStart?: () => void;
  onBridgeSuccess?: () => void;
  onBridgeFailed?: (e: Error) => void;
}

export const MPBBridgeController: React.FC<IMPBBridgeControllerProps> = ({ onBridgeSuccess, onBridgeFailed }) => {
  const { chainId } = useEthers();
  const { sendMPBBridgeRequest, bridgeRequestStatus, bridgeStatus } = useMPBBridge();
  const { bridgeFees, bridgeLimits } = useGetMPBBridgeData();

  const inputTransaction = useState<string>("0");
  const pendingTransaction = useState<any>(false);
  const originChain = useState<string>(chainId === 122 ? "fuse" : chainId === 42220 ? "celo" : "mainnet");

  const onBridgeStartHandler = useCallback(async () => {
    const [inputWei] = inputTransaction;

    try {
      await sendMPBBridgeRequest(inputWei, originChain[0]);
    } catch (e: any) {
      onBridgeFailed?.(e);
    }
  }, [inputTransaction, originChain, sendMPBBridgeRequest, onBridgeFailed]);

  useEffect(() => {
    if (bridgeRequestStatus?.status === "Exception") {
      // Handle error silently for now
      console.error("Bridge request failed:", bridgeRequestStatus.errorMessage);
    }
  }, [bridgeRequestStatus]);

  // Check if bridge data is loaded
  if (!bridgeFees || !bridgeLimits) {
    return <Spinner variant="page-loader" size="lg" />;
  }

  return (
    <VStack space={4} width="100%">
      <MPBBridge
        useCanMPBBridge={(chain: string, amountWei: string) => {
          const amount = Number(amountWei);
          const minAmount = Number(bridgeLimits.minAmount) || 1000000000000000000000;
          const maxAmount = Number(bridgeLimits.maxAmount) || 1000000000000000000000000;

          if (amount < minAmount) {
            return { isValid: false, reason: "minAmount" };
          }
          if (amount > maxAmount) {
            return { isValid: false, reason: "maxAmount" };
          }
          return { isValid: true, reason: "" };
        }}
        originChain={originChain}
        inputTransaction={inputTransaction}
        pendingTransaction={pendingTransaction}
        limits={{
          fuse: {
            minAmount: bridgeLimits.minAmount,
            maxAmount: bridgeLimits.maxAmount
          },
          celo: {
            minAmount: bridgeLimits.minAmount,
            maxAmount: bridgeLimits.maxAmount
          },
          mainnet: {
            minAmount: bridgeLimits.minAmount,
            maxAmount: bridgeLimits.maxAmount
          }
        }}
        fees={{
          fuse: {
            nativeFee: bridgeFees.nativeFee,
            zroFee: bridgeFees.zroFee
          },
          celo: {
            nativeFee: bridgeFees.nativeFee,
            zroFee: bridgeFees.zroFee
          },
          mainnet: {
            nativeFee: bridgeFees.nativeFee,
            zroFee: bridgeFees.zroFee
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
