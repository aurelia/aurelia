# Tooling Package Guidelines

## Scope
This subtree contains build and integration tooling packages such as the conventions plugin, bundler loaders, and Jest adapters. The root `AGENTS.md` still applies; this file adds tooling-specific rules.

## Commands
- For a single tooling package, run `npm run build` and `npm run lint` from that package directory when those scripts are present.
- For shared tooling tests, run `npm run build` from `packages-tooling/__tests__`, then a targeted suite such as `npm run test-node:plugin-conventions`, `npm run test-node:webpack-loader`, `npm run test-node:vite-plugin`, `npm run test-node:babel-jest`, `npm run test-node:ts-jest`, or `npm run test-node:parcel-transformer`.
- Use root `npm run dev:tooling` when you need the repository's tooling development helper.

## Editing Rules
- Keep package `exports`, `main`, `module`, and `types` fields aligned with generated `dist` outputs.
- Do not change bundler-facing behavior without adding or updating coverage in `packages-tooling/__tests__` when practical.
- Be careful with parser, template, and module-format changes. These packages are integration surfaces for downstream build tools.
- Preserve existing package boundaries; do not move reusable tooling code into runtime packages unless the change explicitly requires it.
