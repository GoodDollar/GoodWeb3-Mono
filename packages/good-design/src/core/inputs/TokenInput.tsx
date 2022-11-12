import React, { useCallback, useState } from "react";
import { Box, Button, Input, Text, View } from "native-base";
import { NumericFormat } from "react-number-format";
// converts the value using the mask parameters
// const mask = (value: string = "", onChange: any, type: string, options?: ) => ({
//   // the value is converted to a mask so it is displayed properly with the <Input /> component
//   value: MaskService.toMask(type, value, options),
//   // when the value is modified, it is converted back to its raw value
//   onChangeText: (newValue: string) => onChange(MaskService.toMask(type, newValue, options))
// });

export const TokenInput = ({
  decimals,
  balanceWei,
  onChange,
  nfProps,
  buttonProps,
  textProps,
  minAmountWei = "0",
  ...props
}: {
  decimals: number;
  balanceWei: string;
  onChange: (v: string) => void;
  nfProps?: any;
  buttonProps?: any;
  textProps?: any;
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
  // const maskedInputProps = useMaskedInputProps({
  //   value: input,
  //   onChangeText: setInput,
  //   mask: createNumberMask({
  //     delimiter: ",",
  //     separator: ".",
  //     precision: decimals
  //   })
  // });

  return (
    <Box w="container" {...props}>
      <NumericFormat
        isInvalid={Number(input) > balance || Number(input) < minAmount}
        onChangeText={handleChange}
        InputLeftElement={
          <Button rounded="xl" variant="outline" h="0.5" ml="1" onPress={setMax} {...buttonProps}>
            Max
          </Button>
        }
        size="xl"
        value={input}
        customInput={Input}
        decimalSeparator={"."}
        decimalScale={decimals}
        {...nfProps}
      />
      <Text alignSelf={"flex-end"} {...textProps}>
        Balance: {balance}
      </Text>
    </Box>
  );
};
