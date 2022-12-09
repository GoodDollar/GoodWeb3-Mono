const { ESLint } = require('eslint')

const eslint = new ESLint()

module.exports = {
  "packages/*/src/**/*.{js,jsx,ts,tsx}": async files => {
    const ignored = await Promise.all(files.map(async file => eslint.isPathIgnored(file)))

    return [
      `eslint --no-ignore --max-warnings=0 --fix ${files
        .filter((_, index) => !ignored[index])
        .map(path => `"${path}"`)
        .join(' ')}`,
    ]
  },
}
