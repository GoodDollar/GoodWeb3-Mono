import React from 'react';
import { Button } from 'native-base';
import type { IButtonProps } from 'native-base';
import { useThemeColor } from '../provider';

export interface BaseButtonProps extends IButtonProps {
  /**
   * a text to be rendered in the component.
   */
  text: string
}


export function BaseButton({ text, onPress }: BaseButtonProps) {
  const bgColor = useThemeColor("lightBlue", "darkBlue");
  const hoverColor = useThemeColor("lightBlueHover", "darkBlueHover");

  return (
    <Button
      onPress={onPress}
      bg={bgColor}
      _hover={{
        bg: hoverColor
      }}
    >
      {text}
    </Button>
  );
}
