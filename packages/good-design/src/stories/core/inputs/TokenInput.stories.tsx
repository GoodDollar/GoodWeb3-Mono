import React, { useState } from "react";
import { TokenInput } from "../../../core/inputs/TokenInput";
import { NativeBaseProvider, Box, Text } from "native-base";
import { CurrencyValue, Currency } from "@usedapp/core";

const mockCurrency = new Currency("GoodDollar", "G$", 18);

export default {
  title: "Core/TokenInput",
  component: TokenInput,
  argTypes: {
    balanceWei: {
      control: "text",
      description: "Balance in Wei"
    },
    minAmountWei: {
      control: "text",
      description: "Minimum allowed amount in Wei"
    }
  }
};

export const Default = {
  args: {
    balanceWei: "500000000000000000000", // 500 G$
    minAmountWei: "1000000000000000000", // 1 G$
    gdValue: new CurrencyValue(mockCurrency, BigInt("500000000000000000000")),
    onChange: (val: string) => console.log("onChange:", val)
  }
};

export const MaxButtonInteraction = () => {
  const [value, setValue] = useState("0");
  const balanceWei = "1250000000000000000000"; // 1,250 G$
  const gdValue = new CurrencyValue(mockCurrency, BigInt(balanceWei));

  return (
    <NativeBaseProvider>
      <Box p="4">
        <TokenInput
          balanceWei={balanceWei}
          gdValue={gdValue}
          minAmountWei="0"
          onChange={setValue}
        />
        <Text mt="2" fontSize="sm" color="gray.500">
          Selected Wei: {value}
        </Text>
      </Box>
    </NativeBaseProvider>
  );
};
