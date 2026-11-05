module.exports = {
  "src/**/*.{ts,js,tsx,jsx}": [
    "eslint --no-ignore --fix --max-warnings=0",
    () => "yarn workspace @gooddollar/web3sdk-v2 exec tsc --noEmit",
    () => "yarn workspace @gooddollar/web3sdk-v2 exec tsc -p tsconfig.tests.json"
  ]
};
