import { NativeBaseProvider } from 'native-base'
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
    <NativeBaseProvider>
      <Story />
    </NativeBaseProvider>
  )
]