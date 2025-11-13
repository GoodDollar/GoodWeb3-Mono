import React from "react";
import { HStack, Text, VStack } from "native-base";
import { TokenInput } from "../../../core";
import { CurrencyValue } from "@usedapp/core";

// Types and error messages (local definition)
type ValidationReason = "minAmount" | "maxAmount" | "cannotBridge" | "error" | "insufficientBalance" | "invalidChain";

const VALIDATION_ERROR_MESSAGES: Record<ValidationReason, string> = {
  minAmount: "Minimum amount is 1000 G$",
  maxAmount: "Amount exceeds maximum limit",
  cannotBridge: "Bridge not available for this amount",
  error: "Invalid amount",
  insufficientBalance: "Insufficient balance",
  invalidChain: "Invalid chain selection"
} as const;

interface AmountInputProps {
  wei: string;
  gdValue: CurrencyValue;
  bridgeWeiAmount: string;
  setBridgeAmount: (amount: string) => void;
  minimumAmount: CurrencyValue;
  isValid: boolean;
  reason: ValidationReason;
  balance: CurrencyValue;
  toggleState?: any;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  wei,
  gdValue,
  bridgeWeiAmount,
  setBridgeAmount,
  minimumAmount,
  isValid,
  reason,
  balance,
  toggleState
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
        toggleState={toggleState}
      />
      {!isValid && bridgeWeiAmount && (
        <Text color="red.500" fontSize="sm" fontWeight="500">
          {VALIDATION_ERROR_MESSAGES[reason]}
        </Text>
      )}
    </VStack>
  );
};
