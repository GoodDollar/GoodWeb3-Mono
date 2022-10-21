import React, { ReactNode } from "react";
import { Button } from "native-base";
import type { IButtonProps } from "native-base";
import { withThemingTools } from "../../theme/utils/themingTools";
import { withTheme } from "../../theme";

export interface BaseButtonProps extends IButtonProps {
  /**
   * a text to be rendered in the component.
   */
  text: string | undefined;
  children?: ReactNode;
}

export const BaseButtonTheme = {
  defaultProps: {},
  baseStyle: withThemingTools(({ colorModeValue }: { colorModeValue: any }) => ({
    bg: colorModeValue("lightBlue.300", "darkBlue.400"),
    _hover: {
      bg: colorModeValue("lightBlue.500", "darkBlue.700")
    },
    maxWidth: "500px",
    flexDirection: "row"
  }))
};

//Todo: re-define to be a base button with properly defined defaults
export function BaseButton({ text, onPress, children }: BaseButtonProps) {
  return (
    <Button onPress={onPress}>
      {text}
      {children}
    </Button>
  );
}

const BaseButtonWithTheme = withTheme()(BaseButton);

export default BaseButtonWithTheme;
