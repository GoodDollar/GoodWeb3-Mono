import React, { FC, PropsWithChildren } from "react";
import { useThemeProps } from "native-base";
import { pick, omit } from "lodash";
interface IWithThemeOpts {
  name?: string;
  skipProps?: string | string[];
}

export const withTheme =
  (options?: IWithThemeOpts) =>
  // @ts-ignore
  <T,>(Component: React.ComponentType<PropsWithChildren<T>>) => {
    const { name: defaultName } = Component;
    const { name, skipProps = [] } = options ?? {};
    const id = name ?? defaultName;

    if (!id) {
      throw new Error(
        "Theming can not be applied on anonymous function without " +
          "setting component name explicitly in the HoC options: " +
          'useTheme({ name: "MyComponent" })(props => <some jsx>)'
      );
    }

    const Wrapped: FC<T> = ({ children, ...props }: any) => {
      // useThemeProps expects themed props,
      // and array props are considered ie. breakpoint values or colormode values,
      // so it only returns a single value from any arrayed prop
      // to prevent component specific props from losing its context,
      // we split the arrayed props based on a list of given keys
      const componentProps = pick(props, skipProps);
      const themeProps = useThemeProps(id, omit(props, skipProps));

      // @ts-ignore
      // prettier-ignore
      return <Component {...componentProps} {...themeProps}>{children}</Component>;
    };

    Wrapped.displayName = `withTheme(${id})`;
    return Wrapped;
  };
