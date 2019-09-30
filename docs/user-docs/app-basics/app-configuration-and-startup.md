# App Configuration and Startup

## Application Startup

### New Quick Startup (recommended)

```ts
import Aurelia, { StyleConfiguration, RouterConfiguration } from 'aurelia';
import { MyRootComponent } from './my-root-component';
// By default host to element name (<my-root-component> for MyRootComponent),
// or <body> if <my-root-component> is absent.
Aurelia.app(MyRootComponent).start();

// Or load additional aurelia features
Aurelia
  .register(
    StyleConfiguration.shadowDOM(),
    RouterConfiguration.customize({ useUrlFragmentHash: false })
  )
  .app(MyRootComponent)
  .start();

// Or host to <my-start-tag>
Aurelia
  .register(
    StyleConfiguration.shadowDOM(),
    RouterConfiguration.customize({ useUrlFragmentHash: false })
  )
  .app({
    component: MyRootComponent,
    host: document.querySelector('my-start-tag')
  })
  .start();
```

### Verbose Startup

To start an Aurelia application, create a `new Aurelia()` object with a target `host` and a root `component` and call `start()`.

```typescript
import { DebugConfiguration } from '@aurelia/debug';
import { JitHtmlBrowserConfiguration } from '@aurelia/jit-html-browser';
import { Aurelia } from '@aurelia/runtime';
import { ShellComponent } from './shell';

new Aurelia()
  .register(JitHtmlBrowserConfiguration, DebugConfiguration)
  .app({ host: document.querySelector('body'), component: ShellComponent })
  .start();
```

## Register a globally available custom element

### Registering a single element

To make a custom element globally available to your application, pass the custom element constructor to the `.register()` method on your Aurelia app.

```typescript
import { CardCustomElement } from './components/card';

// When using quick startup
Aurelia
  .register(...)
  .register(<any>CardCustomElement);
  .app({ ... })
  .start();

// When using verbose startup
new Aurelia()
  .register(...)
  .register(<any>CardCustomElement)
  .app({ ... })
  .start();
```

### Register a set of elements

If you have a package that exports all your custom elements, you can pass the entire package to the `.register()` method on your Aurelia app.

\`\`\`TypeScript src/components/index.ts export { CardCustomElement } from './card'; export { CollapseCustomElement } from './collapse';

```text
```TypeScript src/main.ts
import * as globalComponents from './components';

// When using quick startup
Aurelia
  .register(...)
  .register(<any>globalComponents)
  .app({ ... })
  .start();

// When using verbose startup
new Aurelia()
  .register(...)
  .register(<any>globalComponents)
  .app({ ... })
  .start();
```

