---
description: Configure Aurelia applications, register global resources, and choose the startup pattern that fits your project.
---

# App configuration and startup

## Application Startup

Aurelia provides two main approaches for application startup: a quick setup using static methods with sensible defaults, and a verbose setup that gives you complete control over configuration.

> **Before you start:** If you have not already chosen a project scaffold, walk through the [section overview](README.md) for context on how this guide fits with enhancement, routing, and composition topics.

### Quick startup

The quick startup approach uses static methods on the Aurelia class and is the most common choice for new applications.

```typescript
import Aurelia from 'aurelia';
import { RouterConfiguration } from '@aurelia/router';

import { MyRootComponent } from './my-root-component';

// Simplest startup - hosts to <my-root-component> element, or <body> if not found
Aurelia.app(MyRootComponent).start();

// Register additional features before startup
Aurelia
  .register(
    RouterConfiguration.customize({ useUrlFragmentHash: false })
  )
  .app(MyRootComponent)
  .start();

// Specify a custom host element
Aurelia
  .register(
    RouterConfiguration.customize({ useUrlFragmentHash: false })
  )
  .app({
    component: MyRootComponent,
    host: document.querySelector('my-start-tag')
  })
  .start();

// Async startup pattern (recommended)
const app = Aurelia
  .register(
    RouterConfiguration.customize({ useUrlFragmentHash: false })
  )
  .app(MyRootComponent);

await app.start();
```

### Verbose Startup

The verbose approach gives you complete control over the DI container and configuration. Use this when integrating Aurelia into existing applications or when you need fine-grained control.

```typescript
import { Aurelia, StandardConfiguration } from '@aurelia/runtime-html';
import { RouterConfiguration } from '@aurelia/router';
import { LoggerConfiguration, LogLevel } from '@aurelia/kernel';
import { ShellComponent } from './shell';

// Create Aurelia instance with explicit configuration
const au = new Aurelia();

au.register(
  StandardConfiguration,  // Essential runtime configuration
  RouterConfiguration.customize({ useUrlFragmentHash: false }),
  LoggerConfiguration.create({ level: LogLevel.debug })
);

au.app({
  host: document.querySelector('body'),
  component: ShellComponent
});

// Always await start() for proper error handling
await au.start();
```

## Awaiting lifecycle transitions

`start()` completes with no value. It preserves Aurelia's synchronous fast path, so its return type is `void | Promise<void>` based on the work accepted during startup. `await` handles both forms and gives startup errors one consistent boundary:

```typescript
const au = new Aurelia()
  .register(StandardConfiguration)
  .app({ host: document.body, component: ShellComponent });

await au.start();
```

If startup throws or rejects, treat that application transition as terminal. Aurelia preserves the original error so its stack points to the failing app task or component hook. Fix that error before creating and starting another application graph.

On success, `stop()` waits for component deactivation, application tasks, and framework task-queue work. The default `stop()` retains the root for another start. `stop(true)` also disposes it. A stop requested during an asynchronous start joins that transition and runs after activation.

```typescript
await au.stop(true);
```

A stop failure is terminal for that application graph and preserves the original application error. When several app tasks already started and then fail, Aurelia reports [AUR0826](../developer-guides/error-messages/runtime-html/aur0826.md) with their original values in registration order.

The `au-started` and `au-stopped` events identify successful transitions. Both events bubble from the application host and expose the Aurelia instance through `event.detail`.

**When to use verbose startup:**
- Integrating Aurelia into existing applications
- Custom DI container configuration needed
- Multiple Aurelia apps in one page
- Advanced debugging or testing scenarios

**StandardConfiguration** includes essential services like:
- Template compiler and renderer
- Binding engine and observers  
- Custom element/attribute support
- Built-in value converters and binding behaviors
- DOM event handling and delegation
- Shadow DOM and CSS module support

## Registering Global Resources

### Registering a single custom element

To make a custom element globally available throughout your application, register it before calling `app()`.

```typescript
import Aurelia from 'aurelia';
import { CardCustomElement } from './components/card';

// Quick startup
Aurelia
  .register(CardCustomElement)  // No type casting needed
  .app(MyRootComponent)
  .start();

// Verbose startup
const au = new Aurelia();
au.register(
  StandardConfiguration,
  CardCustomElement
);
au.app({ host: document.body, component: MyRootComponent });
await au.start();
```

### Registering multiple resources

Group related components into resource modules for better organization.

**src/components/index.ts:**
```typescript
export { CardCustomElement } from './card';
export { CollapseCustomElement } from './collapse';
export { ModalCustomElement } from './modal';
```

**src/main.ts:**
```typescript
import Aurelia from 'aurelia';
import * as GlobalComponents from './components';

// Register all exported components at once
Aurelia
  .register(GlobalComponents)
  .app(MyRootComponent)
  .start();
```

### Registering other resource types

```typescript
import Aurelia from 'aurelia';
import { MyValueConverter } from './converters/my-value-converter';
import { MyBindingBehavior } from './behaviors/my-binding-behavior';
import { MyCustomAttribute } from './attributes/my-custom-attribute';

Aurelia
  .register(
    MyValueConverter,
    MyBindingBehavior,
    MyCustomAttribute
  )
  .app(MyRootComponent)
  .start();
```

## Advanced Configuration

### Custom DI registrations

```typescript
import { Registration } from '@aurelia/kernel';
import { MyService, IMyService } from './services/my-service';

Aurelia
  .register(
    Registration.singleton(IMyService, MyService)
  )
  .app(MyRootComponent)
  .start();
```

### Environment-specific configuration

```typescript
import Aurelia, { LoggerConfiguration, LogLevel } from 'aurelia';

const isProduction = process.env.NODE_ENV === 'production';

Aurelia
  .register(
    LoggerConfiguration.create({
      level: isProduction ? LogLevel.warn : LogLevel.debug
    })
  )
  .app(MyRootComponent)
  .start();
```

## Enhancement Mode

Sometimes you need Aurelia to light up markup that already exists in the DOM. Instead of calling `app()`, reach for `Aurelia.enhance`:

```typescript
const enhanceRoot = await Aurelia.enhance({
  host: document.querySelector('#existing-content'),
  component: { message: 'Hello from enhanced content!' }
});
```

Enhancement is ideal for progressive hydration, CMS integrations, or widgets embedded in non-Aurelia pages. You can register resources before enhancing and provide a custom DI container. For permanent cleanup, await `enhanceRoot.deactivate()` and then call `enhanceRoot.dispose()`.

For a full guide, including cleanup patterns, lifecycle hooks, and advanced recipes, see the dedicated [Enhance](enhance.md) article.

## Next steps

- Continue with [Enhance](enhance.md) for progressive integration scenarios.
- Wire services using [dependency injection](dependency-injection.md) once your shell is running.
- Explore [choosing a router](routing/choosing-a-router.md) to add navigation after the app is bootstrapped.
