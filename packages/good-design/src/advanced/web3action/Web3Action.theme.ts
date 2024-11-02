export const StepIndicator = {
  baseStyle: {
    color: "gdPrimary",
    fontSize: "md"
  }
};

const interactionStyles = {
  backgroundColor: "primaryHoverDark",
  transition: "background 0.25s"
};

export const Web3ActionButton = {
  baseStyle: {
    backgroundColor: "goodGrey.400",
    innerText: {
      fontSize: "xl",
      fontWeight: "bold",
      color: "white"
    },
    innerIndicatorText: {
      color: "white",
      fontSize: "sm",
      fontWeight: "bold"
    }
  },
  variants: {
    round: () => ({
      shadow: 2,
      px: 2.5,
      borderRadius: 120,
      bg: "main",
      innerText: {
        variant: "shadowed",
        fontFamily: "body",
        fontSize: "l",
        width: 175,
        lineHeight: 26.4,
        textAlign: "center"
      }
    }),
    mobile: () => ({
      backgroundColor: "gdPrimary",
      width: "100%",
      maxWidth: "none",
      height: 75,
      textAlign: "center",
      justifyContent: "center",
      alignItems: "center",
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
      py: 17,
      pt: "20px",
      transition: "background 0.25s",
      _focus: interactionStyles,
      _hover: interactionStyles,
      innerText: {
        fontSize: "md",
        fontFamily: "subheading",
        lineHeight: 25
      }
    }),
    outlined: () => ({
      backgroundColor: "#fff",
      borderRadius: 15,
      borderWidth: 1,
      borderColor: "borderBlue",
      height: 43,
      padding: "12px 16px",
      _focus: interactionStyles,
      _hover: interactionStyles,
      innerText: {
        color: "gdPrimary",
        fontSize: "sm",
        fontFamily: "subheading",
        lineHeight: 19
      }
    })
  }
};
