import React, { FC } from "react";
import { Box } from "native-base";
import { IBoxProps } from "native-base/lib/typescript/components/primitives/Box";

import { withTheme } from "../../theme/hoc/withTheme";

export const theme = {
  baseStyle: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }
};

export const CentreBox: FC<IBoxProps> = withTheme({ name: "CentreBox" })(({ children, ...props }) => (
  <Box {...props}>{children}</Box>
));
