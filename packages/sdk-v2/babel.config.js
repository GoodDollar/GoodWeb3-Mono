module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    "@babel/preset-react",
    "@babel/preset-typescript",
  ],
  "plugins": [
    ["module-resolver", {
      "alias": {
        "^react-native$": "react-native-web"
      }
    }]
  ]
};
