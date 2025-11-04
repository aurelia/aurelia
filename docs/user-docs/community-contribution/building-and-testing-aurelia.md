---
description: Get setup to build and test the Aurelia 2 source!
---

# Building and testing aurelia

If you're looking to contribute directly to Aurelia or its test suite, you've come to the right place!

{% hint style="success" %}
**Here's what you'll learn...**

* Setting up your machine and cloning the Aurelia repository.
* Building the entire Aurelia 2 monorepo.
* Running tests in the browser and Node.js.
{% endhint %}

## Setup

In order to build Aurelia, ensure that you have [Git](https://git-scm.com/downloads), [Node.js](https://nodejs.org/) `22.12.0`, and `npm@10.9.0` installed (these versions match the repository's Volta configuration).

Run the following commands to clone, install:

```bash
git clone https://github.com/aurelia/aurelia.git && cd aurelia
npm ci
```

### packages

Run `npm run dev` **with at least one `--test` or `--e2e` flag**. The harness exits immediately if neither flag is provided, so your very first command should usually look like one of these:

```bash
# run everything
npm run dev -- --test *

# focus on router specs only
npm run dev -- --test router

# watch router specs and a router e2e scenario together
npm run dev -- --test router --e2e 6-router
```

When the command succeeds it will:

* build & watch the `runtime`, `runtime-html`, and `template-compiler` packages
* build & watch `packages/__tests__` so that Karma/Mocha reruns the matching specs
* optionally spin up extra package/tooling/app/e2e watchers based on the flags you pass

| Flag | What it controls | Accepted values (validated in `scripts/dev.ts`) | Example |
| ---- | ---------------- | ---------------------------------------------- | ------- |
| `--test`, `-t` | Glob passed to the Karma/Mocha harness | Any glob, or `*` for everything | `--test repeater integration` |
| `--e2e`, `-e` | Starts Playwright watch mode inside selected fixtures | `1-gh-issues`, `2-hmr-vite`, `3-hmr-webpack`, `4-i18n`, `5-router-direct`, `6-router`, `7-select-safari16`, `8-ui-virtualization` | `--e2e 4-i18n --e2e 7-select-safari16` |
| `--dev`, `-d` | Adds more framework packages to the watch list | Any package from `metadata`, `platform`, `router`, `state`, etc. | `--dev router --dev validation` |
| `--tooling`, `-l` | Runs tooling packages alongside the core harness | `plugin-conventions`, `plugin-gulp`, `ts-jest`, `babel-jest`, `parcel-transformer`, `vite-plugin`, `webpack-loader`, `http-server`, `au` | `--tooling vite-plugin` |
| `--app`, `-a` | Launches sample apps for manual QA | `ui-virtualization`, `router-animation`, `router-hooks` | `--app router-hooks` |

> 💡 Tip: stack the flags. For example, `npm run dev -- --test state --dev state --e2e 8-ui-virtualization` keeps the state package, its specs, and the virtualization e2e harness in sync.

### packages-tooling

Tooling development follows the same pattern: `npm run dev:tooling -- --test <pattern>`. Passing a test pattern is mandatory—the script aborts otherwise—so start with:

```bash
npm run dev:tooling -- --test *
```

Key behaviors:

* `kernel` and `packages-tooling/plugin-conventions` are always built and watched.
* Additional tooling packages can be added via `--dev <name>` where `<name>` is one of `plugin-conventions`, `plugin-gulp`, `ts-jest`, `babel-jest`, `parcel-transformer`, or `webpack-loader`.
* The harness recompiles the relevant tooling dist files and streams focused Mocha output from `packages-tooling/__tests__`.

### Targeted unit-test commands

Every spec lives under `packages/__tests__`, and that workspace exposes fine-grained npm scripts so you can validate exactly what changed. Run these from the repo root:

| Scenario | Command | Notes |
| --- | --- | --- |
| Default Chrome CI run | `npm run test` | Root script that shells into `packages/__tests__` and executes `test-chrome`. |
| Watch Chrome specs locally | `npm run test:watch` | Keeps Karma + ChromeHeadlessOpt running via `test-chrome:watch`. |
| Node-only suite | `cd packages/__tests__ && npm run test-node` | Mocha over every compiled spec in Node. |
| Package-specific Node suites | `cd packages/__tests__ && npm run test-node:router` (or `:state`, `:validation`, `:runtime`, etc.) | Uses the filtered commands defined in `package.json`. |
| Browser cross-checks | `cd packages/__tests__ && npm run test-firefox` / `npm run test-safari` | Useful before shipping fixes that depend on browser quirks. |
| Debugging UI hangs | `npm run test:debugger` | Wraps `test-chrome:debugger`, which launches the Chrome debugging profile. |

Refer to `packages/__tests__/package.json` for the full list (`test-node:runtime-html`, `test-node:i18n`, `test-node:store-v1`, and more).

### End-to-end fixtures

The monorepo ships dedicated Playwright fixtures under `packages/__e2e__` for scenarios that are hard to cover with unit tests (router regressions, virtualization performance, HMR, etc.). You can work with them in two ways:

1. **Via the dev harness** – pass `--e2e <name>` to `npm run dev` (see table above) to keep a fixture’s `npm run test:watch` process running next to your unit tests.
2. **Directly inside the fixture** – `cd packages/__e2e__/6-router && npm run test:e2e` (or `test:e2e:watch`, `test:e2e:debugger`) to reproduce Playwright failures in isolation. Each fixture exposes its own port via `package.json` so multiple apps can run concurrently.

Available workspaces (see the `package.json` workspaces array) include:

* `packages/__e2e__/1-gh-issues` – reproductions for GitHub-reported bugs
* `packages/__e2e__/2-hmr-vite` / `3-hmr-webpack` – hot-module-reload stress tests
* `packages/__e2e__/4-i18n` / `5-router-direct` / `6-router` – routing + localization coverage
* `packages/__e2e__/7-select-safari16` / `8-ui-virtualization` – UI quirks and virtualization perf
* `packages/__e2e__/9-vite-wo-convention` through `13-hmr-convention-routing-memory-leak` – advanced fixtures for build and memory-leak investigations

Pick the fixture whose directory name matches the feature you touched, then either wire it into `npm run dev -- --e2e ...` or run its `npm run test:e2e` scripts directly.
