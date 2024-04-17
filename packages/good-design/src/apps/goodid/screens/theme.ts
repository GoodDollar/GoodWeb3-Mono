const OnboardScreen = {
  baseStyle: {
    width: 375,
    paddingX: 4,
    alignItems: "center",
    maxWidth: "100%",
    innerContainer: {
      space: 8,
      maxWidth: "100%",
      alignItems: "center"
    },
    fontStyles: {
      title: {
        fontFamily: "heading",
        fontSize: "xl",
        color: "primary",
        textAlign: "center"
      },
      listLabel: {
        fontFamily: "subheading",
        fontSize: "sm",
        color: "goodGrey.600"
      },
      poweredBy: {
        underline: true,
        textAlign: "center",
        fontSize: "2xs"
      }
    }
  }
};

export { OnboardScreen };
