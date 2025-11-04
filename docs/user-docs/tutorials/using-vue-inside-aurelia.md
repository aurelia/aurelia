---
description: Libception. Learn how to use Vue inside of your Aurelia applications.
---

# Using Vue inside Aurelia

As of November 17, 2025 the current stable Vue release is 3.5 "Tengen Toppa Gurren Lagann" (published September 1–3, 2024). This minor release tightened the reactivity core (up to 56% lower memory use and faster deep array updates) while stabilizing conveniences like props destructuring and `useId`. Aurelia can host those modern Vue components directly, letting you reuse mature component libraries without rewriting existing Aurelia flows. This tutorial shows the full workflow: dependencies, tooling, wrapper components, and advanced integration tips.

## Install Dependencies

1. **Runtime + ecosystem libraries**

   ```bash
   npm install vue@^3.5 pinia
   ```

   - `vue@^3.5` pulls the latest 3.5.x patch (currently 3.5.17) with the reworked reactivity engine.
   - `pinia` is Vue's official state management library and is easier to adopt than legacy Vuex.

2. **Tooling for Aurelia + Vue single-file components (SFCs)**

   ```bash
   npm install --save-dev @aurelia/vite-plugin @vitejs/plugin-vue @vitejs/plugin-vue-jsx @vue/tsconfig vue-tsc vite
   ```

   - `@aurelia/vite-plugin` wires Aurelia conventions into Vite.
   - `@vitejs/plugin-vue` compiles `.vue` files; add `@vitejs/plugin-vue-jsx` only if you have JSX/TSX components.
   - `@vue/tsconfig` and `vue-tsc` keep the TypeScript story in sync with the official Vue presets.

## Configure Vite for Both Frameworks

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import aurelia from '@aurelia/vite-plugin';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

export default defineConfig(({ mode }) => ({
  plugins: [
    aurelia(),
    vue({
      script: {
        defineModel: true
      },
      template: {
        compilerOptions: {
          // Vue 3.5 props destructuring is stable, no extra flags needed,
          // but keep the switch for teams that want to forbid it.
          propsDestructure: mode === 'strict' ? 'error' : true
        }
      }
    }),
    vueJsx()
  ],
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  }
}));
```

- Aurelia runs first so its HTML transforms (like `<au-compose>`) execute before Vue compiles SFCs.
- Vue 3.5 enables props destructuring by default; the config above only guards stricter environments.

## TypeScript + Type Checking

Extend the Vue presets so `.vue` and `.vue.ts` files type-check alongside Aurelia `.ts` code:

```json
// tsconfig.json
{
  "extends": ["@vue/tsconfig/tsconfig.dom.json"],
  "compilerOptions": {
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "strict": true,
    "types": ["vite/client"]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.vue"
  ]
}
```

Add a Vue-specific type-check script so CI can fail fast:

```json
"scripts": {
  "check:vue": "vue-tsc --noEmit",
  "build": "vite build"
}
```

Also create a shim when your repo does not already provide one:

```typescript
// src/shims-vue.d.ts
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
```

## Build a Modern Vue Component

Use `<script setup>` with destructured props, `useId`, and Composition API patterns:

```vue
<!-- src/components/my-vue-panel.vue -->
<template>
  <section class="panel">
    <h3 :id="headingId">Hello from Vue, {{ name }}!</h3>
    <p>Count: {{ count }}</p>
    <button type="button" @click="increment">Increment</button>
    <button type="button" @click="emitCustom">Notify Aurelia</button>
  </section>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue';

type PanelEvents = {
  'custom-event': [payload: { message: string; current: number }];
};

const {
  name = 'World',
  initialCount = 0,
  onCustomEvent,
} = defineProps<{
  name?: string;
  initialCount?: number;
  onCustomEvent?: (payload: { message: string; current: number }) => void;
}>();

const emit = defineEmits<PanelEvents>();

const count = ref(initialCount);
const headingId = useId();

const increment = () => {
  count.value += 1;
};

const emitCustom = () => {
  const payload = { message: `Hi ${name} from Vue`, current: count.value };
  emit('custom-event', payload);
  onCustomEvent?.(payload);
};
</script>

<style scoped>
.panel {
  border: 2px solid #42b883;
  padding: 1rem;
  border-radius: 0.75rem;
  background: #f9fffb;
}
button {
  margin-right: 0.5rem;
}
</style>
```

## Create the Aurelia Wrapper

```typescript
// src/resources/elements/vue-wrapper.ts
import { customElement, bindable } from '@aurelia/runtime-html';
import { App, Component, createApp, markRaw, reactive, shallowReactive } from 'vue';

@customElement({ name: 'vue-wrapper', template: '<div ref="host"></div>' })
export class VueWrapper {
  @bindable public vueComponent?: Component;
  @bindable public props?: Record<string, unknown>;
  @bindable public configureApp?: (app: App<Element>) => void;

  private host!: HTMLDivElement;
  private app: App<Element> | null = null;
  private readonly reactiveProps = shallowReactive<Record<string, unknown>>({});

  public attached(): void {
    if (!this.host || !this.vueComponent) {
      return;
    }

    this.app = createApp(markRaw(this.vueComponent), this.reactiveProps);
    this.configureApp?.(this.app);

    this.app.config.errorHandler = (err, instance, info) => {
      console.error('Vue error', err, info);
      if (this.app) {
        this.app.config.throwUnhandledErrorInProduction = true;
      }
    };
    this.app.config.warnRecursiveComputed = true;

    this.app.mount(this.host);
    this.syncProps();
  }

  public propertyChanged(): void {
    this.syncProps();
  }

  public detaching(): void {
    if (this.app) {
      this.app.unmount();
      this.app = null;
    }
  }

  private syncProps(): void {
    if (this.props) {
      Object.assign(this.reactiveProps, this.props);
    }
  }
}
```

- `markRaw` prevents Vue from proxy-wrapping the component class stored on the Aurelia instance.
- `shallowReactive` + `Object.assign` lets Aurelia push new props without remounting, so Vue state (`ref`s, Pinia stores, Teleports, Suspense trees) stay intact.
- The optional `configureApp` bindable gives callers a hook to register plugins, Pinia stores, or global properties before mounting.

## Register and Use the Wrapper

```typescript
// src/main.ts
import { Aurelia } from 'aurelia';
import { MyApp } from './my-app';
import { VueWrapper } from './resources/elements/vue-wrapper';

Aurelia.register(VueWrapper).app(MyApp).start();
```

```html
<!-- src/my-view.html -->
<vue-wrapper
  vue-component.bind="myVueComponent"
  props.bind="vueProps"
  configure-app.bind="configureVue">
</vue-wrapper>
```

```typescript
// src/my-view.ts
import MyVuePanel from './components/my-vue-panel.vue';
import { createPinia } from 'pinia';
import type { App } from 'vue';

export class MyView {
  public myVueComponent = MyVuePanel;
  public vueProps = {
    name: 'Aurelia User',
    initialCount: 10,
    onCustomEvent: (payload: { message: string; current: number }) => this.handleVueEvent(payload)
  };

  public configureVue(app: App<Element>): void {
    app.use(createPinia());
    app.config.performance = import.meta.env.DEV;
  }

  public handleVueEvent(payload: { message: string; current: number }): void {
    console.log('Received event from Vue component:', payload);
  }
}
```

## Advanced Integration Patterns

### Forward Vue Events into Aurelia

Instead of wiring custom DOM events manually, pass callback props (`onCustomEvent`) from Aurelia to Vue. Vue's emitters can call them alongside standard emits, keeping data in Aurelia land without extra DOM listeners.

### Share Global State with Pinia

Create stores once per wrapper instance to avoid cross-request leakage:

```typescript
import { createPinia, defineStore } from 'pinia';

const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 })
});

public configureVue(app: App<Element>): void {
  const pinia = createPinia();
  app.use(pinia);
  useCounterStore(pinia).count = 42;
}
```

Pinia is the officially recommended state manager, so this approach stays aligned with Vue's roadmap.

### Trusted Types, Teleport, and Suspense

Vue 3.5 automatically generates `TrustedHTML` for compiler output, so you can embed the wrapper inside strict Content Security Policy contexts. Features like deferred Teleport and Suspense now work even when their targets are rendered in the same tick—great for overlay widgets inside Aurelia layouts.

### Error Visibility in Production

Use the new `throwUnhandledErrorInProduction` flag plus Aurelia's own logging to bubble up silent Vue runtime errors, especially when third-party Vue widgets swallow exceptions by default.

### Performance Tips

- Pass stable object references from Aurelia (`this.vueProps`) instead of inline literal objects, so `Object.assign` only runs when the data actually changes.
- For rapid prop churn, move hot data into a Pinia store or `reactive` object inside Vue and only pass IDs or primitives from Aurelia.
- Keep Vue components `markRaw` when stored on Aurelia classes to avoid unintended reactivity tracking and memory pressure.

## Validation Checklist

Run both toolchains whenever you touch shared integration code:

```bash
npm run build
npm run check:vue
```

Once these commands pass, your Vue islands will continue to respect Aurelia's lifecycle guarantees while leveraging the latest Vue 3.5 features.
