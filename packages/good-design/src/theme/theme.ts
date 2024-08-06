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
    txGreen: "#00C3AE",

    // UI
    buttonBackground: "#40C4FFCC",

    /* g$ design system */
    primary: "#00AFFF",
    primaryHoverDark: "#0075AC",
    // text
    goodGrey: {
      300: "#D4D4D4",
      400: "#7A88A5",
      500: "#737373",
      600: "#525252",
      650: "#5A5A5A",
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
      400: "#A5AEC0",
      500: "#26292F"
    },

    goodRed: {
      100: "#D03737",
      200: "#F87171"
    },

    goodGreen: {
      300: "#5BBAA3"
    },

    //tabs
    tabBlue: "#1F86FF",

    // borders
    borderBlue: "#00AEFF",
    borderGrey: "#E2E5EA",
    borderDarkGrey: "#707070"
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

  components: {
    ...layout,
    ...buttons,
    ...advanced,
    ...apps,
    ...animated,
    ...web3modals,
    ...nativebase,
    Text: {
      variants: {
        "browse-wrap": () => ({
          fontFamily: "subheading",
          fontSize: "2xs",
          color: "goodGrey.400",
          textAlign: "center"
        }),
        "sm-grey-400": () => ({
          fontFamily: "subheading",
          fontSize: "sm",
          fontWeight: 400,
          color: "goodGrey.400",
          lineHeight: 17.5
        }),
        "xs-green": () => ({
          fontFamily: "subheading",
          fontSize: "xs",
          fontWeight: 700,
          color: "goodGreen.300",
          lineHeight: "18.2"
        }),
        "xs-grey": () => ({
          fontFamily: "subheading",
          fontSize: "xs",
          fontWeight: 400,
          color: "goodGrey.600",
          lineHeight: 17.5
        }),
        "sm-grey": () => ({
          fontFamily: "subheading",
          fontSize: "sm",
          fontWeight: 400,
          color: "goodGrey.600",
          lineHeight: 20.8
        }),
        "sm-grey-650": () => ({
          fontFamily: "subheading",
          fontSize: "sm",
          fontWeight: 400,
          color: "goodGrey.650",
          lineHeight: 20.8
        }),
        "sm-grey-700": () => ({
          fontFamily: "subheading",
          fontSize: "sm",
          fontWeight: 400,
          color: "goodGrey.700",
          lineHeight: 20.8
        }),
        "md-grey-700": () => ({
          fontFamily: "heading",
          fontSize: "md",
          fontWeight: 700,
          color: "goodGrey.700",
          lineHeight: 23
        }),
        "l-grey-650": () => ({
          fontFamily: "subheading",
          fontSize: "l",
          fontWeight: 700,
          color: "goodGrey.650",
          lineHeight: 27.6
        }),
        "xl-grey-650": () => ({
          fontFamily: "subheading",
          fontSize: "xl",
          fontWeight: 700,
          color: "goodGrey.650",
          lineHeight: 33
        }),
        "tx-success": () => ({
          fontFamily: "heading",
          fontSize: "l",
          fontWeight: 700,
          color: "txGreen",
          lineHeight: 27.6
        })
      }
    },
    VStack: {
      variants: {
        "shadow-card": () => ({
          paddingY: 4,
          paddingX: 4,
          space: 4,
          width: 343,
          borderRadius: 15,
          bgColor: "greyCard",
          shadow: 1
        })
      }
    },
    Spinner: {
      variants: {
        "page-loader": () => ({
          borderWidth: "0",
          color: "primary",
          paddingBottom: 4
        })
      }
    }
  }
});

// extend the theme
export type MyThemeType = typeof theme;

declare module "native-base" {
  type ICustomTheme = MyThemeType;
}
