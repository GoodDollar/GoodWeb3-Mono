import { withThemingTools } from "../../theme/utils/themingTools";

export const ClaimButtonTheme = {
  defaultProps: {},
  baseStyle: withThemingTools(({ colorModeValue }: { colorModeValue: any }) => ({
    bg: colorModeValue("coolGray.50", "coolGray.900"),
    minHeight: "100vh",
    justifyContent: "center",
    px: 4
  }))
};

export const ClaimButtonStyles = () => ({
  containeralt: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#eee",
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "space-around",
    height: 300,
    margin: "auto",
    padding: 30,
    width: 600
  },
  btnsWrap: {
    justifyContent: "space-between",
    width: "100%",
    flexDirection: "row",
    marginTop: 20
  },
  wrapper: {
    width: "100%"
  },
  close: {
    position: "absolute",
    top: 12,
    right: 12,
    fontSize: 11,
    fontWeight: "bold",
    backgroundColor: "#fff"
  }
});
