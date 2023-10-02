const webpack = require("webpack");
const TEST_HTML_RULE = {
  test: /\.html$/,
  loader: "raw-loader"
};
module.exports = {
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: "react-docgen-typescript-plugin",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: prop => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true)
    }
  },
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    {
      name: "@storybook/addon-essentials",
      options: {
        docs: false
      }
    },
    "@storybook/preset-scss",
    {
      name: "@storybook/addon-storysource",
      options: {
        loaderOptions: {
          injectStoryParameters: false
        }
      }
    },
    "@storybook/addon-react-native-web"
  ],
  framework: "@storybook/react",
  core: {
    builder: "webpack5"
  },
  features: {
    babelModeV7: true
  },
  webpackFinal: async config => {
    // config.plugins = [
    //   new webpack.ProvidePlugin({
    //     Buffer: ['buffer', 'Buffer']
    //   }),
    //   new webpack.ProvidePlugin({
    //     process: 'process/browser'
    //   }),
    // ];
    config.module.rules = [...config.module.rules, TEST_HTML_RULE];
    config.rewrite;
    config.resolve.fallback = {
      stream: require.resolve("stream-browserify"),
      https: require.resolve("https-browserify"),
      crypto: require.resolve("crypto-browserify"),
      process: require.resolve("process/browser"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      assert: require.resolve("assert"),
      buffer: require.resolve("buffer"),
      os: require.resolve("os-browserify/browser"),
      path: require.resolve("path-browserify")
    };

    config.resolve.alias = {
      ...config.resolve.alias,
      "react-native-webview": "react-native-web-webview",
      "@usedapp/core": require.resolve("../../../node_modules/@usedapp/core")
    };
    return config;
  }
};
