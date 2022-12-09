module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: {
    "browser": true,
    "node": true
  },
  extends: [
    'eslint:recommended', 
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
  ],
  plugins: [
    '@typescript-eslint', 
    'prettier'
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: [
      './tsconfig.json',
      './packages/*/tsconfig.json'
    ],
  },
  rules: {
    "no-undef": "error",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-this-alias": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/restrict-plus-operands": "off",
    "@typescript-eslint/no-this-alias": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/no-unnecessary-type-assertion": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-misused-promises": "off",
  },  
  ignorePatterns: [
    "/packages/*/dist/**/*.js",
    "/packages/*/types/**/*.d.ts",
    "/packages/*/src/types/**/*.d.ts",
    "/packages/*/src/stories/**/*.*",
    "/packages/*/src/**/*.test.[jt]s*",    
    "/packages/*/*.config.js",
    "/*.config.js",
  ],
};