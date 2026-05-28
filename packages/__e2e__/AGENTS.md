# E2E Fixture Guidelines

## Scope
This subtree contains runnable application fixtures for Playwright coverage. The root `AGENTS.md` still applies; this file adds fixture-specific rules.

## Commands
- Work from the individual fixture directory, for example `cd packages/__e2e__/6-router`.
- Run the fixture's own `npm run test` or `npm run test:e2e` script unless the task names a narrower command.
- Most fixtures start a dev server and Playwright together through `concurrently` with an `APP_PORT` value from that fixture's `package.json`; do not invent ports.
- Use `npm run test:e2e:debugger` or `npm run test:debugger` only when an interactive Playwright debug run is actually needed.

## Editing Rules
- Keep fixture changes minimal and tied to the behavior under test.
- Do not normalize all fixtures to one bundler or server command. Some intentionally use Vite, some webpack, and some production-build paths.
- When adding a fixture, add it to the root workspace list and give it a unique `port`.
- If a test depends on browser behavior, capture the exact fixture, command, and failure mode in the hand-off.
