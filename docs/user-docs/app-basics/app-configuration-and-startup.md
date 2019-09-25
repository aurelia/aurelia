# App Configuration and Startup

## Application Startup

### New Quick Startup (recommended)

```ts
import au, { StyleConfiguration, RouterConfiguration } from 'aurelia';
import { MyRootComponent } from './my-root-component';
au(MyRootComponent); // by default host to element name (<my-root-component> for MyRootComponent),
                     // or <body> if <my-root-component> is absent.

// or load additional aurelia features
au(MyRootComponent, {
  deps: [ // deps or dependencies
    StyleConfiguration.shadowDOM(),
    RouterConfiguration.customize({ useUrlFragmentHash: false })
  ]
});

// or host to <my-start-tag>
au(MyRootComponent, {
  host: 'my-start-tag'
});
au(MyRootComponent, {
  host: document.querySelector('my-start-tag'),
  deps: [
    StyleConfiguration.shadowDOM(),
    RouterConfiguration.customize({ useUrlFragmentHash: false })
  ]
});
```

### Verbose Startup

To start an Aurelia application, create a `new Aurelia()` object with a target `host` and a root `component` and call `start()`.

```typescript
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

```typescript
import { CardCustomElement } from './components/card';

// When using quick startup
au(..., <any>CardCustomElement);

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
au(..., <any>globalComponents);

// When using verbose startup
new Aurelia()
  .register(...)
  .register(<any>globalComponents)
  .app({ ... })
  .start();
```

