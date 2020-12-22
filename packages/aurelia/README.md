[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![CircleCI](https://circleci.com/gh/aurelia/aurelia.svg?style=shield)](https://circleci.com/gh/aurelia/aurelia)
[![npm](https://img.shields.io/npm/v/aurelia.svg?maxAge=3600)](https://www.npmjs.com/package/aurelia)
# aurelia

This is the umbrella package for Aurelia 2. It re-exports selected internals from following Aurelia 2 packages:

```
@aurelia/fetch-client
@aurelia/jit
@aurelia/kernel
@aurelia/router
@aurelia/runtime
@aurelia/runtime-html
@aurelia/runtime-html-browser
```

It's designed to simplify app development, and we recommend all app authors to use this package. Ideally, unused Aurelia 2 features will be tree-shaken off by JavaScript bundlers.

Note plugin authors should instead use individual scoped `@aurelia/*` packages in order to avoid bringing in unnecessary dependencies.

## Installing

For the latest stable version:

```bash
npm i aurelia
```

For our nightly builds:

```bash
npm i aurelia@dev
```
