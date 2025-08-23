# App configuration and startup

## Application Startup

Aurelia provides two main approaches for application startup: a quick setup using static methods with sensible defaults, and a verbose setup that gives you complete control over configuration.

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

Aurelia's enhancement mode allows you to integrate Aurelia functionality into existing DOM content without replacing it entirely. This is perfect for progressively enhancing existing applications or adding Aurelia to specific sections of a page.

### Basic Enhancement

```typescript
import Aurelia from 'aurelia';

// Enhance existing DOM content
const host = document.querySelector('#existing-content');
const enhanceRoot = await Aurelia.enhance({
  host: host,
  component: {
    message: 'Hello from enhanced content!',
    items: [1, 2, 3]
  }
});

// Later, cleanup when needed
await enhanceRoot.deactivate();
```

### Enhancement with Custom Components

```typescript
import Aurelia from 'aurelia';
import { MyCustomElement } from './components/my-custom-element';

// Register components before enhancement
const enhanceRoot = await Aurelia
  .register(MyCustomElement)
  .enhance({
    host: document.querySelector('#content'),
    component: {
      data: { name: 'John', age: 30 },
      created() {
        console.log('Enhanced component created');
      }
    }
  });
```

### Enhancement with Custom Container

```typescript
import { Aurelia } from '@aurelia/runtime-html';
import { DI } from '@aurelia/kernel';
import { MyService } from './services/my-service';

// Create custom container with specific services
const container = DI.createContainer();
container.register(MyService);

const au = new Aurelia();
const enhanceRoot = await au.enhance({
  host: document.querySelector('#widget'),
  component: { title: 'Enhanced Widget' },
  container: container  // Use custom container
});
```

### When to Use Enhancement

- **Legacy Application Integration**: Add Aurelia to existing applications incrementally
- **Widget Development**: Create interactive widgets within larger non-Aurelia pages
- **Progressive Enhancement**: Enhance server-rendered content with client-side interactivity
- **Content Management Systems**: Add dynamic behavior to CMS-generated content

**Key Differences from Standard App Mode:**
- No need to define a root custom element
- Can target any existing DOM element
- Binds directly to plain JavaScript objects
- Multiple enhanced sections can coexist on one page
- More lightweight for small interactive components
