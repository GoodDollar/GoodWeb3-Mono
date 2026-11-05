import React from "react";
import { Currency, CurrencyValue } from "@usedapp/core";
import { NativeBaseProvider, Text } from "native-base";
import { TokenInput } from "../../../core/inputs/TokenInput";

export default {
  title: "Core/TokenInput",
  component: TokenInput
};

const goodDollar = new Currency("GoodDollar", "G$", 18);

const TokenInputExample = (args: React.ComponentProps<typeof TokenInput>) => {
  const [lastChange, setLastChange] = React.useState("0");
  return (
    <NativeBaseProvider>
      <TokenInput
        {...args}
        onChange={(value: string) => {
          setLastChange(value);
          args.onChange(value);
        }}
      />
      <Text>Last onChange (wei): {lastChange}</Text>
    </NativeBaseProvider>
  );
};

export const TokenInputStory = {
  render: (args: React.ComponentProps<typeof TokenInput>) => <TokenInputExample {...args} />,
  args: {
    balanceWei: "300000000000000000000",
    gdValue: CurrencyValue.zero(goodDollar),
    onChange: (_value: string) => {}
  }
};
