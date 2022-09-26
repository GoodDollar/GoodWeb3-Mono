import React from 'react';
import { GooddollarThemeProvider, theme } from '../provider/ThemeProvider'
import { Button } from 'native-base';

export type BaseButtonProps = {
  /**
   * a text to be rendered in the component.
   */
  text: string
};


export function BaseButton({ text }: BaseButtonProps) {
  return (
    <GooddollarThemeProvider>
      <Button bg="gooddollar.secondary">{text}</Button>
    </GooddollarThemeProvider>
  );
}

// const styles = StyleSheet.create({
//   text: {},
// });

// bg={"gooddollar.secondary"}
