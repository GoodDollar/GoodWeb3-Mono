const { ESLint } = require('eslint')
const { opendirSync } = require('fs')
const { join } = require('path')

function loadTsOpts() {
  const dir = opendirSync(join(__dirname, 'packages'))
  const tsOpts = {}

  while (ent = dir.readSync()) {
    if (!ent.isDirectory()) {
      continue      
    }

    if ("sdk" === ent.name) {
      // no way to check sdk dure to the 'paths' option
      continue;
    }

    const package = ent.name
    const { compilerOptions } = require('./packages/' + package + '/tsconfig.json')
    const opts = []
    
    for (const key in compilerOptions) {
      const value = compilerOptions[key]

      if (["Dir", "Url"].some(suffix => key.endsWith(suffix)) || ["composite", "paths", "noEmit"].includes(key)) {
        continue
      }

      opts.push('--' + key)

      if ("typeRoots" === key) {
        opts.push(value.map(path => './' + join('packages', package, path)).join(','))
        continue
      }

      if (Array.isArray(value)) {
        opts.push(value.join(','))
        continue
      }

      if (false === value) {
        opts.push("false")
      }

      if (["string", "number"].includes(typeof value)) {
        opts.push(value)        
      }      
    }

    opts.push('--noEmit')
    tsOpts[package] = opts.join(' ')
  }

  dir.closeSync()
  return tsOpts
}

function prepareTscCommands(files) {
  const toCompile = {}

  for (const file of files) {
    const [, package] = packageRe.exec(file)

    if (!(package in tsOpts)) {
      continue
    }

    if (!(package in toCompile)) {
      toCompile[package] = []

      // workaround to fix "error TS2307: Cannot find module path/to/some.svg"
      if (package === "good-design") {
        toCompile[package].push("packages/good-design/src/custom.d.ts")
      }
    }

    toCompile[package].push(file)
  }

  return Object.keys(toCompile).map(package => {
    const files = toCompile[package]
    const opts = tsOpts[package]

    return `tsc ${opts} ${files.join(' ')}`
  })
}

const packageRe = /packages\/(.+?)\//i
const eslint = new ESLint()
const tsOpts = loadTsOpts()

module.exports = {
  "packages/*/src/**/*.{js,jsx,ts,tsx}": async files => {
    const ignored = await Promise.all(files.map(async file => eslint.isPathIgnored(file)))
    const filtered = files.filter((_, index) => !ignored[index]);
    const tscCommands = prepareTscCommands(files)

    return [
      `eslint --no-ignore --max-warnings=0 --fix ${filtered.map(path => `"${path}"`).join(' ')}`,
      ...tscCommands,
    ]
  },
}
