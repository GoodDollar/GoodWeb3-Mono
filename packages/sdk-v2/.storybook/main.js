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

  ],
  "core": {
    "builder": "webpack5"
   },
  "webpackFinal": async config => {
        config.resolve.alias['react-native$'] = 'react-native-web';        
        return config
  }

}