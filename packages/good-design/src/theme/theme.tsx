import { extendTheme } from "native-base";

import * as layout from "../core/layout/theme";
import * as buttons from "../core/buttons/theme";

export const theme = extendTheme({
  config: {
    initialColorMode: "dark"
  },
  colors: {
    text1: "#0D182D",
    heading: "#42454A",
    gdBlueExample: {
      50: "#00b0ff",
      100: "#0387C3"
    }
  },
  fontConfig: {
    GDFontExample: {
      100: {
        cursive: "'Brush Script MT', cursive"
      }
    }
  },
  fonts: {
    buttonText: "GDFontExample" // to be used as ie. fontFamily={buttonText} weight={100} fontStyle="cursive"
  },
  components: {
    ...layout,
    ...buttons
  }
});

// extend the theme
export type MyThemeType = typeof theme;

declare module "native-base" {
  interface ICustomTheme extends MyThemeType {}
}
