import { extendTheme } from "native-base";

import { ClaimButtonTheme as ClaimButton } from "../core/buttons/ClaimButton.theme";
import { BaseButtonTheme as BaseButton } from "../core/buttons/BaseButton";

export const theme = extendTheme({
  config: {
    initialColorMode: "dark"
  },
  components: {
    ClaimButton,
    BaseButton
  }
});

// extend the theme
export type MyThemeType = typeof theme;

declare module "native-base" {
  interface ICustomTheme extends MyThemeType {}
}
