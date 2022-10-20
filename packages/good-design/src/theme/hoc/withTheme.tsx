import React, { useMemo } from "react";
import { useThemeProps, useTheme, useColorMode } from "native-base";

import { createColorModeValueTool } from '../utils/themingTools'

export const withTheme = (stylesFactory?: Function) => (Component: Function): Function => {
  const { name } = Component

  const Wrapped = function({ children, ...props }: any) {
    const theme = useTheme()
    const { colorMode } = useColorMode()
    const newProps = useThemeProps(name, props)

    const styles = useMemo(() => {
      if (!stylesFactory) {
        return {};
      }

      const colorModeValue = createColorModeValueTool(colorMode as string)

      return stylesFactory({ theme, colorMode, colorModeValue, props: newProps })
    }, [theme, colorMode, newProps])

    return <Component {...newProps} styles={styles}>{children}</Component>
  }

  Wrapped.displayName = `withTheme(${name})`
  return Wrapped
}
