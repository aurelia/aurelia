[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![CircleCI](https://circleci.com/gh/aurelia/aurelia.svg?style=shield)](https://circleci.com/gh/aurelia/aurelia)
[![npm](https://img.shields.io/npm/v/@aurelia/vite-plugin.svg?maxAge=3600)](https://www.npmjs.com/package/@aurelia/vite-plugin)
# @aurelia/vite-plugin

## Installing

For the latest stable version:

```bash
npm i -D @aurelia/vite-plugin
```

## Usage

In `vite.config.js`:

```js
import { defineConfig } from 'vite';
import aurelia from '@aurelia/vite-plugin';

export default defineConfig({
  ...,
  plugins: [aurelia()],
});
```

## Vite compatibility

`@aurelia/vite-plugin` supports Vite 7 and Vite 8.

No additional configuration is needed for a typical Aurelia application. On Vite 8, the plugin automatically compiles standard decorators before Vite's built-in transform processes the module. This covers decorators written in application code, decorators added by Aurelia conventions, web workers, and SSR builds. Vite 7 keeps its existing behavior.

### TypeScript configuration

Projects using the built-in transform must use standard decorators. Do not enable `experimentalDecorators` or `emitDecoratorMetadata`, which select TypeScript's legacy decorator pipeline.

The plugin reads class-field and import behavior from the TypeScript project that owns each source file, including projects reached through TypeScript project references.

### Source files

By default, decorator transformation covers `src/**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}` relative to the Vite project root. This is separate from the plugin's convention `include` and `exclude` options. Most applications do not need to change it. If decorated source lives elsewhere, configure it explicitly:

```ts
aurelia({
  standardDecoratorInclude: [
    'app/**/*.{ts,tsx}',
    '../shared/src/**/*.{ts,tsx}',
  ],
  standardDecoratorExclude: '**/*.generated.ts',
})
```

### Custom compiler pipelines

Some custom Oxc settings can change class-field or import behavior after decorators have been compiled. To avoid subtle runtime differences, the plugin reports a configuration error when a decorated module is combined with disabled Oxc, custom Oxc filters, `oxc.typescript` or `oxc.decorator` transforms, or `oxc.assumptions.setPublicClassFields`.

If another compiler or AOT pipeline already removes decorators before Oxc, set `transformStandardDecorators: false`. The same opt-out is required when using `pre: false`.

TypeScript applications need a module declaration for imported HTML files. The Aurelia CLI generates this declaration by default. If your project does not have one, add the following `html.d.ts` file to your typings:

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

### Template assets

During production builds, the plugin processes static relative asset URLs in conventional HTML templates so Vite can emit and rewrite them:

```html
<template>
  <img src="logo.svg" alt="Logo">
  <img src="./logo.svg" alt="Logo">
  <img src="../shared/shared-logo.svg" alt="Shared logo">
  <img srcset="./logo.png 1x, ./logo@2x.png 2x" alt="Logo">
</template>
```

Relative URLs are resolved from the HTML template file, so same-directory paths, `./`, `../`, and nested relative paths are supported.
The supported elements and attributes match Vite's standard HTML asset sources, including images and source sets, audio, video, embedded content, links, and asset metadata.
The plugin hands each transformed URL to Vite, so the final URL follows Vite's `base`, `assetsDir`, asset file naming, hashing, and other plugin transformations.

Add `au-vite-ignore` to an element to leave its asset URLs unchanged. The marker is removed from the compiled template:

```html
<img au-vite-ignore src="./logo.svg" alt="Logo">
```

Use binding for dynamic URLs as usual:

```html
<img src.bind="logoUrl" alt="Logo">
```

Root-relative public paths such as `/logo.svg`, external URLs, data URLs, and hashes are left unchanged. Missing relative assets are also left unchanged and produce a build warning.

Only assets backed by files on disk are transformed for now. Virtual assets provided exclusively by Vite plugins are not supported; their URLs are left unchanged and reported as unresolved.

Set `transformTemplateAssets` to `false` to leave every template asset URL unchanged:

```ts
export default defineConfig({
  plugins: [aurelia({ transformTemplateAssets: false })],
});
```

### Development builds

By default, the Aurelia Vite plugin aliases Aurelia packages to their development builds when Vite runs in development mode. Set `useDev` explicitly when you need to override Vite's automatic mode detection:

```ts
import { defineConfig } from 'vite';
import aurelia from '@aurelia/vite-plugin';

export default defineConfig({
  ...,
  plugins: [aurelia({ useDev: true })], // always use dev bundles
});
```
