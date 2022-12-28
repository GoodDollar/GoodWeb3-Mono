import { Box, Button, Input, Text } from "native-base";
import React, { useCallback, useState } from "react";
import { NumericFormat } from "react-number-format";

export const TokenInput = ({
  decimals,
  balanceWei,
  onChange,
  _numericformat,
  _button,
  _text,
  minAmountWei = "0",
  ...props
}: {
  decimals: number;
  balanceWei: string;
  onChange: (v: string) => void;
  _numericformat?: any;
  _button?: any;
  _text?: any;
  minAmountWei?: string;
}) => {
  const [input, setInput] = useState<number>(0);
  const balance = Number(balanceWei) / 10 ** decimals;
  const minAmount = Number(minAmountWei) / 10 ** decimals;
  const setMax = () => setInput(balance);

  const handleChange = useCallback(
    (v: string) => {
      setInput(Number(v));
      onChange((Number(v) * 10 ** decimals).toFixed(0));
    },
    [setInput, onChange]
  );

  return (
    <Box w="container" {...props} width="100%">
      <NumericFormat
        isInvalid={Number(input) > balance || Number(input) < minAmount}
        onChangeText={handleChange}
        InputRightElement={
          <Button rounded="xl" variant="outline" h="0.5" mr="1" onPress={setMax} {..._button}>
            Max 
          </Button>
        }
        size="xl"
        value={input}
        customInput={Input}
        decimalSeparator={"."}
        decimalScale={decimals}
        color="lightGrey"
        {..._numericformat}
      />
        <Text bold color="lightGrey:alpha.80" alignSelf={"flex-end"} {..._text}>
          Balance: {balance}
        </Text>
    </Box>
  );
};
