import { extendTheme } from "native-base";
import * as layout from "../core/layout/theme";
import * as buttons from "../core/buttons/theme";
import * as advanced from "../advanced/theme";
import { fontConfig, getPlatformFamilies } from "./fonts";

export const theme = extendTheme({
  fontConfig: getPlatformFamilies(fontConfig),
  colors: {
    // default colors
    grey: "#E5E5E5",
    greyCard: "#F6F8FA",
    lightGrey: "#636363",
    smokeWhite: "#F5F5F5",
    dimgray: "#696969",

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

    /* g$ design system */
    primary: '#00AFFF',
    // text
    goodGrey: {
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040'
    },
    // background
    goodWhite: {
      0: '#FFFFFF', // main
      100: '#F6F8FA' // secondary
    },
    // borders
    borderBlue: '#00AEFF',
    borderWhite: '#E2E5EA'
  },
  sizes: {
    "md": "200px",
  },
  fonts: {
    heading: "Montserrat",
    body: "Montserrat",
    mono: "Montserrat",
    subheading: "Roboto",
  },
  fontSizes: {
    '2x': 12,
    'xs': 14,
    'sm': 16,
    'md': 20,
    'l': 24,
    'xl': 30,
    '2xl': 36
  },
  components: {
    ...layout,
    ...buttons,
    ...advanced,
    Text: {
      baseStyle: {
        fontFamily: 'body',
        fontWeight: 'normal'
      }
    },
  }
});

// extend the theme
export type MyThemeType = typeof theme;

declare module "native-base" {
  type ICustomTheme = MyThemeType;
}
