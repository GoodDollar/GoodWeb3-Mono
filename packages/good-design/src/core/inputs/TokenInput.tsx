import { Box, Button, HStack, Input, Text } from "native-base";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { NumericFormat } from "react-number-format";
import { CurrencyValue } from "@usedapp/core";
import { ethers } from "ethers";
import { debounce } from "lodash";
export const TokenInput = ({
  balanceWei,
  gdValue,
  onChange,
  toggleState,
  _numericformat,
  _button,
  minAmountWei = "0",
  inputDebounceMs = 500,
  ...props
}: {
  balanceWei: string;
  onChange: (v: string) => void;
  gdValue: CurrencyValue;
  toggleState?: any;
  _numericformat?: any;
  _button?: any;
  _text?: any;
  minAmountWei?: string;
  inputDebounceMs?: number;
}) => {
  const _decimals = gdValue.currency.decimals;
  const [input, setInput] = useState<number | string>(0);
  const balance = Number(balanceWei) / 10 ** _decimals;
  const minAmount = Number(minAmountWei) / 10 ** _decimals;
  const activeDebounceRef = useRef<any>(null);

  const handleChange = useCallback(
    debounce((v: string) => {
      if (!/^\d+(?:\.\d{1,18})?$/.test(v)) {
        //todo: add error handler/message
        console.error("Invalid input", v);
        return;
      }
      setInput(v);
      onChange(ethers.utils.parseUnits(v, _decimals).toString());
    }, inputDebounceMs),
    [setInput, onChange, _decimals, inputDebounceMs]
  );

  useEffect(() => {
    activeDebounceRef.current = handleChange;
    return () => {
      handleChange.cancel?.();
    };
  }, [handleChange]);

  const setMax = useCallback(() => {
    activeDebounceRef.current?.cancel?.();
    handleChange.cancel?.();
    const formattedExact = ethers.utils.formatUnits(balanceWei || "0", _decimals);
    setInput(formattedExact);
    onChange(balanceWei);
  }, [balanceWei, _decimals, onChange, handleChange]);

  useEffect(() => {
    setInput(0);
    onChange("0");
  }, [/* used */ toggleState]);

  return (
    <Box w="container" {...props} width="100%">
      <NumericFormat
        isInvalid={Number(input) > balance || Number(input) < minAmount}
        onChangeText={handleChange}
        InputLeftElement={
          <HStack alignItems="center">
            <Button mx="2" rounded="xl" variant="outline" h="0.5" mr="1" onPress={setMax} {..._button}>
              Max
            </Button>
            <Text color="goodGrey.600" fontSize="l" fontFamily="heading" fontWeight="700">
              G$
            </Text>
          </HStack>
        }
        size="xl"
        value={input}
        customInput={Input}
        decimalSeparator={"."}
        decimalScale={_decimals}
        color="lightGrey"
        {..._numericformat}
      />
    </Box>
  );
};
