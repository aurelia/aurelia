---
description: Libception. Learn how to use Vue inside of your Aurelia applications.
---

# Using Vue inside Aurelia

Aurelia's design embraces flexibility and interoperability, making it well-suited for integration with other libraries and frameworks. One common scenario is incorporating Vue components into an Aurelia application. This integration showcases Aurelia's adaptability and how it can leverage the strengths of other ecosystems. Below, we provide a detailed guide and code examples to integrate a Vue component seamlessly into an Aurelia 2 application.

## Install Dependencies

First, ensure that your Aurelia project has the necessary dependencies to use Vue. You'll need Vue 3's core library and TypeScript types for single-file components (`.vue` files).

```bash
npm install vue
npm install --save-dev @vitejs/plugin-vue @vitejs/plugin-vue-jsx vue-tsc typescript
```

## Configure Your Build System

Configure Vite to handle `.vue` single-file components with the official Vue plugin:

**vite.config.js:**

```javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

export default defineConfig({
  plugins: [
    vue({
      // Optional: Configure Vue SFC options
      script: {
        defineModel: true,
        propsDestructure: true
      }
    }),
    vueJsx() // For JSX/TSX support
  ],
  resolve: {
    alias: {
      // Ensure compatibility with Vue runtime
      'vue': 'vue/dist/vue.esm-bundler.js'
    }
  },
  define: {
    // Enable Vue devtools in development
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  }
});
```

**TypeScript Configuration:**

Add Vue support to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["vite/client"],
    "isolatedModules": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
```

## Create a Vue Component

For this example, let's create a simple Vue component. You can replace this with any Vue component you need.

```vue
<!-- src/components/MyVueComponent.vue -->
<template>
  <div class="vue-component">
    <h3>Hello from Vue, {{ name }}!</h3>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
    <button @click="$emit('custom-event', { message: 'Hello from Vue!' })">
      Emit Event
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  name?: string;
  initialCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  name: 'World',
  initialCount: 0
});

const emit = defineEmits<{
  'custom-event': [payload: { message: string }];
}>();

const count = ref(props.initialCount);

const increment = () => {
  count.value++;
};
</script>

<style scoped>
.vue-component {
  padding: 1rem;
  border: 2px solid #42b883;
  border-radius: 8px;
  background-color: #f9f9f9;
}

button {
  margin: 0.25rem;
  padding: 0.5rem 1rem;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #369870;
}
</style>
```

This single-file component uses Vue 3's Composition API with `<script setup>` syntax, TypeScript support, props, events, and scoped styling.

## Create an Aurelia Wrapper Component

To integrate the Vue component into Aurelia, create a wrapper Aurelia component that will render the Vue component.

```typescript
// src/resources/elements/vue-wrapper.ts
import { customElement, bindable } from 'aurelia';
import { createApp, App } from 'vue';
import type { Component } from 'vue';

@customElement({ name: 'vue-wrapper', template: '<template><div ref="container"></div></template>' })
export class VueWrapper {
  @bindable public vueComponent: Component;
  @bindable public props?: Record<string, any>;
  
  private container!: HTMLDivElement;
  private vueApp: App<Element> | null = null;

  public attached(): void {
    if (this.container && this.vueComponent) {
      this.mountVueComponent();
    }
  }

  public propertyChanged(): void {
    if (this.vueApp && this.props) {
      // Vue 3: Remount with new props (or use provide/inject for complex state)
      this.unmountVueComponent();
      this.mountVueComponent();
    }
  }

  public detaching(): void {
    this.unmountVueComponent();
  }

  private mountVueComponent(): void {
    try {
      this.vueApp = createApp(this.vueComponent, {
        ...this.props,
        // Listen to Vue component events
        onCustomEvent: (payload: any) => {
          console.log('Vue component event received:', payload);
          // Dispatch custom event for Aurelia to handle
          this.container.dispatchEvent(new CustomEvent('vue-event', { 
            detail: payload,
            bubbles: true 
          }));
        }
      });

      this.vueApp.mount(this.container);
    } catch (error) {
      console.error('Failed to mount Vue component:', error);
      this.container.innerHTML = '<div>Failed to load Vue component</div>';
    }
  }

  private unmountVueComponent(): void {
    if (this.vueApp) {
      this.vueApp.unmount();
      this.vueApp = null;
    }
  }
}
```

This wrapper properly handles Vue 3 application lifecycle using Aurelia 2's lifecycle hooks. It supports bindable props that are passed to the Vue component, handles component events, and includes proper error handling and cleanup.

## Register the Wrapper Component and Use It

Now, you must register the wrapper component with Aurelia and then use it in your application.

```typescript
// src/main.ts
import { Aurelia } from 'aurelia';
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
  <vue-wrapper 
    vue-component.bind="myVueComponent"
    props.bind="vueProps"
    vue-event.trigger="handleVueEvent($event)">
  </vue-wrapper>
</template>
```

Ensure you import and make the Vue component available in your Aurelia component:

```typescript
// src/my-view.ts
import MyVueComponent from './components/MyVueComponent.vue';

export class MyView {
  public myVueComponent = MyVueComponent;
  public vueProps = { 
    name: 'Aurelia User',
    initialCount: 10
  };

  public handleVueEvent(event: CustomEvent): void {
    console.log('Received event from Vue component:', event.detail);
  }
}
```

## Advanced Integration Patterns

### Vue 3 Composables Integration

You can create Vue composables that work within the Aurelia-Vue integration:

```typescript
// src/composables/useCounter.ts
import { ref, computed } from 'vue';

export function useCounter(initialValue = 0) {
  const count = ref(initialValue);
  
  const doubleCount = computed(() => count.value * 2);
  
  const increment = () => count.value++;
  const decrement = () => count.value--;
  const reset = () => count.value = initialValue;
  
  return {
    count,
    doubleCount,
    increment,
    decrement,
    reset
  };
}
```

Then use it in your Vue component:

```vue
<script setup lang="ts">
import { useCounter } from '../composables/useCounter';

const { count, doubleCount, increment, decrement, reset } = useCounter(5);
</script>
```

### Global Vue Configuration

Configure Vue plugins and global properties in your wrapper:

```typescript
private mountVueComponent(): void {
  try {
    this.vueApp = createApp(this.vueComponent, this.props);
    
    // Global error handler
    this.vueApp.config.errorHandler = (err, instance, info) => {
      console.error('Vue error:', err, info);
    };
    
    // Global properties
    this.vueApp.config.globalProperties.$aureliaContext = this;
    
    // Install plugins
    // this.vueApp.use(someVuePlugin);
    
    this.vueApp.mount(this.container);
  } catch (error) {
    console.error('Failed to mount Vue component:', error);
    this.container.innerHTML = '<div>Failed to load Vue component</div>';
  }
}
```

### State Management with Pinia

For complex applications, integrate Pinia for Vue state management:

```typescript
// src/stores/counterStore.ts
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  
  getters: {
    doubleCount: (state) => state.count * 2
  },
  
  actions: {
    increment() {
      this.count++;
    }
  }
});
```

Then configure Pinia in your wrapper:

```typescript
import { createPinia } from 'pinia';

private mountVueComponent(): void {
  this.vueApp = createApp(this.vueComponent, this.props);
  this.vueApp.use(createPinia());
  this.vueApp.mount(this.container);
}
```

### Performance Optimizations

For better performance with frequent prop updates, consider using Vue's provide/inject pattern:

```typescript
private mountVueComponent(): void {
  this.vueApp = createApp(this.vueComponent);
  
  // Provide reactive data instead of remounting
  this.vueApp.provide('aureliaProps', reactive(this.props || {}));
  
  this.vueApp.mount(this.container);
}

public propertyChanged(): void {
  // Update provided data instead of remounting
  if (this.vueApp && this.props) {
    const provided = this.vueApp._instance?.provides?.aureliaProps;
    if (provided) {
      Object.assign(provided, this.props);
    }
  }
}
```

### Vue DevTools Support

Enable Vue DevTools for debugging:

```typescript
// In development
if (process.env.NODE_ENV === 'development') {
  this.vueApp.config.performance = true;
}
```

### TypeScript Shims

Add Vue SFC type support in `src/shims-vue.d.ts`:

```typescript
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
```

### Vue 3 Features Compatibility

This integration pattern supports all Vue 3 features:

- **Composition API** with `<script setup>` syntax
- **Multiple root nodes** in templates
- **Teleport** for portal-like functionality
- **Suspense** for async component loading
- **Fragment** support for multiple root elements
- **TypeScript** with full type safety

Following these steps, you can integrate Vue components into your Aurelia 2 application. This process highlights the flexibility of Aurelia, allowing you to take advantage of Vue's component library while enjoying the benefits of Aurelia's powerful features.
