import { extendTheme, useColorModeValue } from 'native-base'

const gooddollarTheme = {
  gooddollar: {
    lightBlue: '#00AFFF',
    lightBlueHover: '#009ae1',
    darkBlue: '#173566',
    darkBlueHover: '#3374dd'
  }
}

const getColorPath = (color: string): string => `gooddollar.${color}`

export const useThemeColor = (color: string, darkColor?: string) => {
  const _darkColor = darkColor ?? color;
  const [colorPath, darkColorPath] = [color, _darkColor].map(getColorPath);

  return useColorModeValue(colorPath, darkColorPath);
}

export const theme = extendTheme({
  colors: gooddollarTheme,
  config: {
    initialColorMode: 'dark'
  },
});
