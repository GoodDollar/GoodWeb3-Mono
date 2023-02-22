import React from "react";
import { useThemeProps } from "native-base";
import { pickBy, startsWith } from "lodash";

export const withTheme =
  (options?: { name?: string }) =>
  <T,>(Component: React.ComponentType<T>) => {
    const { name: defaultName } = Component;
    const id = options?.name ?? defaultName;

    if (!id) {
      throw new Error(
        "Theming can not be applied on anonymous function without " +
          "setting component name explicitly in the HoC options: " +
          'useTheme({ name: "MyComponent" })(props => <some jsx>)'
      );
    }

    const Wrapped: React.ComponentType<T> = ({ children, ...props }) => {
      // useThemeProps expects themed props,
      // and array props are considered ?breakpoint values? or ?darkMode? values,
      // so it only returns a single value from any arrayed prop
      // to prevent component specific props from losing its context,
      // we split the props based on ntp_ prefix (ntp = no_theme_prop)
      const themedProps = pickBy(props, (value, key) => !startsWith(key, "ntp_"));
      const componentProps = pickBy(props, (value, key) => startsWith(key, "ntp_"));

      const themeProps = useThemeProps(id, themedProps);
      // @ts-ignore
      // prettier-ignore
      return <Component {...componentProps} {...themeProps}>{children}</Component>;
    };

    Wrapped.displayName = `withTheme(${id})`;
    return Wrapped;
  };
