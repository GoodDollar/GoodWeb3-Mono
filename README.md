# GoodDollar Mono-Repo.

The official GoodDollar library to open up core functionalities to be used in your own application

The mono-repo currently holds: 
- our SDK package

## Development

### Setup

We recommend using WSL (Windows Subsystem for Linux) for better compatibility with Yarn Workspaces and symlinks.
This avoids common permission issues and path inconsistencies on Windows.

To install WSL (with default Ubuntu):
```bash
wsl -install
```

To install dependencies and build the initial package(s)
```bash
yarn
```
It will install all dependencies necessary from all packages, and mostly hoist it to the root node_modules,<br/>
besides it looks for package.json files in the packages folder and run the build script.<br/>
To build single packages, run yarn in the root of that package.

### Add a new package
To add a new package
```bash
mkdir packages/<package-name>
cd packages/<package-name>
```

Add a package.json with the name prefixed @gooddollar/<package-name />
For default typescript configuration extend the root tsconfig.build.json


### Local Testing
For locally testing a package we suggest to install yalc
```bash
npm -i -g yalc
```

then publish your package (first-time)
```bash
yalc publish
```

to update to a published package
```bash
yalc publish --push
```

Link the package in your application
```bash
yalc link @gooddollar/<package-name>
```

We use Storybook to preview and test UI components in isolation.

To run Storybook locally:
```bash
yarn storybook
```

### Dependencies
For enforcing a specific version across all packages add the dependency to the root package.json, <br />
else add the dependency to specific package
