import React from "react";
import { Text, VStack } from "native-base";
import { getFeeString } from "@gooddollar/web3sdk-v2";
import type { BridgeProvider } from "./types";

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
  const bridgeFeeDisplay =
    !bridgeFees || feesLoading
      ? "Loading..."
      : getFeeString(bridgeFees, bridgeProvider, sourceChain, targetChain) || "Fee not available";

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
        Bridge Fee: {bridgeFeeDisplay}
      </Text>
    </VStack>
  );
};
