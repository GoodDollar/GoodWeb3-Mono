import { Button, IButtonProps } from "native-base";
import React from "react";
import { Platform } from "react-native";
import { StyleSheet } from "react-native";

import { withTheme } from "../../theme/hoc/withTheme";
import { withThemingTools } from "../../theme/utils/themingTools";

// styles overwrite due to conflicts with tailwind conflicting with native-base styles
const styles = StyleSheet.create({
  defaultButton: {
    backgroundColor: "#00AFFF",
    borderRadius: 120,
    textAlign: "center"
  },
  linkLikeButton: {
    backgroundColor: Platform.select({ web: "none" }),
    textAlign: "center",
    lineHeight: 20.8
  },
  defaultText: {
    color: "white",
    textTransform: "uppercase",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "Roboto"
  },
  outlinedText: {
    color: "#00AFFF",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "Roboto"
  },
  linkLikeText: {
    color: "#7A88A5",
    textDecorationLine: "underline",
    textTransform: "uppercase",
    fontFamily: "Roboto",
    fontSize: 16,
    fontWeight: "700"
  },
  defaultHover: {
    backgroundColor: "#00AFFF80"
  },
  linkLikeHover: {
    backgroundColor: "#7A88A520"
  }
});

const variantStyles = {
  default: {
    text: styles.defaultText,
    hover: styles.defaultHover,
    button: styles.defaultButton
  },
  "link-like": {
    text: styles.linkLikeText,
    hover: styles.linkLikeHover,
    button: styles.linkLikeButton
  },
  outlined: {
    text: styles.outlinedText,
    hover: styles.defaultHover,
    button: {}
  }
};

const GoodButton = withTheme({ name: "GoodButton" })(({ children, variant, isLoadingText, ...props }: IButtonProps) => {
  const currentStyles = variantStyles[variant as keyof typeof variantStyles] || variantStyles.default;

  return (
    <Button
      spinnerPlacement="start"
      isLoadingText={isLoadingText}
      {...props}
      _text={{ style: currentStyles.text }}
      _hover={{ style: currentStyles.hover }}
      _spinner={{
        color: ["link-like", "outlined"].includes(variant as keyof typeof variantStyles) ? "gdPrimary" : "white"
      }}
      style={currentStyles.button}
    >
      {children}
    </Button>
  );
});

export const theme = {
  baseStyle: withThemingTools(() => {
    return {
      _text: {
        color: "white",
        textTransform: "uppercase",
        fontWeight: "bold",
        fontSize: "sm",
        fontFamily: "subheading"
      },
      _hover: {
        backgroundColor: "gdPrimary:alpha.80"
      },
      borderRadius: 24,
      textAlign: "center"
    };
  }),
  variants: {
    "link-like": () => ({
      _text: {
        color: "goodGrey.400",
        underline: true,
        textTransform: "uppercase",
        fontFamily: "subheading",
        fontSize: "sm",
        fontWeight: "700"
      },
      _hover: {
        backgroundColor: "goodGrey.400:alpha.20"
      },
      backgroundColor: Platform.select({
        web: "none"
      }),
      paddingY: 0,
      paddingX: 8,
      textAlign: "center",
      lineHeight: 20.8
    }),
    outlined: () => ({})
  }
};

export default GoodButton;
