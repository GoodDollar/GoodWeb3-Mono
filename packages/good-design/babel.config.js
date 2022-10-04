module.exports = {
  "sourceType": "unambiguous",
  "presets": [
    "module:metro-react-native-babel-preset",
    "@babel/preset-flow",
    "@babel/preset-react",
    "@babel/preset-typescript",
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ]
}