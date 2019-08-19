[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![CircleCI](https://circleci.com/gh/aurelia/aurelia.svg?style=shield)](https://circleci.com/gh/aurelia/aurelia)
[![Test Coverage](https://api.codeclimate.com/v1/badges/5ac0e13689735698073a/test_coverage)](https://codeclimate.com/github/aurelia/aurelia/test_coverage)
[![npm](https://img.shields.io/npm/v/@aurelia/webpack-loader.svg?maxAge=3600)](https://www.npmjs.com/package/@aurelia/webpack-loader)
# @aurelia/webpack-loader

## Installing

For the latest stable version:

```bash
npm install --save @aurelia/webpack-loader
```

For our nightly builds:

```bash
npm install --save @aurelia/webpack-loader@dev
```

## Usage

In `webpack.config.js`:

```js
module: {
  rules: [
    // For apps in esnext with babel
    { test: /\.js$/i, use: ['babel-loader', '@aurelia/webpack-loader'], exclude: /node_modules/ },
    // For apps in TypeScript with ts-loader
    { test: /\.ts$/i, use: ['ts-loader', '@aurelia/webpack-loader'], exclude: /node_modules/ },
    // For apps don't want to use ShadowDOM
    { test: /\.html$/i, use: '@aurelia/webpack-loader', exclude: /node_modules/ }
    // For apps want to use ShadowDOM
    // available defaultShadowOptions are { mode: 'open' }, or { mode: 'closed' }, or null (default).
    { test: /\.html$/i, use: { loader: '@aurelia/webpack-loader', options: { defaultShadowOptions: { mode: 'open' } } }, exclude: /node_modules/ }
  ]
}
```

For apps in TypeScript, an extra typing definition is required for html module. You can add following file to your typing folder.

`html.d.ts`
```ts
declare module '*.html' {
  export const name: string;
  export const template: string;
  export default template;
  export const dependencies: string[];
  export const shadowOptions: { mode: 'open' | 'closed'};
  export function getHTMLOnlyElement();
}
```
