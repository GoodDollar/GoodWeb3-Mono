import { extendTheme } from "native-base";

import * as layout from "../core/layout/theme";
import * as buttons from "../core/buttons/theme";

export const theme = extendTheme({
  colors: {
    // default colors
    grey: "#FFFFFF20",
    greyCard: "#F6F8FA",
    lightGrey: "#636363",
    smokeWhite: "#F5F5F5",

    // typo
    main: "#00AEFF",
    mainDark: "#151a30",
    mainDarkContrast: "#1a1f38",
    text: "#0D182D",
    paragraph: "#0005376",
    heading: "#42454A",
    headingBlack: "#303030",
    headingGrey: "#999",

    // UI
    buttonBackground: "#40C4FFCC",
  },
  sizes: {
    "md": "200px",
  },
  fonts: {
    heading: "Montserrat",
    body: "Montserrat",
    mono: "Montserrat",
  },
  fontConfig: {
    Montserrat: {
      100: {
        normal: "Montserrat-ExtraLight",
        italic: "Montserrat-ExtraLightItalic",
      },
      200: {
        normal: "Montserrat-ExtraLight",
        italic: "Montserrat-ExtraLightItalic",
      },
      300: {
        normal: "Montserrat-Light",
        italic: "Montserrat-LightItalic",
      },
      400: {
        normal: "Montserrat-Thin",
        italic: "Montserrat-ThinItalic",
      },
      500: {
        normal: "Montserrat-Regular",
        italic: "Montserrat-RegularItalic",
      },
      600: {
        normal: "Montserrat-Regular",
        italic: "Montserrat-RegularItalic",
      },
      700: {
        normal: 'Montserrat-Bold',
        italic: 'Montserrat-BoldItalic',
      },
    },
    Roboto: {
      100: {
        normal: 'Roboto-Light',
        italic: 'Roboto-LightItalic',
      },
      200: {
        normal: 'Roboto-Light',
        italic: 'Roboto-LightItalic',
      },
      300: {
        normal: 'Roboto-Light',
        italic: 'Roboto-LightItalic',
      },
      400: {
        normal: 'Roboto-Regular',
        italic: 'Roboto-Italic',
      },
      500: {
        normal: 'Roboto-Medium',
        italic: 'Roboto-MediumItalic',
      },
      600: {
        normal: 'Roboto-Medium',
        italic: 'Roboto-MediumItalic',
      },
      700: {
        normal: 'Roboto-Bold',
        italic: 'Roboto-BoldItalic',
      },
      800: {
        normal: 'Roboto-Bold',
        italic: 'Roboto-BoldItalic',
      },
      900: {
        normal: 'Roboto-Bold',
        italic: 'Roboto-BoldItalic',
      }
    }
  },
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
