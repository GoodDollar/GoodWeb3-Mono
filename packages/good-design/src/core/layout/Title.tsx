import { Text } from "native-base";
import { ColorType } from "native-base/lib/typescript/components/types";
import React, { FC } from "react";
import { withTheme } from "../../theme/hoc/withTheme";

interface ITitleProps {
  color?: ColorType;
}

const Title: FC<ITitleProps> = withTheme()(({ children, color = "main", ...props }) => (
  <Text color={color} fontWeight="700" fontStyle="normal" fontSize="34px" lineHeight="40px" {...props}>
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
