import React from "react";
import { Box, Input } from "native-base";
import { NumericFormat } from "react-number-format";
import { CurrencyValue } from "@usedapp/core";

export const TokenOutput = ({
  outputValue,
  _numericformat,
  ...props
}: {
  outputValue: CurrencyValue;
  _numericformat?: any;
  _button?: any;
  _text?: any;
}) => {
  const value = outputValue.value.gt(0) ? outputValue.format({ suffix: "" }) : 0;

  return (
    <Box w="container" {...props} width="100%">
      <NumericFormat
        disabled
        size="xl"
        value={value}
        customInput={Input}
        color="lightGrey"
        decimalScale={outputValue.currency.decimals}
        {..._numericformat}
      />
    </Box>
  );
};
