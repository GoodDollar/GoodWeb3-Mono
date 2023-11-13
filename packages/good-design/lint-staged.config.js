module.exports = {
  "src/**/*.{ts,js,tsx,jsx}": ["eslint --no-ignore --fix --max-warnings=0", () => "tsc --noEmit"]
};
