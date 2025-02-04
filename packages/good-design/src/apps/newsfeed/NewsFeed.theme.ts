export const NewsFeed = {
  baseStyle: {
    containerStyles: {
      marginLeft: "auto",
      marginRight: "auto"
    }
  },
  variants: {
    multiRow: () => ({
      styles: {
        item: {
          width: "100%",
          ml: "auto",
          mr: "auto",
          space: 4,
          display: "flex",
          justifyContent: "flex-start",
          flexWrap: "wrap"
        }
      }
    })
  }
};
