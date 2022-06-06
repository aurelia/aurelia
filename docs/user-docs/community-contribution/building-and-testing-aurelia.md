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

In order to build Aurelia, ensure that you have [Git](https://git-scm.com/downloads), [Node.js](https://nodejs.org/) `v15.4.0` or higher, and `npm@7.0.0` or higher installed.

Run the following commands to clone, install:

```bash
git clone https://github.com/aurelia/aurelia.git && cd aurelia
npm ci
```

### packages

From the root level of the project, run `npm run dev` to start the development. This will:
* build & watch the `runtime` package for rebuild
* build & watch the `runtime-html` package for rebuild
* build & watch the `__testing__` package for rebuild
* start a process to run all the tests with `karma`

Example scenarios:

1. Fixing a repeater bug, so run all the repeater tests and rebuild repeater source code on change:
```
npm run dev -- --test repeater
```
2. Fixing a router bug, so run all the router tests and rebuild router source code on change:
```
npm run dev -- --dev router --test router
```

* The `--dev` (shortcut: `-d`) is to specify what additional package beside `runtime` & `runtime-html` packages should be rebuild on changes
* The `--test` (shortcut: `-t`) is to specify what glob to search test files to run

This documentation will be expanded upon in the future.

### packages-tooling

Similar to core packages, to develop/test any of the tooling packages, run `npm run dev:tooling` to start the development. This will

* build & watch the `kernel` core package for rebuild
* build & watch the `plugin-conventions` tooling package for rebuild
* start a process to run all the tests with `mocha`

Example scenarios:

1. Fixing a convention bug, so run all the plugin convention tests, and rebuild `plugin-conventions` tooling package on code change:
```
npm run dev -- --test plugin-conventions
# or
npm run dev -- --test conventions
```

2. Fixing a webpack loader bug, sp run all the load tests and rebuild webpack loader code on change
```
npm run dev -- --dev webpack-loader --test loader
```

