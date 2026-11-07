import { Box, Button, HStack, Input, Text } from "native-base";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const [input, setInput] = useState<string | number>(0);
  const balance = Number(balanceWei) / 10 ** _decimals;
  const minAmount = Number(minAmountWei) / 10 ** _decimals;
  const formattedBalance = useMemo(
    () => ethers.utils.formatUnits(balanceWei || "0", _decimals),
    [balanceWei, _decimals]
  );

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const decimalsRef = useRef(_decimals);
  decimalsRef.current = _decimals;

  const handleChange = useMemo(
    () =>
      debounce((v: string) => {
        if (!/^\d+(?:\.\d{1,18})?$/.test(v)) {
          //todo: add error handler/message
          console.error("Invalid input", v);
          return;
        }
        setInput(v);
        onChangeRef.current(ethers.utils.parseUnits(v, decimalsRef.current).toString());
      }, inputDebounceMs),
    [inputDebounceMs]
  );

  const setMax = useCallback(() => {
    handleChange.cancel();
    setInput(formattedBalance);
    onChangeRef.current(balanceWei || "0");
  }, [handleChange, formattedBalance, balanceWei]);

  useEffect(() => {
    handleChange.cancel();
    setInput(0);
    onChangeRef.current("0");
  }, [/* used */ toggleState, handleChange]);

  useEffect(() => () => handleChange.cancel(), [handleChange]);

  const isInvalid = useMemo(() => {
    try {
      const inputStr = String(input || "0");
      const inputWei = ethers.utils.parseUnits(inputStr, _decimals);
      const balanceBn = ethers.BigNumber.from(balanceWei || "0");
      const minAmountBn = ethers.BigNumber.from(minAmountWei || "0");
      return inputWei.gt(balanceBn) || inputWei.lt(minAmountBn);
    } catch {
      return Number(input) > balance || Number(input) < minAmount;
    }
  }, [input, _decimals, balanceWei, minAmountWei, balance, minAmount]);

  return (
    <Box w="container" {...props} width="100%">
      <NumericFormat
        isInvalid={isInvalid}
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
