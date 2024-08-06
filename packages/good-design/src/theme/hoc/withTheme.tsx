import React, { FC, PropsWithChildren } from "react";
import { useThemeProps } from "native-base";
import { pick, omit } from "lodash";
interface IWithThemeOpts {
  name?: string;
  skipProps?: string | string[];
}

/**
 * HOC to apply themed props to a component (convert theme defintions to css style-properties)
 * @param options - options for the HOC
 * @param options.name - the name of the component - should match the key in the theme
 * @param options.skipProps - props to skip when applying the theme. Should be used for arrayed values, or <Component /> props
 * @param Component - the component to apply the theme to
 * @returns a themed component
 * @example
 */
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
