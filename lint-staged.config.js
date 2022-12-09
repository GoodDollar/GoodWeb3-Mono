const { ESLint } = require('eslint')

const eslint = new ESLint()

module.exports = {
  "packages/*/src/**/*.{js,jsx,ts,tsx}": files => {
    console.log(files)
    
    return [
      `eslint --no-ignore --max-warnings=0 --fix ${files
        .filter((file) => !eslint.isPathIgnored(file))
        .map((f) => `"${f}"`)
        .join(' ')}`,
    ]
  },
}
