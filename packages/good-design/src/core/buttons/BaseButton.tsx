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
      bg: colorModeValue("gdBlueExample.50", "gdBlueExample.100"),
      _hover: {
        bg: colorModeValue("gdBlueExample.100", "gdBlueExample.50")
      },
      maxWidth: "750px",
      marginLeft: "100px"
    };
  })
};

function BaseButton({ text, onPress, children, ...props }: BaseButtonProps) {
  return (
    <Button onPress={onPress} {...props}>
      <Text fontFamily="buttonText" fontWeight="100" fontStyle="cursive" color={"teal.500"}>
        {text}
      </Text>
      {children}
    </Button>
  );
}

export default withTheme()(BaseButton);
