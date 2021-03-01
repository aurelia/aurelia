[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![CircleCI](https://circleci.com/gh/aurelia/aurelia.svg?style=shield)](https://circleci.com/gh/aurelia/aurelia)
[![npm](https://img.shields.io/npm/v/@aurelia/ts-jest.svg?maxAge=3600)](https://www.npmjs.com/package/@aurelia/ts-jest)
# @aurelia/ts-jest

## Installing

For the latest stable version:

```bash
npm i -D @aurelia/ts-jest
```

For our nightly builds:

```bash
npm i -D @aurelia/ts-jest@dev
```

## Usage

In `jest.config.js` or `package.json`:

```js
"transform": {
  "\\.(js|html)$": "@aurelia/ts-jest"
}
```

Use ShadowDOM:

```js
"transform": {
  "\\.(js|html)$": ["@aurelia/ts-jest", { defaultShadowOptions: { mode: 'open' } }]
}
```

Use CSS Modules:

```js
"transform": {
  "\\.(js|html)$": ["@aurelia/ts-jest", { useCSSModule: true }]
}
```
