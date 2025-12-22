import React from "react";
import { HStack, Pressable, Text, VStack } from "native-base";
import type { BridgeProvider } from "./types";

interface BridgeProviderSelectorProps {
  bridgeProvider: BridgeProvider;
  onProviderChange: (provider: BridgeProvider) => void;
}

export const BridgeProviderSelector: React.FC<BridgeProviderSelectorProps> = ({ bridgeProvider, onProviderChange }) => {
  return (
    <VStack space={4}>
      <Text fontFamily="heading" fontSize="lg" fontWeight="700" textAlign="center" color="goodGrey.500">
        Select Bridge Provider
      </Text>
      <HStack space={4}>
        <Pressable
          flex={1}
          onPress={() => onProviderChange("axelar")}
          bg={bridgeProvider === "axelar" ? "rgb(59, 130, 246)" : "goodGrey.100"}
          borderRadius="lg"
          padding={3}
          alignItems="center"
          borderWidth={bridgeProvider === "axelar" ? 2 : 1}
          borderColor={bridgeProvider === "axelar" ? "rgb(59, 130, 246)" : "goodGrey.300"}
        >
          <Text color={bridgeProvider === "axelar" ? "white" : "goodGrey.700"} fontWeight="600" fontSize="lg">
            Axelar
          </Text>
        </Pressable>
        <Pressable
          flex={1}
          onPress={() => onProviderChange("layerzero")}
          bg={bridgeProvider === "layerzero" ? "rgb(59, 130, 246)" : "goodGrey.100"}
          borderRadius="lg"
          padding={3}
          alignItems="center"
          borderWidth={bridgeProvider === "layerzero" ? 2 : 1}
          borderColor={bridgeProvider === "layerzero" ? "rgb(59, 130, 246)" : "goodGrey.300"}
        >
          <Text color={bridgeProvider === "layerzero" ? "white" : "goodGrey.700"} fontWeight="600" fontSize="lg">
            LayerZero
          </Text>
        </Pressable>
      </HStack>
    </VStack>
  );
};
