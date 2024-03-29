import { extendTheme } from "native-base";
import * as layout from "../core/layout/theme";
import * as buttons from "../core/buttons/theme";
import * as animated from "../core/animated/theme";
import * as web3modals from "../core/web3/modals/theme";
import * as advanced from "../advanced/theme";
import * as nativebase from "./nativebase";
import * as apps from "../apps/theme";
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
    lightBlue: "#8499BB",

    // UI
    buttonBackground: "#40C4FFCC",

    /* g$ design system */
    primary: "#00AFFF",
    primaryHoverDark: "#0075AC",
    // text
    goodGrey: {
      300: "#D4D4D4",
      400: "#A3A3A3",
      500: "#737373",
      600: "#525252",
      700: "#404040"
    },
    // background
    goodWhite: {
      100: "#F6F8FA" // secondary
    },

    goodBlack: {
      100: "#505661",
      200: "#3F444E",
      300: "#2F3338",
      500: "#26292F"
    },

    //tabs
    tabBlue: "#1F86FF",

    // borders
    borderBlue: "#00AEFF",
    borderGrey: "#E2E5EA"
  },
  sizes: {
    "56": 56,
    md: "200px"
  },
  breakpoints: {
    // custom keys for breakpoints cannot be used in useBreakpoint hook so we override defaults
    base: 0,
    sm: 450,
    md: 610,
    lg: 1010,
    xl: 1280,
    "2xl": 1440
  },
  fonts: {
    heading: "Montserrat",
    body: "Montserrat",
    mono: "Montserrat",
    subheading: "Roboto"
  },
  fontSizes: {
    "4xs": 10,
    "2xs": 12,
    xs: 14,
    sm: 16,
    md: 20,
    l: 24,
    xl: 30,
    "2xl": 36
  },
  shadow: {
    //Bug: override shadow does not take effect. defining new one is not used
    "1": {
      shadowColor: "black",
      shadowOffset: {
        width: 0,
        height: 3
      },
      shadowOpacity: 0.4,
      shadowRadius: 0,
      elevation: 8
    }
  },

  components: {
    ...layout,
    ...buttons,
    ...advanced,
    ...apps,
    ...animated,
    ...web3modals,
    ...nativebase
  }
});

// extend the theme
export type MyThemeType = typeof theme;

declare module "native-base" {
  type ICustomTheme = MyThemeType;
}
