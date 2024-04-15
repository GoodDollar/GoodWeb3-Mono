import { IButtonProps } from "native-base";
import { Button } from "native-base";
import React from "react";
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
      backgroundColor: "primary",
      paddingX: 8,
      paddingY: 10,
      borderRadius: 24,
      textAlign: "center"
    };
  }),
  variants: {
    "link-like": () => ({
      _text: {
        color: "goodGrey.450",
        underline: true,
        textTransform: "uppercase",
        fontFamily: "subheading",
        fontSize: "sm",
        fontWeight: "700"
      },
      backgroundColor: "none",
      paddingY: 0,
      paddingX: 8,
      textAlign: "center",
      lineHeight: 20.8
    })
  }
};

export default GoodButton;
