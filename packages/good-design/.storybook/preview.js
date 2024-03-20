import React from "react";
import "./workarounds";
import { theme } from "../src/theme/theme";
import { NativeBaseProvider } from "../src";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  }
};

export const decorators = [
  Story => (
    <NativeBaseProvider theme={theme}>
      <Story />
    </NativeBaseProvider>
  )
];
