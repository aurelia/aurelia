[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![CircleCI](https://circleci.com/gh/aurelia/aurelia.svg?style=shield)](https://circleci.com/gh/aurelia/aurelia)
[![Test Coverage](https://api.codeclimate.com/v1/badges/5ac0e13689735698073a/test_coverage)](https://codeclimate.com/github/aurelia/aurelia/test_coverage)
[![npm](https://img.shields.io/npm/v/aurelia.svg?maxAge=3600)](https://www.npmjs.com/package/aurelia)
# aurelia

This is the umbrella package for Aurelia 2. It re-exports selected internals from following Aurelia 2 packages:

```
@aurelia/debug
@aurelia/fetch-client
@aurelia/jit
@aurelia/jit-html
@aurelia/jit-html-browser
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
npm install --save-dev aurelia
```

For our nightly builds:

```bash
npm install --save-dev aurelia@dev
```
