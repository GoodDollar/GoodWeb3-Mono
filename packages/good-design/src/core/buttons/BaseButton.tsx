import type { IButtonProps } from "native-base";
import { Button, Text } from "native-base";
import React, { ReactNode } from "react";
import { withTheme } from "../../theme/hoc/withTheme";
import { withThemingTools } from "../../theme/utils/themingTools";

export interface BaseButtonProps extends IButtonProps {
  /**
   * a text to be rendered in the component.
   */
  text: string;
  onPress: () => void;
  children?: ReactNode;
}

export const theme = {
  defaultProps: {},
  baseStyle: withThemingTools(({ colorModeValue }: { colorModeValue: any }) => {
    return {
      bg: colorModeValue("lightBlue.50", "darkBlue.100"),
      _hover: {
        bg: colorModeValue("darkBlue.100", "lightBlue.50")
      },
      maxWidth: "750px",
      marginLeft: "100px"
    };
  })
};

function BaseButton({ text, onPress, children, ...props }: BaseButtonProps) {
  return (
    <Button onPress={onPress} {...props}>
      <Text fontFamily="normal" fontWeight="100" color={"teal.500"}>
        {text}
      </Text>
      {children}
    </Button>
  );
}

export default withTheme()(BaseButton);
