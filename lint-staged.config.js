module.exports = {
  "src/**/*.{ts,tsx}": () => "tsc --noEmit",
  "src/**/*.{js,jsx,ts,tsx}": ["eslint --no-ignore --max-warnings=0 --fix"]
};
