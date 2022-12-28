import { Box, Input } from "native-base";
import React from "react";
import { NumericFormat } from "react-number-format";

export const TokenOutput = ({
  outputValue,
  _numericformat,
  ...props
}: {
  outputValue: string;
  _numericformat?: any;
  _button?: any;
  _text?: any;
}) => {

  return (
    <Box w="container" {...props} width="100%">
      <NumericFormat
        disabled
        // onChangeText={handleChange}
        size="xl"
        value={outputValue}
        customInput={Input}
        color="lightGrey"
        {..._numericformat}
      />
    </Box>
  );
};
