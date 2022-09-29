const webpack = require('webpack');

module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [    
    "@storybook/addon-links",
    {
      name: '@storybook/addon-essentials',
      options: {
        docs: false,
      }
    },
    "@storybook/preset-scss",
    {
      name: '@storybook/addon-storysource',
      options: {
        loaderOptions: {
          injectStoryParameters: false,
        },
      },
    },
    "@storybook/addon-react-native-web"
  ],
  "framework": "@storybook/react",
  "core": {
    "builder": "webpack5"
   },
   features: {
    babelModeV7: true,
   },
   webpackFinal: async (config) => {
      // config.plugins = [
      //   new webpack.ProvidePlugin({
      //     Buffer: ['buffer', 'Buffer']
      //   }),
      //   new webpack.ProvidePlugin({
      //     process: 'process/browser'
      //   }),
      // ];
      config.resolve.fallback = {
        "stream": require.resolve('stream-browserify'),
        "https": require.resolve('https-browserify'),
        "crypto": require.resolve('crypto-browserify'),
        "process": require.resolve('process/browser'),
        "http": require.resolve('stream-http'),
        "https": require.resolve('https-browserify'),
        "assert": require.resolve('assert'),
        "buffer": require.resolve('buffer'),
        "os": require.resolve('os-browserify/browser'),
        "path": require.resolve('path-browserify')
      }
      return config
   },
}