---
description: Libception. Learn how to use Svelte inside of your Aurelia applications.
---

# Using Svelte inside Aurelia

Aurelia’s interoperability story makes it straightforward to embed islands from other ecosystems. This tutorial walks you through wiring Svelte 5 components (and legacy Svelte 4 builds) into an Aurelia 2 application, covering tooling, wrappers, and lifecycle management.

## Install Dependencies

1. Add Svelte and the official Vite plugin (which also ships the recommended preprocessors):

   ```bash
   npm install svelte
   npm install --save-dev @sveltejs/vite-plugin-svelte vite svelte-check
   ```

2. Extend your workspace TypeScript configuration with the community preset so the compiler understands `.svelte` and `.svelte.ts` modules:

   ```bash
   npm install --save-dev @tsconfig/svelte
   ```

Svelte already ships its own type definitions—you do **not** need an `@types/svelte` package. Keep `svelte-check` alongside your existing `npm run lint` to catch template type regressions during CI.

## Configure Vite

Make sure Aurelia’s Vite plugin and the Svelte plugin both run so `.svelte` and `.svelte.ts` assets are compiled before Aurelia consumes them:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import aurelia from '@aurelia/vite-plugin';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    aurelia(),
    svelte({
      extensions: ['.svelte', '.svelte.ts'],
      preprocess: vitePreprocess(),
      compilerOptions: {
        hydratable: true
      }
    })
  ]
});
```

The `extensions` setting ensures rune-enabled helper modules such as `.svelte.ts` files go through the Svelte compiler rather than the plain TypeScript loader.

## TypeScript and Tooling Setup

Augment `tsconfig.json` (or the workspace override that targets your Aurelia app) so runtime files and the new `.svelte.ts` helpers stay type-safe:

```json
{
  "extends": "@tsconfig/svelte/tsconfig.json",
  "compilerOptions": {
    "moduleResolution": "bundler",
    "types": ["svelte"],
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.svelte",
    "src/**/*.svelte.ts"
  ]
}
```

Add a convenience script for local validation:

```json
"scripts": {
  "check:svelte": "svelte-check --tsconfig ./tsconfig.json"
}
```

Run this after `npm run build` when touching shared Aurelia + Svelte code to prevent stale declaration issues.

## Build a Svelte 5 Component

Svelte 5 introduces runes such as `$state` and `$props`. Here is a simple counter component that exposes a callback for Aurelia to hook into:

```svelte
<!-- src/components/my-svelte-widget.svelte -->
<script lang="ts">
  export interface WidgetProps {
    name?: string;
    initialCount?: number;
    onIncrement?: (value: number) => void;
  }

  let { name = 'World', initialCount = 0, onIncrement }: WidgetProps = $props();
  let count = $state(initialCount);

  const increment = () => {
    count += 1;
    onIncrement?.(count);
  };
</script>

<style>
  .widget {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid #d0d7de;
  }
</style>

<div class="widget">
  <span>Hello from Svelte, {name}!</span>
  <button onclick={increment}>Count: {count}</button>
</div>
```

Because Svelte 5 components are functions, props are accessed via `$props()` and local state uses `$state()`.

## Share Reactive Props with `.svelte.ts`

When Aurelia needs to update props after a component mounts, create the prop state inside a `.svelte.ts` helper so it can use runes while still being imported from plain TypeScript:

```typescript
// src/svelte/create-props-state.svelte.ts
export function createPropsState<T extends Record<string, unknown>>(initial: T) {
  const props = $state({ ...initial });
  return props;
}
```

Because this file ends with `.svelte.ts`, the Svelte compiler transforms `$state` before the TypeScript compiler sees it. The `allowImportingTsExtensions` flag from the previous section lets you import this module verbatim.

## Create the Aurelia Wrapper (Svelte 5)

```typescript
// src/resources/elements/svelte-wrapper.ts
import { customElement, bindable } from '@aurelia/runtime-html';
import { flushSync, mount, unmount, type Component, type ComponentType } from 'svelte';
import { createPropsState } from '../../svelte/create-props-state.svelte.ts';

@customElement({ name: 'svelte-wrapper', template: '<div ref="container"></div>' })
export class SvelteWrapper {
  @bindable public svelteComponent?: ComponentType;
  @bindable public props?: Record<string, unknown>;

  private container!: HTMLDivElement;
  private instance: Component | null = null;
  private readonly propsState = createPropsState<Record<string, unknown>>({});

  public attached(): void {
    if (!this.container || !this.svelteComponent) {
      return;
    }

    this.instance = mount(this.svelteComponent, {
      target: this.container,
      props: this.propsState
    });
    this.syncProps();
    flushSync();
  }

  public propertyChanged(): void {
    this.syncProps();
  }

  private syncProps(): void {
    if (!this.props) {
      return;
    }
    Object.assign(this.propsState, this.props);
  }

  public detaching(): void {
    if (this.instance) {
      unmount(this.instance, { outro: true });
      this.instance = null;
    }
  }
}
```

- `mount`/`unmount` keep parity with Svelte 5’s imperative API.
- `flushSync()` ensures `onMount` hooks and pending effects inside the Svelte component finish before Aurelia continues.
- `Object.assign` pushes Aurelia’s bindable updates into the `$state` proxy created earlier, so Svelte reruns effects without rebuilding the component.

## Register and Use the Wrapper

```typescript
// src/main.ts
import { Aurelia } from 'aurelia';
import { MyApp } from './my-app';
import { SvelteWrapper } from './resources/elements/svelte-wrapper';

Aurelia.register(SvelteWrapper).app(MyApp).start();
```

```html
<!-- src/my-view.html -->
<svelte-wrapper
  svelte-component.bind="mySvelteComponent"
  props.bind="svelteProps">
</svelte-wrapper>
```

```typescript
// src/my-view.ts
import MySvelteWidget from './components/my-svelte-widget.svelte';

export class MyView {
  public mySvelteComponent = MySvelteWidget;
  public svelteProps = {
    name: 'Aurelia User',
    initialCount: 5,
    onIncrement: (value: number) => console.log('Svelte count', value)
  };
}
```

## Error Handling and Lifecycle Tips

- Wrap `mount` calls in `try/catch` and swap the Aurelia host contents with a fallback string when instantiation fails.
- Tie subscription cleanup to `detaching()` so lingering intervals or stores inside your Svelte component do not leak.
- If the wrapped component dispatches data through callbacks, surface those as Aurelia events or pass functions through the `props` object, as shown in the example.

## Supporting Legacy Svelte 4 Components

If you still rely on `new Component({...})` and `$set`, keep those builds in compatibility mode:

```javascript
// svelte.config.js
export default {
  compilerOptions: {
    compatibility: {
      componentApi: 4
    }
  }
};
```

With compatibility enabled, you can keep the class-based wrapper:

```typescript
// src/resources/elements/legacy-svelte-wrapper.ts
import { customElement, bindable } from '@aurelia/runtime-html';
import type { SvelteComponent } from 'svelte/legacy';

@customElement({ name: 'legacy-svelte-wrapper', template: '<div ref="container"></div>' })
export class LegacySvelteWrapper {
  @bindable public svelteComponent?: typeof SvelteComponent;
  @bindable public props?: Record<string, unknown>;

  private container!: HTMLDivElement;
  private instance: SvelteComponent | null = null;

  public attached(): void {
    if (!this.container || !this.svelteComponent) {
      return;
    }
    this.instance = new this.svelteComponent({
      target: this.container,
      props: this.props ?? {}
    });
  }

  public propertyChanged(): void {
    this.instance?.$set?.(this.props ?? {});
  }

  public detaching(): void {
    this.instance?.$destroy?.();
    this.instance = null;
  }
}
```

As you migrate Svelte 4 code to runes, you can drop the compatibility wrapper and move callers to the new `svelte-wrapper`.

## Performance Considerations

- Prefer passing stable object references from Aurelia to avoid needless `Object.assign` churn in `propertyChanged`.
- For frequent prop changes, shift more state into the Svelte component itself (or a shared `$state` module) and only forward primitive inputs from Aurelia.
- Svelte 5 no longer exposes `beforeUpdate`/`afterUpdate`; if you depend on those hooks, move DOM work into `$effect` blocks or Aurelia lifecycle callbacks.

Following these steps keeps both frameworks aligned with their modern APIs while letting you reuse any bespoke Svelte UI inside Aurelia. Once everything is wired, run `npm run build && npm run check:svelte` before shipping to ensure the Aurelia and Svelte toolchains agree on the generated output.
