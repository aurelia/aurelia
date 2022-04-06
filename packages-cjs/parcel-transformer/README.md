[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![CircleCI](https://circleci.com/gh/aurelia/aurelia.svg?style=shield)](https://circleci.com/gh/aurelia/aurelia)
[![npm](https://img.shields.io/npm/v/@aurelia/parcel-transformer.svg?maxAge=3600)](https://www.npmjs.com/package/@aurelia/parcel-transformer)
# @aurelia/parcel-transformer

Parcel2's Aurelia2 transformer for js/ts/html assets.

## Installing

For the latest stable version:

```bash
npm i -D @aurelia/parcel-transformer
```

For our nightly builds:

```bash
npm i -D @aurelia/parcel-transformer@dev
```

## Usage

In `.parcelrc`:

```js
{
  "extends": "@parcel/config-default",
  "transformers": {
    "*.js": ["@aurelia/parcel-transformer", "..."], // Or "*.ts" for TypeScript project
    "*.html": ["@aurelia/parcel-transformer", "..."]
  }
}
```

Optionally, add config into your project's `package.json`:
```js
{
  "aurelia": {
    "defaultShadowOptions": { "mode": "open" },
    "useCSSModule": false
  }
}
```

For apps in TypeScript, an extra typing definition is required for html module. You can add following file to your typing folder.

`html.d.ts`
```ts
declare module '*.html' {
  import { IContainer } from '@aurelia/kernel';
  import { BindableDefinition } from '@aurelia/runtime';
  export const name: string;
  export const template: string;
  export default template;
  export const dependencies: string[];
  export const containerless: boolean | undefined;
  export const bindables: Record<string, BindableDefinition>;
  export const shadowOptions: { mode: 'open' | 'closed'} | undefined;
  export function register(container: IContainer);
}
```
