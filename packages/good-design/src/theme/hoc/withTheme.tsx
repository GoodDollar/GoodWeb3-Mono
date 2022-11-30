import React from "react";
import { useThemeProps } from "native-base";

export const withTheme =
  () =>
  (Component: Function): Function => {
    const { name } = Component;
    if (!name) throw new Error("Theming can not be applied on anonymous function");

    const Wrapped = function ({ children, ...props }: JSX.Element & { children: any }) {
      const themeProps = useThemeProps(name, props);

      return <Component {...themeProps}>{children}</Component>;
    };

    Wrapped.displayName = `withTheme(${name})`;
    return Wrapped;
  };
