import React, { useEffect } from 'react';
// import { GooddollarThemeProvider } from '../provider/ThemeProvider'
import { Button, useColorMode, useColorModeValue } from 'native-base';
import type { IButtonProps } from 'native-base';

export interface BaseButtonProps extends IButtonProps {
  /**
   * a text to be rendered in the component.
   */
  text: string
};

export function BaseButton({ text, onPress }: BaseButtonProps) {
  // const colorScheme = useColorModeValue('gooddollar.lightBlue', 'gooddollar.darkBlue');
  // const variant = useColorModeValue('solid', 'outline');
  const { colorMode, toggleColorMode } = useColorMode()

  useEffect(() => {
    console.log('colorMode -->', {colorMode})
  }, [colorMode])
  
  return (
    // <GooddollarThemeProvider>
    <>
      <Button  
        width={'100px'}
        onPress={onPress}
        bg={useColorModeValue("gooddollar.lightBlue", "gooddollar.darkBlue")}
        _hover={{
          bg: useColorModeValue('gooddollar.lightBlueHover', 'gooddollar.darkBlueHover')
        }}
        // colorScheme={colorScheme}
        // _light={{bg: 'red.500'}}
        // _dark={{bg: 'white'}}
        // _dark={{bg: 'blue'}}
        // colorScheme={colorScheme}
        // variant={colorMode}
        // // onPress={toggleColorMode}
        // _light={{
        //     bg: 'gooddollar.lightBlue',
        //     color: 'red',
        //     _hover: {
        //       bg: 'gooddollar.lightBlueHover'
        //     }
        //   }}
        // _dark={{
        //   bg: 'gooddollar.darkBlue',
        //   color: 'white',
        //   _hover: {
        //     bg: 'gooddollar.darkBlueHover'
        //   }
        // }}
        >
          {text}
      </Button>
      {/* <Button width={"250px"} onPress={toggleColorMode}>
        Toggle color mode
      </Button> */}
    </>
    // </GooddollarThemeProvider>
  );
}
