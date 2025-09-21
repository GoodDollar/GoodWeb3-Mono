import React from "react";
import { Text, VStack } from "native-base";
import { CurrencyValue } from "@usedapp/core";
import { getCurrentBridgeFee } from "./utils";
import type { BridgeProvider } from "./types";

interface FeeInformationProps {
  minimumAmount: CurrencyValue;
  sourceChain: string;
  targetChain: string;
  bridgeProvider: BridgeProvider;
  bridgeFees: any;
  feesLoading: boolean;
}

export const FeeInformation: React.FC<FeeInformationProps> = ({
  sourceChain,
  targetChain,
  bridgeProvider,
  bridgeFees,
  feesLoading
}) => {
  return (
    <VStack space={2} padding={4} bg="goodGrey.50" borderRadius="lg" borderWidth="1" borderColor="goodGrey.200">
      <Text fontFamily="subheading" fontSize="sm" color="goodGrey.600">
        Minimum amount to bridge: 1000 G$
      </Text>
      <Text fontFamily="subheading" fontSize="sm" color="goodGrey.600">
        Bridge Fee: {getCurrentBridgeFee(sourceChain, targetChain, bridgeProvider, bridgeFees, feesLoading)}
      </Text>
      <Text fontFamily="subheading" fontSize="sm" color="goodGrey.600">
        Provider: {bridgeProvider.charAt(0).toUpperCase() + bridgeProvider.slice(1)}
      </Text>
    </VStack>
  );
};
