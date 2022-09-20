import React, { ReactNode } from 'react'

import {NativeBaseProvider, extendTheme} from 'native-base'

const gooddollarTheme = {
  gooddollar: {
    secondary: '#00AFFF',
    tertiary: '#173566'
  }
}

export const theme = extendTheme({ colors: gooddollarTheme});


const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

export type GooddollarThemeProviderProps = {
  children?: ReactNode; // should be app (or content?),
  theme?: any
};

export function GooddollarThemeProvider({ children, theme }: GooddollarThemeProviderProps) {
  return (
    <NativeBaseProvider theme={theme}  initialWindowMetrics={inset}>
      {children}
    </NativeBaseProvider>
  );
}