module.exports = {
  "src/**/*.{ts,js,tsx,jsx}": [() => "tsc --noEmit", "eslint --no-ignore"]
};
