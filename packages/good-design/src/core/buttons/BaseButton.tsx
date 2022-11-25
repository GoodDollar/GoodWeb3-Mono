import type { IButtonProps, ITextProps } from "native-base";
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
  innerText?: ITextProps;
  children?: ReactNode;
}

export const theme = {
  defaultProps: {},
  baseStyle: withThemingTools(({ colorModeValue }: { colorModeValue: any }) => {
    const colors = ["lightBlue.400", "lightBlue.700"];
    const [bg, bgHover] = colorModeValue(colors, [...colors].reverse());

    return {
      bg,
      _hover: {
        bg: bgHover
      },
      innerText: {
        fontFamily: "normal",
        fontWeight: "100",
        color: "white"
      }
    };
  })
};

function BaseButton({ text, innerText, onPress, children, ...props }: BaseButtonProps) {
  return (
    <Button onPress={onPress} maxWidth="750px" px={100} {...props}>
      <Text {...innerText}>{text}</Text>
      {children}
    </Button>
  );
}

export default withTheme()(BaseButton);
