---
description: Libception. Learn how to use Vue inside of your Aurelia applications.
---

# Using Vue inside Aurelia

Aurelia's design embraces flexibility and interoperability, making it well-suited for integration with other libraries and frameworks. One common scenario is incorporating Vue components into an Aurelia application. This integration showcases Aurelia's adaptability and how it can leverage the strengths of other ecosystems. Below, we provide a detailed guide and code examples to integrate a Vue component seamlessly into an Aurelia 2 application.

## Install Dependencies

First, ensure that your Aurelia project has the necessary dependencies to use Vue. You'll need Vue's core library and the compiler if you're working with single-file components (`.vue` files).

```bash
npm install vue@next @vue/compiler-sfc
```

## Configure Your Build System

To handle `.vue` single-file components, configure your build system accordingly. If you're using Webpack, integrate the `vue-loader` plugin.

**Install the necessary loader:**

```bash
npm install vue-loader@next
```

**Update your Webpack configuration:**

```javascript
// webpack.config.js
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  // ... existing configuration ...
  module: {
    rules: [
      // ... existing rules ...
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
  plugins: [
    // ... existing plugins ...
    new VueLoaderPlugin()
  ]
};
```

This setup enables Webpack to process `.vue` files correctly.

## Create a Vue Component

For this example, let's create a simple Vue component. You can replace this with any Vue component you need.

```html
<!-- src/components/MyVueComponent.vue -->
<template>
  <div>Hello from Vue!</div>
</template>

<script>
export default {
  name: 'MyVueComponent'
};
</script>

<style scoped>
/* Component-specific styles */
</style>
```

This single-file component includes the template, script, and styles in one file.

## Create an Aurelia Wrapper Component

To integrate the Vue component into Aurelia, create a wrapper Aurelia component that will render the Vue component.

```typescript
// src/resources/elements/vue-wrapper.ts
import { customElement, ICustomElementViewModel, INode } from 'aurelia';
import { createApp, defineComponent } from 'vue';
import MyVueComponent from '../../components/MyVueComponent.vue';

@customElement({ name: 'vue-wrapper', template: '<template><div ref="container"></div></template>' })
export class VueWrapper implements ICustomElementViewModel {
  private container: HTMLElement;

  constructor(@INode private element: HTMLElement) {
    this.container = this.element.querySelector('div[ref="container"]')!;
  }

  attached() {
    const app = createApp(defineComponent(MyVueComponent));
    app.mount(this.container);
  }

  detaching() {
    // Optional: Unmount the Vue app if needed
  }
}
```

This wrapper initializes and mounts the Vue component when the Aurelia component is attached to the DOM.

## Register the Wrapper Component and Use It

Now, you must register the wrapper component with Aurelia and then use it in your application.

```typescript
// src/main.ts
import Aurelia from 'aurelia';
import { VueWrapper } from './resources/elements/vue-wrapper';
import { MyApp } from './my-app';

Aurelia
  .register(VueWrapper)
  .app(MyApp)
  .start();
```

Then, use it in a view:

```html
<!-- src/my-view.html -->
<template>
  <vue-wrapper></vue-wrapper>
</template>
```

Following these steps, you can integrate Vue components into your Aurelia 2 application. This process highlights the flexibility of Aurelia, allowing you to take advantage of Vue's component library while enjoying the benefits of Aurelia's powerful features.
