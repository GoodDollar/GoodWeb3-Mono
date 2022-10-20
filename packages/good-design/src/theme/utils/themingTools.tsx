import { memoize } from 'lodash'

export const createColorModeValueTool = memoize(
  (colorMode: string) => <T, >(lightValue: T, darkValue: T) =>
  colorMode === "dark" ? darkValue : lightValue
);

export const withThemingTools = (styleFactory: Function) =>
  (baseTools: { colorMode: string; }) => {
    const { colorMode } = baseTools

    return styleFactory({
      ...baseTools,
      colorModeValue: createColorModeValueTool(colorMode)
    })
  }
