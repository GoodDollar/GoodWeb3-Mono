const OnboardScreen = {
  baseStyle: {
    width: 375,
    paddingX: 4,
    alignItems: "flex-start",
    maxWidth: "100%",
    innerContainer: {
      space: 8,
      width: "100%",
      alignItems: "flex-start"
    },
    fontStyles: {
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

const SegmentationConfirmation = {
  baseStyle: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingX: 6,
    paddingY: 4,
    width: 375
  }
};

export { OnboardScreen, SegmentationConfirmation };
