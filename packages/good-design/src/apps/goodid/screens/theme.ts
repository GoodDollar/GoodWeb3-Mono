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

const OffersAgreement = {
  baseStyle: {
    width: "100%",
    paddingX: 4,
    alignItems: "center",
    styles: {
      buttonContainer: {
        space: 4
      },
      image: {
        width: 150,
        height: 113
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
    paddingY: 4
  }
};

export { OffersAgreement, OnboardScreen, SegmentationConfirmation };
