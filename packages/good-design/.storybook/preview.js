import './workarounds'
import React from 'react'
import { NativeBaseProvider } from 'native-base'
import { theme } from '../src/core/provider'

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

export const decorators = [
  Story => (
    <NativeBaseProvider theme={theme}>
      <Story />
    </NativeBaseProvider>
  )
]