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
  },
  variants: {
    shadowedBanner: () => ({
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      px: 4,
      py: 2,
      marginBottom: 4,
      backgroundColor: "rgba(0,175,255,0.1)"
    })
  }
};

export const CentreBox = withTheme({ name: "CentreBox" })(({ children, ...props }: IBoxProps & VariantType) => (
  <Box {...props}>{children}</Box>
));
