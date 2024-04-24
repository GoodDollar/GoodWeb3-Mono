import { ITextProps, Text } from "native-base";
import React, { FC } from "react";
import { withTheme } from "../../theme/hoc/withTheme";

const Title: FC<ITextProps> = withTheme({ name: "Title" })(({ children, ...props }) => (
  <Text {...props}>{children}</Text>
));

export const theme = {
  defaultProps: {
    color: "main",
    size: "lg"
  },
  baseStyle: {
    fontFamily: "heading",
    fontWeight: "bold",
    lineHeight: "md"
  },
  sizes: {
    lg: {
      fontSize: "32px"
    }
  },
  variants: {
    "subtitle-grey": () => ({
      fontFamily: "subheading",
      fontSize: "md",
      fontWeight: "500",
      color: "goodGrey.600",
      lineHeight: "125%"
    }),
    "title-gdblue": () => ({
      color: "primary",
      fontWeight: 700,
      fontFamily: "heading",
      fontSize: "l",
      textAlign: "center",
      lineHeight: 27.6
    }),
    "title-gdred": () => ({
      color: "goodRed.100",
      fontWeight: 900,
      fontFamily: "heading",
      fontSize: "xl",
      textAlign: "center",
      lineHeight: 27.6
    })
  }
};

export default Title;
