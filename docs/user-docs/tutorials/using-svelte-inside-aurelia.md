---
description: Libception. Learn how to use Svelte inside of your Aurelia applications.
---

# Using Svelte inside Aurelia

Aurelia's design embraces flexibility and interoperability, making it well-suited for integration with other libraries and frameworks. One common scenario is incorporating Svelte components into an Aurelia application. This integration showcases Aurelia's adaptability and how it can leverage the strengths of other ecosystems. Below, we provide a detailed guide and code examples to integrate a Svelte component seamlessly into an Aurelia 2 application.

## Install Dependencies

First, ensure that your Aurelia project has the necessary dependencies to use Svelte. You'll need the Svelte core library and TypeScript types.

```bash
npm install svelte
npm install --save-dev @types/svelte
```

For build configuration, the Svelte team recommends using **Vite**:

```bash
npm install --save-dev vite @vitejs/plugin-legacy @sveltejs/vite-plugin-svelte
```

## Configure Your Build System

Configure Vite to handle `.svelte` files with the official Svelte plugin:

**vite.config.js:**

```javascript
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte({
      // Optional: configure Svelte options
      onwarn: (warning, handler) => {
        // Handle Svelte warnings
        if (warning.code === 'css-unused-selector') return;
        handler(warning);
      }
    })
  ],
  resolve: {
    alias: {
      // Ensure only one Svelte runtime is bundled
      'svelte': 'svelte'
    }
  }
});
```

## Create a Svelte Component

For this example, let's create a simple Svelte component.

```svelte
<!-- src/components/MySvelteComponent.svelte -->
<script lang="ts">
  export let name: string = 'World';
  export let count: number = 0;

  function increment() {
    count += 1;
  }
</script>

<style>
  div {
    color: blue;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  button {
    margin-left: 0.5rem;
    padding: 0.25rem 0.5rem;
  }
</style>

<div>
  Hello from Svelte, {name}! 
  <br>
  Count: {count}
  <button on:click={increment}>+</button>
</div>
```

This component displays a greeting message with interactive functionality and accepts `name` and `count` props.

## Create an Aurelia Wrapper Component

To integrate the Svelte component into Aurelia, create a wrapper Aurelia component that will render the Svelte component.

```typescript
// src/resources/elements/svelte-wrapper.ts
import { customElement, bindable } from 'aurelia';
import MySvelteComponent from '../../components/MySvelteComponent.svelte';
import type { SvelteComponent } from 'svelte';

@customElement({ name: 'svelte-wrapper', template: '<template><div ref="container"></div></template>' })
export class SvelteWrapper {
  @bindable public svelteComponent: typeof MySvelteComponent;
  @bindable public props?: Record<string, any>;
  
  private container!: HTMLDivElement;
  private svelteInstance: SvelteComponent | null = null;

  public attached(): void {
    if (this.container && this.svelteComponent) {
      this.mountSvelteComponent();
    }
  }

  public propertyChanged(): void {
    if (this.svelteInstance && this.props) {
      // Update Svelte component props reactively
      this.svelteInstance.$set(this.props);
    }
  }

  public detaching(): void {
    if (this.svelteInstance) {
      this.svelteInstance.$destroy();
      this.svelteInstance = null;
    }
  }

  private mountSvelteComponent(): void {
    try {
      this.svelteInstance = new this.svelteComponent({
        target: this.container,
        props: this.props || {},
      });
    } catch (error) {
      console.error('Failed to mount Svelte component:', error);
    }
  }
}
```

This wrapper properly handles Svelte component lifecycle using Aurelia 2's lifecycle hooks. It supports bindable props that are passed to the Svelte component and updates them reactively when they change.

## Register the Wrapper Component and Use It

Now, you must register the wrapper component with Aurelia and then use it in your application.

```typescript
// src/main.ts
import { Aurelia } from 'aurelia';
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
  <svelte-wrapper 
    svelte-component.bind="mySvelteComponent"
    props.bind="svelteProps">
  </svelte-wrapper>
</template>
```

Ensure you import and make the Svelte component available in your Aurelia component:

```typescript
// src/my-view.ts
import MySvelteComponent from './components/MySvelteComponent.svelte';

export class MyView {
  public mySvelteComponent = MySvelteComponent;
  public svelteProps = { 
    name: 'Aurelia User',
    count: 5
  };
}
```

## Advanced Integration Patterns

### Svelte 5 Support with Modern Mount API

For Svelte 5+, you can use the modern `mount()` and `unmount()` APIs:

```typescript
// src/resources/elements/svelte5-wrapper.ts
import { customElement, bindable } from 'aurelia';
import { mount, unmount } from 'svelte';
import type { ComponentType, Component } from 'svelte';

@customElement({ name: 'svelte5-wrapper', template: '<template><div ref="container"></div></template>' })
export class Svelte5Wrapper {
  @bindable public svelteComponent: ComponentType;
  @bindable public props?: Record<string, any>;
  
  private container!: HTMLDivElement;
  private svelteInstance: Component | null = null;

  public attached(): void {
    if (this.container && this.svelteComponent) {
      this.mountSvelteComponent();
    }
  }

  public propertyChanged(): void {
    if (this.svelteInstance && this.props) {
      // Svelte 5: Re-mount with new props (or use store pattern for complex state)
      this.unmountSvelteComponent();
      this.mountSvelteComponent();
    }
  }

  public detaching(): void {
    this.unmountSvelteComponent();
  }

  private mountSvelteComponent(): void {
    try {
      this.svelteInstance = mount(this.svelteComponent, {
        target: this.container,
        props: this.props || {}
      });
    } catch (error) {
      console.error('Failed to mount Svelte 5 component:', error);
    }
  }

  private unmountSvelteComponent(): void {
    if (this.svelteInstance) {
      unmount(this.svelteInstance, { outro: true });
      this.svelteInstance = null;
    }
  }
}
```

### Error Handling and Lifecycle Management

For production applications, consider implementing robust error boundaries:

```typescript
private mountSvelteComponent(): void {
  try {
    this.svelteInstance = new this.svelteComponent({
      target: this.container,
      props: this.props || {},
    });

    // Optional: Listen to component events
    this.svelteInstance.$on?.('custom-event', (event) => {
      console.log('Svelte component event:', event.detail);
    });
  } catch (error) {
    console.error('Failed to mount Svelte component:', error);
    // Render fallback UI
    this.container.innerHTML = '<div>Failed to load component</div>';
  }
}
```

### TypeScript Configuration

Ensure your `tsconfig.json` supports Svelte files:

```json
{
  "compilerOptions": {
    "types": ["svelte"],
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true
  }
}
```

### Performance Considerations

- **Reactive Updates**: Svelte components re-render when props change via `$set()` in Svelte 4 or re-mounting in Svelte 5
- **Component Communication**: Use Svelte stores for complex state management between components
- **Bundle Size**: Svelte's compile-time optimizations result in smaller bundles compared to runtime frameworks

### Svelte 4 vs 5 Compatibility

This integration pattern works with both Svelte 4 and 5:

- **Svelte 4**: Uses `new Component()` constructor and `$destroy()` method
- **Svelte 5**: Supports both legacy syntax and new `mount()`/`unmount()` APIs
- **Migration**: Svelte 5 maintains backward compatibility, allowing gradual migration

Following these steps, you can integrate Svelte components into your Aurelia 2 application. This process highlights the flexibility of Aurelia, allowing you to take advantage of Svelte's reactive capabilities while benefiting from Aurelia's powerful framework features.
