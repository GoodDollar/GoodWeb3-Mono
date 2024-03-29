export const NewsFeedItem = {
  baseStyle: {
    display: "flex",
    borderRadius: 6,
    overflow: "hidden",
    shadow: 1,
    marginBottom: 4,
    paddingBottom: 1,
    borderLeftWidth: "10px",
    borderLeftColor: "main",
    containerStyles: {
      paddingTop: 2,
      paddingX: 2,
      width: "100%",
      alignItems: "flex-start"
    },
    titleStyles: {
      fontFamily: "subheading",
      fontSize: "sm",
      fontWeight: "600",
      lineHeight: "110%",
      color: "heading:alpha.80",
      paddingBottom: 2
    },
    contentStyles: {
      color: "goodGrey.400",
      fontFamily: "subheading",
      fontSize: "2xs",
      fontWeight: "400",
      lineHeight: "130%",
      paddingBottom: 2,
      maxWidth: 400
    },
    footerStyles: {
      gap: "40%",
      display: "flex",
      width: "100%",
      alignItems: "flex-end"
    },
    publishedStyles: {
      marginRight: "auto",
      fontSize: "4xs"
    }
  }
};
