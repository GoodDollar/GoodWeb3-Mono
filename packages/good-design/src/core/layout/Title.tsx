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
    fontWeight: "1000"
  },
  baseStyle: {
    fontFamily: "heading",
  },
  sizes: {
    lg: {
      fontSize: "32px"
    }
  }
};

export default Title;
