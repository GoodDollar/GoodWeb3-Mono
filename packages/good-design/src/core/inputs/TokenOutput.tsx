import { G$Token, useG$Decimals } from "@gooddollar/web3sdk-v2";
import { Box, Input } from "native-base";
import React, { useContext } from "react";
import { NumericFormat } from "react-number-format";

export const TokenOutput = ({
  outputValue,
  token = 'G$',
  _numericformat,
  ...props
}: {
  outputValue: string;
  token: G$Token,
  _numericformat?: any;
  _button?: any;
  _text?: any;
}) => {
  const decimals = useG$Decimals(token);

  return (
    <Box w="container" {...props} width="100%">
      <NumericFormat
        disabled
        size="xl"
        value={outputValue}
        customInput={Input}
        color="lightGrey"
        decimalScale={decimals || undefined}
        {..._numericformat}
      />
    </Box>
  );
}
