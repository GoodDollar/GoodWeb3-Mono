import React, { ReactNode } from "react";
import { Button, IButtonProps } from "native-base";
import { withTheme, withThemingTools } from "../../theme";

interface BaseButtonProps extends IButtonProps {
  /**
   * a text to be rendered in the component.
   */
  text: string | undefined;
  onPress: Function;
  children?: ReactNode;
}

// TODO: re-define to be a base button with properly defined defaults
const BaseButton = ({ text, onPress, children, ...props }: BaseButtonProps) => (
  <Button onPress={onPress} {...props}>
    {text}
    {children}
  </Button>
);

export const theme = {
  baseStyle: withThemingTools(({ colorModeValue }: any) => ({
    bg: colorModeValue("lightBlue.300", "darkBlue.400"),
    maxWidth: "500px",
    flexDirection: "row",
    _hover: {
      bg: colorModeValue("lightBlue.500", "darkBlue.700")
    },
  }))
};

export default withTheme()(BaseButton);
