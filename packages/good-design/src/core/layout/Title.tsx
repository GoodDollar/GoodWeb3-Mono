import { Text } from "native-base";
import React, { ReactNode } from "react";
import { withTheme } from "../../theme/hoc/withTheme";

interface ITitleProps {
  children: ReactNode;
}

const Title = withTheme()(({ children, ...props }: ITitleProps) => (
  <Text color="heading" {...props}>
    {children}
  </Text>
));

export const theme = {
  baseStyle: {
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.02
  }
};

export default Title;
