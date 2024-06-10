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

export { OffersAgreement, OnboardScreen, RedtentVideoInstructions, SegmentationConfirmation, SegmentationDispute };
