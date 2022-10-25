import React from "react";
import { useThemeProps, useTheme, useColorMode } from "native-base";

export const withTheme = () => (Component: Function): Function => {
  const { name } = Component

  const Wrapped = function({ children, ...props }: any) {
    const themeProps = useThemeProps(name, props)

    return <Component {...themeProps}>{children}</Component>
  }

  Wrapped.displayName = `withTheme(${name})`
  return Wrapped
}
