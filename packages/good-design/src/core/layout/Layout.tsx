import { View } from "native-base";
import React, { ReactNode } from "react";
import { withTheme } from "../../theme/hoc/withTheme";

interface ILayoutProps {
  children: ReactNode;
}

function Layout({ children, ...props }: ILayoutProps) {
  <View width="100%" maxWidth={712} borderWidth={1} borderRadius={20} paddingY={20} paddingX={17} {...props}>
    {children}
  </View>;
}

export const theme = {
  baseStyle: {
    backgroundColor: "#fff",
    borderColor: "rgba(208, 217, 228, 0.483146)",
    boxShadow: "3px 3px 10px -1px rgba(11, 27, 102, 0.304824)"
  }
};

const LayoutThemed = withTheme()(Layout);

export default LayoutThemed;
