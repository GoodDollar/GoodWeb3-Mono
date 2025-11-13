import React from "react";
import { Text, VStack } from "native-base";
import type { BridgeProvider } from "./types";

export interface FeeInformationProps {
  sourceChain: string;
  targetChain: string;
  bridgeProvider: BridgeProvider;
  protocolFeePercent?: number;
}

export const FeeInformation: React.FC<FeeInformationProps> = props => {
  const { bridgeProvider, protocolFeePercent } = props;
  return (
    <VStack space={2} padding={4} bg="goodGrey.50" borderRadius="lg" borderWidth="1" borderColor="goodGrey.200">
      {typeof protocolFeePercent === "number" && (
        <Text fontFamily="subheading" fontSize="sm" color="goodGrey.600">
          Protocol Fee: {(protocolFeePercent * 100).toFixed(2)}% of bridged G$ amount
        </Text>
      )}
      <Text fontFamily="subheading" fontSize="sm" color="goodGrey.600">
        Provider: {bridgeProvider.charAt(0).toUpperCase() + bridgeProvider.slice(1)}
      </Text>
    </VStack>
  );
};
