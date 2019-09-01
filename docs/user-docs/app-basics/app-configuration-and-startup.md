# App Configuration and Startup

## Application Startup

To start an Aurelia application, create a `new Aurelia()` object with a target `host` and a root `component` and call `start()`.

```TypeScript
import { DebugConfiguration } from '@aurelia/debug';
import { BasicConfiguration } from '@aurelia/jit-html-browser';
import { Aurelia } from '@aurelia/runtime';
import { ShellComponent } from './shell';

new Aurelia()
  .register(BasicConfiguration, DebugConfiguration)
  .app({ host: document.querySelector('body'), component: ShellComponent })
  .start();
```

## Register a globally available custom element

### Registering a single element

To make a custom element globally available to your application, pass the custom element constructor to the `.register()` method on your Aurelia app.

```TypeScript
import { CardCustomElement } from './components/card';

new Aurelia()
  .register(...)
  .register(<any>CardCustomElement)
  .app({ ... })
  .start();
```

### Register a set of elements

If you have a package that exports all your custom elements, you can pass the entire package to the `.register()` method on your Aurelia app.

```TypeScript src/components/index.ts
export { CardCustomElement } from './card';
export { CollapseCustomElement } from './collapse';
```

```TypeScript src/main.ts
import * as globalComponents from './components';

new Aurelia()
  .register(...)
  .register(<any>globalComponents)
  .app({ ... })
  .start();
```
