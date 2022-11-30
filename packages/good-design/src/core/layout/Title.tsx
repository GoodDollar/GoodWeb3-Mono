import { Text } from "native-base";
import React, { ReactNode } from "react";
import { withTheme } from "../../theme/hoc/withTheme";

interface ITitleProps {
  children: ReactNode;
}

function Title({ children, ...props }: ITitleProps) {
  <Text color="heading" {...props}>
    {children}
  </Text>;
}

export const theme = {
  baseStyle: {
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.02
  }
};

const TitleThemed = withTheme()(Title);

export default TitleThemed;
