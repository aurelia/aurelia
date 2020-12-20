[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![CircleCI](https://circleci.com/gh/aurelia/aurelia.svg?style=shield)](https://circleci.com/gh/aurelia/aurelia)
[![npm](https://img.shields.io/npm/v/@aurelia/plugin-gulp.svg?maxAge=3600)](https://www.npmjs.com/package/@aurelia/plugin-gulp)
# @aurelia/plugin-gulp

## Installing

For the latest stable version:

```bash
npm i -D @aurelia/plugin-gulp
```

For our nightly builds:

```bash
npm i -D @aurelia/plugin-gulp@dev
```

## Usage

In gulp file:

```js
const au2 = require('@aurelia/plugin-gulp').default;

// For js or ts files
gulp.src('src/**/*.js')
  .pipe(au2()) // inject aurelia conventions
  .pipe(babel()); // demo js file with babel here

// For html files
// For apps want to use ShadowDOM or CSSModule
// available defaultShadowOptions are { mode: 'open' }, or { mode: 'closed' }, or null (default).
// by default, option useCSSModule is false. https://github.com/css-modules/css-modules
// Normally you would not use ShadowDOM and CSSModule together, but our tooling doesn't prevent you from doing that.
gulp.src('src/**/*.html')
  .pipe(au2({defaultShadowOptions: {mode: 'open'}, useCSSModule: false}));

// For apps don't want to use ShadowDOM or CSSModule
gulp.src('src/**/*.html')
  .pipe(au2());
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

TODO: add example of using other template syntax like markdown.
