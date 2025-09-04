import React, { useCallback, useEffect, useState } from "react";
import { Spinner, VStack } from "native-base";
import { useEthers } from "@usedapp/core";
import { ethers } from "ethers";

import { MPBBridge } from "./MPBBridge";
import { useMPBBridge, useGetMPBBridgeData, useG$Decimals, useMPBBridgeLimits } from "@gooddollar/web3sdk-v2";

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
          // Use the actual contract-based validation
          const chainId = chain === "fuse" ? 122 : chain === "celo" ? 42220 : 1;
          const { isValid, reason } = useMPBBridgeLimits(amountWei);

          // Debug logging
          console.log("Bridge validation debug:", {
            inputAmount: amountWei,
            chain,
            chainId,
            isValid,
            reason,
            amountBN: amountWei ? ethers.BigNumber.from(amountWei).toString() : "0"
          });

          return { isValid: Boolean(isValid), reason };
        }}
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
