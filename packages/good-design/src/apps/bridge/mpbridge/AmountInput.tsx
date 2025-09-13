import React from "react";
import { HStack, Text, VStack } from "native-base";
import { TokenInput } from "../../../core";
import { CurrencyValue } from "@usedapp/core";

interface AmountInputProps {
  wei: string;
  gdValue: CurrencyValue;
  bridgeWeiAmount: string;
  setBridgeAmount: (amount: string) => void;
  minimumAmount: CurrencyValue;
  isValid: boolean;
  reason: string;
  sourceChain: string;
  balance: CurrencyValue;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  wei,
  gdValue,
  bridgeWeiAmount,
  setBridgeAmount,
  minimumAmount,
  isValid,
  reason,
  sourceChain,
  balance
}) => {
  return (
    <VStack space={3}>
      <HStack justifyContent="space-between" alignItems="center">
        <Text fontFamily="subheading" fontSize="md" color="goodGrey.600" fontWeight="600">
          Amount to send
        </Text>
        <Text color="goodGrey.500" fontSize="sm" fontWeight="400">
          Balance: {balance.format()}
        </Text>
      </HStack>
      <TokenInput
        balanceWei={wei}
        onChange={setBridgeAmount}
        gdValue={gdValue}
        minAmountWei={minimumAmount?.toString()}
      />
      {!isValid && bridgeWeiAmount && (
        <Text color="red.500" fontSize="sm" fontWeight="500">
          {reason === "minAmount"
            ? " Minimum amount is " + (Number(minimumAmount) / (sourceChain === "fuse" ? 1e2 : 1e18)).toFixed(2) + " G$"
            : undefined}
        </Text>
      )}
    </VStack>
  );
};
