import React from "react";
import { useThemeProps } from "native-base";
import { pickBy, isArray } from "lodash";

export const withTheme =
  (options?: { name?: string; forceProps?: string[] }) =>
  <T,>(Component: React.ComponentType<T>) => {
    const { name: defaultName } = Component;
    const id = options?.name ?? defaultName;
    const forcedPropsKeys = options?.forceProps ?? [];

    if (!id) {
      throw new Error(
        "Theming can not be applied on anonymous function without " +
          "setting component name explicitly in the HoC options: " +
          'useTheme({ name: "MyComponent" })(props => <some jsx>)'
      );
    }

    const Wrapped: React.ComponentType<T> = ({ children, ...props }) => {
      // useThemeProps expects themed props,
      // and array props are considered ie. breakpoint values or colormode values,
      // so it only returns a single value from any arrayed prop
      // to prevent component specific props from losing its context,
      // we split the arrayed props based on a list of given keys
      const componentProps = pickBy(props, (value, key) => isArray(value) && forcedPropsKeys.includes(key));
      const themedProps = pickBy(props, (value, key) => !isArray(value) || !(key in componentProps));

      const themeProps = useThemeProps(id, themedProps);
      // @ts-ignore
      // prettier-ignore
      return <Component {...componentProps} {...themeProps}>{children}</Component>;
    };

    Wrapped.displayName = `withTheme(${id})`;
    return Wrapped;
  };
