import React, { ReactNode } from 'react'

import {NativeBaseProvider, extendTheme} from 'native-base'

const gooddollarTheme = {
  gooddollar: {
    lightBlue: '#00AFFF',
    lightBlueHover: '#009ae1',
    darkBlue: '#173566',
    darkBlueHover: '#3374dd'
  }
}

export const theme = extendTheme({ 
  colors: gooddollarTheme,
  // components: {
  //   Button: {
  //     // baseStyle: (props: any) => {
  //     //   return {
  //     //     _light: {bg: 'blue.500'},
  //     //     _dark: {bgColor: 'red.500'}
  //     //   };
  //     // },
  //   },
  // },
  config: {
    initialColorMode: 'dark'
  },
});

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

// export type GooddollarThemeProviderProps = {
//   children?: ReactNode; // should be app (or content?),
//   theme?: any
// };

// export function GooddollarThemeProvider({ children, theme = gooddollarTheme }: GooddollarThemeProviderProps) {
//   return (
//     <NativeBaseProvider theme={theme}  initialWindowMetrics={inset}>
//       {children}
//     </NativeBaseProvider>
//   );
// }