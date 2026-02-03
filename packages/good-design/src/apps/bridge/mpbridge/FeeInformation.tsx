import React from "react";
import { Text, VStack } from "native-base";
import type { BridgeProvider } from "./types";
import { getCurrentBridgeFee } from "./utils";

export interface FeeInformationProps {
  sourceChain: string;
  targetChain: string;
  bridgeProvider: BridgeProvider;
  protocolFeePercent?: number;
  bridgeFees?: any;
  feesLoading?: boolean;
}

export const FeeInformation: React.FC<FeeInformationProps> = ({
  sourceChain,
  targetChain,
  bridgeProvider,
  protocolFeePercent,
  bridgeFees,
  feesLoading = false
}) => {
  const bridgeFeeDisplay = getCurrentBridgeFee(
    sourceChain,
    targetChain,
    bridgeProvider,
    bridgeFees ?? null,
    feesLoading
  );

  return (
    <VStack space={2} padding={4} bg="goodGrey.50" borderRadius="lg">
      {typeof protocolFeePercent === "number" && (
        <Text fontFamily="subheading" fontSize="sm" color="goodGrey.600" textAlign="center">
          Protocol Fee: {(protocolFeePercent * 100).toFixed(2)}% of bridged G$ amount
        </Text>
      )}
      <Text fontFamily="subheading" fontSize="sm" color="goodGrey.600" textAlign="center">
        Provider: {bridgeProvider.charAt(0).toUpperCase() + bridgeProvider.slice(1)}
      </Text>
      <Text fontFamily="subheading" fontSize="sm" color="goodGrey.600" textAlign="center">
        Bridge fee (pre-execution): {bridgeFeeDisplay}
      </Text>
    </VStack>
  );
};
