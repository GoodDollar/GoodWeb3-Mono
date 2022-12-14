import { ITextProps, Text } from "native-base";
import React, { FC } from "react";
import { withTheme } from "../../theme/hoc/withTheme";

const Title: FC<ITextProps> = withTheme({ name: "Title" })(({ children, ...props }) => (
  <Text {...props}>{children}</Text>
));

export const theme = {
  defaultProps: {
    color: "main"
  },
  baseStyle: {
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: "4xl",
    lineHeight: "xs",
    letterSpacing: "sm"
  }
};

export default Title;
