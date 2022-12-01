import React from "react";
import { useThemeProps } from "native-base";

export const withTheme =
  () =>
  <T,>(Component: React.ComponentType<T>) => {
    const { name } = Component;

    const Wrapped: React.ComponentType<T> = ({ children, ...props }) => {
      const themeProps = useThemeProps(name, props);

      // @ts-ignore
      return <Component {...themeProps}>{children}</Component>;
    };

    Wrapped.displayName = `withTheme(${name})`;
    return Wrapped;
  };
