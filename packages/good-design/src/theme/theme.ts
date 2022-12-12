import { extendTheme } from "native-base";

import * as layout from "../core/layout/theme";
import * as buttons from "../core/buttons/theme";

export const theme = extendTheme({
  config: {},
  colors: {
    text1: "#0D182D",
    heading: "#42454A",
    main: "#00AEFF",
    buttonBackground: "#40C4FFCC"
  },
  fontConfig: {},
  fonts: {},
  components: {
    ...layout,
    ...buttons
  }
});

// extend the theme
export type MyThemeType = typeof theme;

declare module "native-base" {
  type ICustomTheme = MyThemeType
}
