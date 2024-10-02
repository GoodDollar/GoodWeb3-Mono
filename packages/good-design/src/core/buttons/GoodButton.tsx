import { Button, IButtonProps } from "native-base";
import React from "react";
import { Platform } from "react-native";

import { withTheme } from "../../theme/hoc/withTheme";
import { withThemingTools } from "../../theme/utils/themingTools";

const GoodButton = withTheme({ name: "GoodButton" })(({ children, ...props }: IButtonProps) => (
  <Button spinnerPlacement="start" {...props}>
    {children}
  </Button>
));

export const theme = {
  defaultProps: {},
  baseStyle: withThemingTools(() => {
    return {
      _text: {
        color: "white",
        textTransform: "uppercase",
        fontWeight: "bold",
        fontSize: "sm",
        fontFamily: "subheading"
      },
      _hover: {
        backgroundColor: "gdPrimary:alpha.80"
      },
      backgroundColor: "gdPrimary",
      borderRadius: 24,
      textAlign: "center"
    };
  }),
  variants: {
    "link-like": () => ({
      _text: {
        color: "goodGrey.400",
        underline: true,
        textTransform: "uppercase",
        fontFamily: "subheading",
        fontSize: "sm",
        fontWeight: "700"
      },
      _hover: {
        backgroundColor: "goodGrey.400:alpha.20"
      },
      backgroundColor: Platform.select({
        web: "none"
      }),
      paddingY: 0,
      paddingX: 8,
      textAlign: "center",
      lineHeight: 20.8
    })
  }
};

export default GoodButton;
