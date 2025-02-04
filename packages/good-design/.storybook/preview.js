import React from "react";
import "./workarounds";
import { theme } from "../src/theme/theme";
import { NativeBaseProvider } from "../src";
import { GoodUIi18nProvider } from "../src/theme";

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
    <GoodUIi18nProvider>
      <NativeBaseProvider theme={theme} config={{ suppressColorAccessibilityWarning: true }}>
        <Story />
      </NativeBaseProvider>
    </GoodUIi18nProvider>
  )
];
