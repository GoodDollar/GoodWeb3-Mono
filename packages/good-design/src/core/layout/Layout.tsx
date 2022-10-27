import { View } from "native-base";
import React, { ReactNode } from "react";
import { withTheme } from "../../theme/hoc/withTheme";

interface ILayoutProps {
  children: ReactNode;
}

const Layout = ({ children, ...props }: ILayoutProps) => <View {...props}>{children}</View>;

export const theme = {
  baseStyle: {
    maxWidth: 712,
    borderWidth: 1,
    borderColor: "rgba(208, 217, 228, 0.483146)",
    width: "100%",
    borderRadius: 20,
    padding: 17,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 12,
      height: 8,
    },
    shadowOpacity: 0.07,
    shadowRadius: 34,
  }
};

export default withTheme()(Layout);
