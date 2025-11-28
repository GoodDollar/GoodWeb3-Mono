# Repository Guidelines

GoodWeb3-Mono packages GoodDollar's web3 tooling in a Yarn 3 workspace. Keep changes scoped, reproducible, and compatible across the SDK, login, and design layers before merging.

## Project Structure & Module Organization
- `packages/sdk` and `packages/sdk-v2` expose the core TypeScript SDKs; `src/` holds modules, `dist/` and `types/` are generated.
- `packages/login-sdk` delivers authentication helpers; align API changes with the SDKs.
- `packages/good-design` is the component library with Storybook config under `.storybook/` and assets copied into `dist/assets`.
- Root `dev-release/` runs scripted releases, while `storybook-release/` and `dist/` host publishable artifacts. Avoid editing any generated output by hand.

## Build, Test, and Development Commands
- `yarn` installs workspace dependencies and runs package-level bootstraps.
- `yarn build` triggers `yarn workspaces foreach --topological-dev run build` to emit all package bundles.
- `yarn workspace @gooddollar/web3sdk build` (or analogous package names) rebuilds a single module; add `build:dev` when you need ctix-generated barrel files.
- `yarn lint` and `yarn lint:fix` enforce the shared ESLint + Prettier rules.
- `yarn storybook` serves the design system locally; `yarn workspace @gooddollar/good-design build-storybook` produces the static preview.

## Coding Style & Naming Conventions
Follow the root ESLint config and `.prettierrc` (double quotes, 120-char lines, 2-space indents, trailing commas disabled). Export barrels via `ctix`, and publish packages under the `@gooddollar/*` scope. Prefer explicit function and hook names that reflect protocol domains (e.g., `useClaimRewards`).

## Testing Guidelines
Use Jest via each workspace (`yarn workspace @gooddollar/web3sdk test`, `yarn workspace @gooddollar/good-design test`). Maintain deterministic mocks for blockchain calls and update Storybook stories alongside UI changes. Snapshot updates must include justification in the PR.

## Commit & Pull Request Guidelines
Commit messages follow conventional prefixes (`feat`, `fix`, `docs`, etc.) with concise scopes; release bumps mirror the package name in quotes (e.g., `"0.4.24" @gooddollar/good-design`). Every PR should link the related issue, describe contract or UI impacts, list test commands, and add screenshots or Storybook URLs for visual tweaks. Run `yarn lint` and the relevant package `build` before requesting review.

## Release & Distribution Notes
Local package consumers rely on `yalc publish --push`; remember to regenerate `dist/` and `types/` first. Use `yarn release:beta` for coordinated prereleases, and keep `ethers` version overrides aligned with the root `resolutions` entry.
