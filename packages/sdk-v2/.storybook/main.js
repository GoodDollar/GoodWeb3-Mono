const webpack = require("webpack");
module.exports = {
  typescript: {
    reactDocgen: "react-docgen-typescript-plugin"
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
    }
  ],
  core: {
    builder: "webpack5"
  },
  webpackFinal: async config => {
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
        process: "process/browser"
      })
    );

    config.resolve.alias["react-native$"] = "react-native-web";
    config.resolve.fallback = {
      ...config.resolve.fallback,
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer")
    };
    return config;
  }
};
