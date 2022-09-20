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
  // "webpackFinal": async config => {
  //       // console.log('config -->', {configUse: config.module.rules[0].use.options});
  //       // config.module.rules.push({
  //       //   test: /\.ts|\.tsx$/,
  //       //   use: {
  //       //       loader: 'babel-loader',
  //       //       options: {
  //       //         presets: ['@babel/preset-flow'],
  //       //       }
  //       //       // options: {
  //       //       //   allowTsInNodeModules: true
  //       //       // },
  //       //   },
  //       //   exclude: /node_modules/,
  //       // });
  //       // config.module.rules.push({
  //       //   test: /\.(js?$|jsx?)$/,
  //       //   exclude: /node_modules/,
  //       //   use: {
  //       //       loader: 'babel-loader',
  //       //       options: {
  //       //         // "rootMode": "upward",
  //       //         presets: [
  //       //           // 'module:metro-react-native-babel-preset',
  //       //           // '@babel/preset-typescript',
  //       //           // '@babel/preset-env',
  //       //           '@babel/preset-flow',
  //       //         ],
  //       //         plugins: [
  //       //           // '@babel/plugin-transform-modules-commonjs',
  //       //           // '@babel/plugin-transform-destructuring',
  //       //           // '@babel/plugin-proposal-export-default-from',
  //       //           // '@babel/plugin-proposal-export-namespace-from',
  //       //           // 'transform-class-properties',
  //       //           // '@babel/plugin-transform-classes',
  //       //           // '@babel/plugin-proposal-class-properties',
  //       //           // '@babel/plugin-transform-runtime',
  //       //           // '@babel/register'
  //       //         ]
  //       //       }
  //       //   },
  //       // });

  //       config.resolve.alias['react-native$'] = 'react-native-web';        
  //       return config
  // }

}