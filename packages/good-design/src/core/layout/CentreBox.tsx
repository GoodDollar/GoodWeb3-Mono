import React from "react";
import { Box } from "native-base";
import { IBoxProps } from "native-base/lib/typescript/components/primitives/Box";

import { withTheme } from "../../theme";
import { VariantType } from "native-base/lib/typescript/components/types";

export const theme = {
  baseStyle: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }
};

export const CentreBox = withTheme({ name: "CentreBox" })(({ children, ...props }: IBoxProps) => (
  <Box {...props}>{children}</Box>
));
