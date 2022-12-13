import { extendTheme } from "native-base";

import * as layout from "../core/layout/theme";
import * as buttons from "../core/buttons/theme";

export const theme = extendTheme({
  config: {},
  colors: {
    // text
    text1: "#0D182D",
    paragraph: "#0005376",
    heading: "#42454A",
    "heading-black": "#303030",
    "heading-grey": "999",
    //default colors
    main: "#00AEFF",
    buttonBackground: "#40C4FFCC",
    // cards
    "grey-card": "#F6F8FA",
    "grey-section": "#F5F5F5"
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
  type ICustomTheme = MyThemeType;
}
