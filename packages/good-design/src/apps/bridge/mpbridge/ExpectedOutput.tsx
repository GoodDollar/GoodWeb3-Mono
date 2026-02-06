import React from "react";
import { HStack, Text, VStack, Input } from "native-base";
import { CurrencyValue } from "@usedapp/core";

interface ExpectedOutputProps {
  expectedToReceive: CurrencyValue;
  targetChain: string;
  balance: CurrencyValue;
}

export const ExpectedOutput: React.FC<ExpectedOutputProps> = ({ expectedToReceive, targetChain, balance }) => {
  return (
    <VStack space={3}>
      <HStack justifyContent="space-between" alignItems="center">
        <Text fontFamily="subheading" fontSize="md" color="goodGrey.600" fontWeight="600">
          You will receive on {targetChain.toUpperCase()}
        </Text>
        <Text color="goodGrey.500" fontSize="sm" fontWeight="400">
          Balance: {balance.format()}
        </Text>
      </HStack>
      <Input
        value={expectedToReceive ? expectedToReceive.format() : "0"}
        isReadOnly
        borderRadius="lg"
        borderColor="goodGrey.300"
        bg="goodGrey.50"
        fontSize="md"
        padding={2}
        fontWeight="500"
      />
    </VStack>
  );
};
