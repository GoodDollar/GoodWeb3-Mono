module.exports = {
  "src/**/*.{ts,tsx,js,jsx}": [() => "tsc", "eslint --no-ignore --max-warnings=0 --fix"]
};
