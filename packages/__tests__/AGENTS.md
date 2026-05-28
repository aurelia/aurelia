# Unit Test Package Guidelines

## Scope
This subtree contains the compiled test workspace for core packages. The root `AGENTS.md` still applies; this file adds test-package specifics.

## Commands
- After changing tests in this package, run `npm run build` from `packages/__tests__` before running any targeted suite.
- Use targeted Node suites when possible, such as `npm run test-node:kernel`, `npm run test-node:runtime`, `npm run test-node:runtime-html`, `npm run test-node:router`, `npm run test-node:state`, or `npm run test-node:validation`.
- Use `npm run test-chrome` for browser coverage and the root `npm run test` when the change needs the standard full Karma pass.
- If a suite reports missing exports or stale generated JavaScript after TypeScript or template changes, remove `packages/__tests__/dist` before rebuilding.

## Editing Rules
- Keep specs close to the feature or package behavior under test.
- Do not run targeted suites against stale `dist` output.
- Preserve the existing Jasmine/Mocha-style `describe` and `it` naming patterns.
- Prefer focused assertions over broad snapshots or overly mocked tests.
