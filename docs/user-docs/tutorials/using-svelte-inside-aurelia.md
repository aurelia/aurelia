---
description: Libception. Learn how to use Svelte inside of your Aurelia applications.
---

# Using Svelte inside Aurelia

Aurelia's design embraces flexibility and interoperability, making it well-suited for integration with other libraries and frameworks. One common scenario is incorporating Svelte components into an Aurelia application. This integration showcases Aurelia's adaptability and how it can leverage the strengths of other ecosystems. Below, we provide a detailed guide and code examples to integrate a Svelte component seamlessly into an Aurelia 2 application.

## Install Dependencies

First, ensure that your Aurelia project has the necessary dependencies to use Svelte. You'll need the Svelte core library.

```bash
npm install svelte
```

Additionally, if you're using Webpack, install the `svelte-loader` to handle `.svelte` files:

```bash
npm install svelte-loader
```

## Configure Your Build System

To process `.svelte` files correctly, configure your Webpack setup.

**webpack.config.js:**

```javascript
const SveltePreprocess = require('svelte-preprocess');

module.exports = {
  // ... existing configuration ...
  module: {
    rules: [
      // ... existing rules ...
      {
        test: /\.svelte$/,
        use: {
          loader: 'svelte-loader',
          options: {
            preprocess: SveltePreprocess(),
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.mjs', '.js', '.svelte'],
    mainFields: ['svelte', 'browser', 'module', 'main'],
  },
};
```

This ensures Webpack properly processes `.svelte` files.

## Create a Svelte Component

For this example, let's create a simple Svelte component.

```svelte
<!-- src/components/MySvelteComponent.svelte -->
<script>
  export let name = 'World';
</script>

<style>
  div {
    color: blue;
  }
</style>

<div>Hello from Svelte, {name}!</div>
```

This component displays a greeting message and accepts a `name` prop.

## Create an Aurelia Wrapper Component

To integrate the Svelte component into Aurelia, create a wrapper Aurelia component that will render the Svelte component.

```typescript
// src/resources/elements/svelte-wrapper.ts
import { customElement, ICustomElementViewModel, INode } from 'aurelia';
import MySvelteComponent from '../../components/MySvelteComponent.svelte';

@customElement({ name: 'svelte-wrapper', template: '<template><div ref="container"></div></template>' })
export class SvelteWrapper implements ICustomElementViewModel {
  private container: HTMLElement;
  private svelteInstance: any;

  constructor(@INode private element: HTMLElement) {
    this.container = this.element.querySelector('div[ref="container"]')!;
  }

  attached() {
    this.svelteInstance = new MySvelteComponent({
      target: this.container,
      props: {
        name: 'Aurelia User',
      },
    });
  }

  detaching() {
    if (this.svelteInstance) {
      this.svelteInstance.$destroy();
    }
  }
}
```

This wrapper initializes and mounts the Svelte component when the Aurelia component is attached to the DOM.

## Register the Wrapper Component and Use It

Now, you must register the wrapper component with Aurelia and then use it in your application.

```typescript
// src/main.ts
import Aurelia from 'aurelia';
import { SvelteWrapper } from './resources/elements/svelte-wrapper';
import { MyApp } from './my-app';

Aurelia
  .register(SvelteWrapper)
  .app(MyApp)
  .start();
```

Then, use it in a view:

```html
<!-- src/my-view.html -->
<template>
  <svelte-wrapper></svelte-wrapper>
</template>
```

Following these steps, you can integrate Svelte components into your Aurelia 2 application. This process highlights the flexibility of Aurelia, allowing you to take advantage of Svelte's reactive capabilities while benefiting from Aurelia's powerful framework features.
