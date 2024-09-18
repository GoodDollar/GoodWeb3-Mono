const OnboardScreen = {
  baseStyle: {
    width: "100%",
    paddingX: 4,
    alignItems: "center",
    maxWidth: "100%",
    innerContainer: {
      space: 8,
      width: 343,
      justifyContent: "center",
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
        fontSize: "2xs",
        fontFamily: "subheading",
        color: "goodGrey.600"
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
        space: 4,
        justifyContent: "center",
        alignItems: "center",
        width: 343
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

const SegmentationDispute = {
  baseStyle: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingX: 6,
    paddingY: 4,
    styles: {
      buttonContainer: {
        width: "343"
      }
    }
  }
};

const RedtentVideoInstructions = {
  baseStyle: {
    width: "343",
    marginLeft: "auto",
    marginRight: "auto"
  }
};

const GoodIdDetails = {
  baseStyle: {
    container: {
      width: "100%",
      space: 6,
      alignItems: "center",
      paddingLeft: 2
    },
    header: {
      width: "100%",
      space: 2
    },
    innerContainer: {
      space: 8,
      alignItems: "center",
      width: "100%"
    },
    section: {
      flexShrink: 1,
      backgroundColor: "greyCard",
      space: 2,
      justifyContent: "space-between",
      padding: "2"
    }
  }
};

export {
  GoodIdDetails,
  OffersAgreement,
  OnboardScreen,
  RedtentVideoInstructions,
  SegmentationConfirmation,
  SegmentationDispute
};
