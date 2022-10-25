export const withThemingTools = (styleFactory: Function) => (baseTools: { colorMode: string; }) => {
  const { colorMode } = baseTools
  const colorModeValue = <T, >(lightValue: T, darkValue: T) =>
    colorMode === "dark" ? darkValue : lightValue

  return styleFactory({ ...baseTools, colorModeValue })
}
