import { ITextProps, Text } from "native-base";
import React, { FC } from "react";
import { withTheme } from "../../theme/hoc/withTheme";
import { Platform } from "react-native";

const Title: FC<ITextProps> = withTheme({ name: "Title" })(({ children, ...props }) => (
  <Text {...props}>{children}</Text>
));

export const theme = {
  defaultProps: {
    color: "gdPrimary",
    size: "lg"
  },
  baseStyle: {
    fontFamily: "heading",
    fontWeight: "bold",
    lineHeight: Platform.select({ web: 27.6, android: 29 })
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
      lineHeight: Platform.select({ web: "125%" })
    }),
    "title-gdblue": () => ({
      color: "gdPrimary",
      fontWeight: 700,
      fontFamily: "heading",
      fontSize: "l",
      textAlign: "center",
      lineHeight: Platform.select({ web: 27.6, android: 30 }),
      margin: Platform.select({ android: "auto" })
    }),
    "title-gdred": () => ({
      color: "goodRed.100",
      fontWeight: 900,
      fontFamily: "heading",
      fontSize: "xl",
      textAlign: "center",
      lineHeight: Platform.select({ web: 27.6, android: 30 })
    })
  }
};

export default Title;
