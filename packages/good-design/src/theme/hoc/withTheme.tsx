import React, { useMemo } from "react";
import { useThemeProps, useTheme, useColorMode } from "native-base";

import { createColorModeValueTool } from "../utils/themingTools";
import { noop, wrap } from "lodash";

export const withTheme =
  (propsFactory?: Function) =>
  (Component: Function): Function => {
    const { name } = Component;
    const Wrapped = function ({ children, ...props }: any) {
      const theme = useTheme();
      const { colorMode } = useColorMode();
      const themeProps = useThemeProps(name, props);
      const newProps = useMemo(() => {
        const factoryFn = wrap(propsFactory || noop, (fn, opts) => fn(opts) || {});
        const colorModeValue = createColorModeValueTool(colorMode as string);
        const customProps = factoryFn({ theme, colorMode, colorModeValue, props: themeProps });
        return { ...themeProps, ...customProps };
      }, [theme, colorMode, themeProps]);
      return <Component {...newProps}>{children}</Component>;
    };
    Wrapped.displayName = `withTheme(${name})`;
    return Wrapped;
  };
