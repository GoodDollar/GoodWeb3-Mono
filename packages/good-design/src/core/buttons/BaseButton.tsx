import React, { ReactNode } from "react";
import { Button } from "native-base";
import type { IButtonProps } from "native-base";
import { useThemeColor } from "../provider";

export interface BaseButtonProps extends IButtonProps {
  /**
   * a text to be rendered in the component.
   */
  text: string | undefined;
  children?: ReactNode;
}

//Todo: re-define to be a base button with properly defined defaults
export function BaseButton({ text, onPress, children }: BaseButtonProps) {
  const bgColor = useThemeColor("lightBlue", "darkBlue");
  const hoverColor = useThemeColor("lightBlueHover", "darkBlueHover");

  return (
    <Button
      flexDirection={"row"}
      maxWidth={"500px"}
      onPress={onPress}
      bg={bgColor}
      _hover={{
        bg: hoverColor
      }}
    >
      {text}
      {children}
    </Button>
  );
}
