import { extendTheme } from "native-base";

import * as layout from "../core/layout/theme";
import * as buttons from "../core/buttons/theme";
import * as modals from "../core/modals/theme";

export const theme = extendTheme({
  config: {
    initialColorMode: "dark"
  },
  colors: {
    text1: "#0D182D",
    heading: "#42454A"
  },
  fontConfig: {},
  fonts: {},
  components: {
    ...layout,
    ...buttons,
    ...modals
  }
});

// extend the theme
export type MyThemeType = typeof theme;

declare module "native-base" {
  interface ICustomTheme extends MyThemeType {}
}
