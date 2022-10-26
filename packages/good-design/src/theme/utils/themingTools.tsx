export const withThemingTools = (styleFactory: Function) => (baseTools: { colorMode: string; }) => {
  const { colorMode } = baseTools
  const colorModeValue: <T, >(lightValue: T, darkValue: T) => T =
    colorMode === "dark"
      ? (_, darkValue) => darkValue
      : (lightValue, _) => lightValue;

  return styleFactory({ ...baseTools, colorModeValue })
}
