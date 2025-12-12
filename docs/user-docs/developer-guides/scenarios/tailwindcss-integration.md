---
description: Learn how to use TailwindCSS in Aurelia 2 with this detailed guide.
---

# TailwindCSS integration

## What is Tailwind CSS?

Tailwind CSS is a highly customizable, low-level CSS framework that gives you all of the building blocks you need to build bespoke designs without any annoying opinionated styles you have to fight to override.

For more information take a look at [Tailwind CSS](https://tailwindcss.com/)

## How to configure an Aurelia 2 project with Tailwind CSS v4?

Tailwind CSS 4.1 introduces a simplified setup: install Tailwind, add the official plugin for your bundler, then import `tailwindcss` once inside your stylesheet. No `@next` tags, no `tailwind.config.js` (unless you want customizations), and no manual content paths.

### Step 1: Create an Aurelia project

```bash
npx makes aurelia
```

Choose your preferred bundler. The steps below highlight Vite first, followed by Webpack, Parcel, and the standalone CLI.

### Step 2: Install Tailwind packages

#### Vite (recommended)

```bash
npm install tailwindcss @tailwindcss/vite
```

#### Webpack

```bash
npm install tailwindcss @tailwindcss/postcss postcss postcss-loader
```

#### Parcel

```bash
npm install tailwindcss @tailwindcss/postcss
```

#### Standalone CLI / static builds

```bash
npm install tailwindcss @tailwindcss/cli
```

### Step 3: Configure your bundler

#### Vite configuration

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import aurelia from '@aurelia/vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [aurelia(), tailwindcss()],
});
```

#### Webpack configuration

Create `postcss.config.js`:

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

Update `webpack.config.js` so `.css` files run through `postcss-loader`:

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
};
```

#### Parcel configuration

Parcel reads PostCSS config automatically. Create `.postcssrc`:

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

#### CLI workflow

If you aren’t using a bundler, wire up the CLI directly:

```bash
npx @tailwindcss/cli -i ./src/input.css -o ./dist/tailwind.css --watch
```

The CLI watches your HTML entry file and any imports it discovers, so the build remains tree-shaken even without a config file.

### Step 4: Import Tailwind once

Add this line to the top of your root stylesheet (for example `src/my-app.css`):

```css
@import "tailwindcss";
```

This single import injects Tailwind’s base, component, and utility layers. The old `@tailwind base;` / `@tailwind utilities;` directives aren’t used in v4.

### Step 5: Run the project

```bash
npm run dev
```

Tailwind’s compiler runs alongside your bundler, so editing Aurelia templates immediately updates the generated CSS.

---

## How to test Tailwind styles quickly

Insert the following snippet into any view:

```html
<div class="p-6">
  <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
    <strong class="font-bold">Holy smokes!</strong>
    <span class="block sm:inline">Something seriously bad happened.</span>
    <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
      <svg class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
    </span>
  </div>
</div>
```

Seeing the styled alert confirms that Tailwind’s classes are available in your bundle.

---

## Content detection & build optimization

Tailwind v4 automatically scans your project for class usage, removing unused styles during both dev and production builds. You no longer set `content: []` in `tailwind.config.js`. If you need to extend the theme or register plugins, create a config manually:

{% hint style="warning" %}
**Aurelia class bindings**: Tailwind’s scanner looks for class names in attribute values. If you put a Tailwind class only in an Aurelia `.class` attribute name (for example `width-[360px].class="condition"`), Tailwind may not detect it and it won’t be generated.

Prefer `class.bind` with the object form (quote keys for Tailwind classes):

```html
<div class.bind="{ 'width-[360px]': condition }"></div>
```
{% endhint %}

```ts
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        brand: '#8250df',
      },
    },
  },
  plugins: [],
};
```

During `npm run build`, Tailwind’s compiler and Lightning CSS minify the stylesheet and automatically add vendor prefixes.

---

## Migrating from Tailwind v3

1. Replace the old `@tailwind base/components/utilities` directives with `@import "tailwindcss";`
2. Uninstall `autoprefixer` and `postcss` unless another tool in your stack needs them—Tailwind v4 handles prefixing internally.
3. Remove manual `content` arrays unless you want to override the automatic detection.
4. Install the new plugin for your bundler (`@tailwindcss/vite`, `@tailwindcss/postcss`, or `@tailwindcss/cli`).

After migrating, you benefit from zero-config tree shaking, smaller CSS bundles, and much faster incremental builds.
