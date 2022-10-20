import { extendTheme } from 'native-base'

import { theme as ClaimButton } from '../core/buttons/ClaimButton.theme';

export const theme = extendTheme({
  config: {
    initialColorMode: "dark",
  },
  components: {
    ClaimButton,
  }
});

// extend the theme
export type MyThemeType = typeof theme;

declare module "native-base" {
  interface ICustomTheme extends MyThemeType {}
}
