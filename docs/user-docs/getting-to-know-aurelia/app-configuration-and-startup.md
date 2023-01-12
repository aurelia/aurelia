# App configuration and startup

## Application Startup

Aurelia allows you to configure the application startup in a couple of different ways. A quick setup where some defaults are assumed and a verbose setup where you can configure some of the framework-specific behaviors.

### Quick startup

The quick startup approach is what most developers will choose.

```typescript
import Aurelia, { StyleConfiguration, RouterConfiguration } from 'aurelia';

import { MyRootComponent } from './my-root-component';

// By default host to element name (<my-root-component> for MyRootComponent),
// or <body> if <my-root-component> is absent.
Aurelia.app(MyRootComponent).start();

// Or load additional Aurelia features
Aurelia
  .register(
    RouterConfiguration.customize({ useUrlFragmentHash: false })
  )
  .app(MyRootComponent)
  .start();

// Or host to <my-start-tag>
Aurelia
  .register(
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
import Aurelia, { StandardConfiguration } from 'aurelia';
import { ShellComponent } from './shell';

new Aurelia()
  .register(StandardConfiguration)
  .app({ host: document.querySelector('body'), component: ShellComponent })
  .start();
```

In most instances, you will not use the verbose approach to starting your Aurelia applications. The verbose approach is more aimed at developers integrating Aurelia into existing web applications and views.

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

src/components/index.ts:

```typescript
export { CardCustomElement } from './card';
export { CollapseCustomElement } from './collapse';
```

src/main.ts:

```typescript
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
