import { ITextProps, Text } from "native-base";
import React, { FC } from "react";
import { withTheme } from "../../theme/hoc/withTheme";

const Title: FC<ITextProps> = withTheme({ name: "Title" })(({ children, ...props }) => (
  <Text {...props}>{children}</Text> 
));

export const theme = {
  defaultProps: {
    color: "main",
    size: "lg",
  },
  baseStyle: {
    fontFamily: "heading",
    fontWeight: "700",
  },
  sizes: {
    lg: {
      fontSize: "32px"
    }
  }
};

export default Title;
