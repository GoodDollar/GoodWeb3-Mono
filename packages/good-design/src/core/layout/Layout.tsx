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
    paddingVertical: 20,
    paddingHorizontal: 17,
    backgroundColor: "#fff",
    boxShadow: "3px 3px 10px -1px rgba(11, 27, 102, 0.304824)"
  }
};

export default withTheme()(Layout);
