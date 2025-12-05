---
description: >-
  Aurelia makes it easy to create your plugins. Learn how to create
  individual plugins, register them, and work with tasks to run code during certain
  parts of the lifecycle process.
---

# Building Plugins

{% hint style="info" %}
**Bundler note:** These examples import '.html' files as raw strings (showing '?raw' for Vite/esbuild). Configure your bundler as described in [Importing external HTML templates with bundlers](../components/components.md#importing-external-html-templates-with-bundlers) so the imports resolve to strings on Webpack, Parcel, etc.
{% endhint %}

Aurelia plugins allow you to encapsulate functionality that can be reused across multiple applications. They can include custom elements, value converters, binding behaviors, and other resources. The goal is to create packaged, easily shared, ready-to-use functionalities that integrate seamlessly with Aurelia applications.

## Understanding Plugin Architecture

At its core, an Aurelia plugin is an object with a `register` method that configures dependencies and sets up your functionality for use in an Aurelia application. This follows the dependency injection pattern that powers the entire Aurelia framework.

## Minimal Plugin Example

### Basic Plugin Structure

```typescript
// my-simple-plugin.ts
import { IContainer } from '@aurelia/kernel';

export const MySimplePlugin = {
  register(container: IContainer): void {
    // Register your plugin resources here
    console.log('Plugin registered!');
  }
};
```

### Registering the Plugin

```typescript
// main.ts
import Aurelia from 'aurelia';
import { MySimplePlugin } from './my-simple-plugin';

Aurelia
  .register(MySimplePlugin)
  .app(MyApp)
  .start();
```

## Adding Components and Resources

Plugins typically provide custom elements, attributes, value converters, or other resources:

```typescript
// hello-world.ts
import { customElement } from '@aurelia/runtime-html';

@customElement({
  name: 'hello-world',
  template: '<div>Hello, ${name}!</div>'
})
export class HelloWorld {
  name = 'World';
}
```

```typescript
// my-component-plugin.ts
import { IContainer } from '@aurelia/kernel';
import { HelloWorld } from './hello-world';

export const MyComponentPlugin = {
  register(container: IContainer): void {
    container.register(HelloWorld);
  }
};
```

## Creating Configurable Plugins

### Modern Configuration Pattern with `.customize()`

The modern approach uses a `.customize()` method that follows the same pattern as Aurelia's built-in plugins:

```typescript
// my-configurable-plugin.ts
import { DI, IContainer, Registration } from '@aurelia/kernel';

export interface MyPluginOptions {
  greeting?: string;
  debug?: boolean;
  theme?: 'light' | 'dark';
}

const defaultOptions: MyPluginOptions = {
  greeting: 'Hello',
  debug: false,
  theme: 'light'
};

export const IMyPluginOptions = DI.createInterface<MyPluginOptions>('IMyPluginOptions');

function createConfiguration(optionsProvider: (options: MyPluginOptions) => void) {
  return {
    register(container: IContainer): void {
      const options = { ...defaultOptions };
      optionsProvider(options);

      container.register(
        Registration.instance(IMyPluginOptions, options),
        // Register other plugin resources
        HelloWorld
      );
    },
    customize(cb: (options: MyPluginOptions) => void) {
      return createConfiguration(cb);
    }
  };
}

export const MyConfigurablePlugin = createConfiguration(() => {
  // Default configuration - no changes needed
});
```

### Using the Configurable Plugin

```typescript
// main.ts
import Aurelia from 'aurelia';
import { MyConfigurablePlugin } from './my-configurable-plugin';

Aurelia
  .register(
    MyConfigurablePlugin.customize(options => {
      options.greeting = 'Bonjour';
      options.debug = true;
      options.theme = 'dark';
    })
  )
  .app(MyApp)
  .start();
```

### Consuming Configuration in Components

```typescript
// greeting.ts
import { customElement } from '@aurelia/runtime-html';
import { resolve } from 'aurelia';
import { IMyPluginOptions } from './my-configurable-plugin';

@customElement({
  name: 'greeting',
  template: '<div class="${theme}">${options.greeting}, ${name}!</div>'
})
export class Greeting {
  name = 'World';

  private options = resolve(IMyPluginOptions);

  get theme() {
    return `theme-${this.options.theme}`;
  }
}
```

## Working with App Tasks (Lifecycle Hooks)

App tasks allow you to run code at specific points during the application lifecycle. This is useful for initialization, cleanup, or integration with external libraries.

### Available Lifecycle Phases

```typescript
import { AppTask } from '@aurelia/runtime-html';
import { IContainer } from '@aurelia/kernel';

export const MyLifecyclePlugin = {
  register(container: IContainer): void {
    container.register(
      // Before DI creates the root component
      AppTask.creating(() => {
        console.log('App is being created');
      }),

      // After root component instantiation, before template compilation
      AppTask.hydrating(() => {
        console.log('App is hydrating');
      }),

      // After self-hydration, before child element hydration
      AppTask.hydrated(() => {
        console.log('App hydration completed');
      }),

      // Before root component activation (bindings getting bound)
      AppTask.activating(() => {
        console.log('App is activating');
      }),

      // After root component activation (app is running)
      AppTask.activated(() => {
        console.log('App is activated and running');
      }),

      // Before root component deactivation
      AppTask.deactivating(() => {
        console.log('App is deactivating');
      }),

      // After root component deactivation
      AppTask.deactivated(() => {
        console.log('App has been deactivated');
      })
    );
  }
};
```

### Async App Tasks with DI

App tasks can be asynchronous and can inject dependencies:

```typescript
import { AppTask } from '@aurelia/runtime-html';
import { IContainer, Registration } from '@aurelia/kernel';
import { ILogger } from '@aurelia/kernel';

export const DataLoadingPlugin = {
  register(container: IContainer): void {
    container.register(
      AppTask.hydrating(IContainer, async (container) => {
        const logger = container.get(ILogger);
        logger.info('Loading initial data...');

        // Conditionally register services based on environment
        if (process.env.NODE_ENV === 'development') {
          const { MockDataService } = await import('./mock-data-service');
          Registration.singleton(IDataService, MockDataService).register(container);
        } else {
          const { RealDataService } = await import('./real-data-service');
          Registration.singleton(IDataService, RealDataService).register(container);
        }

        logger.info('Data services registered successfully');
      })
    );
  }
};
```

## Real-World Plugin Examples

### Router-like Plugin Structure

Here's how a plugin similar to Aurelia's router might be structured:

```typescript
// my-router-plugin.ts
import { IContainer, Registration } from '@aurelia/kernel';
import { AppTask } from '@aurelia/runtime-html';

export interface IRouterOptions {
  basePath?: string;
  enableLogging?: boolean;
}

export const IRouterOptions = DI.createInterface<IRouterOptions>('IRouterOptions');

const defaultOptions: IRouterOptions = {
  basePath: '/',
  enableLogging: false
};

function configure(container: IContainer, options: IRouterOptions = defaultOptions) {
  const finalOptions = { ...defaultOptions, ...options };

  return container.register(
    Registration.instance(IRouterOptions, finalOptions),
    // Register router components
    RouterViewport,
    RouterLink,
    // Lifecycle tasks
    AppTask.activating(IRouter, router => router.start()),
    AppTask.deactivated(IRouter, router => router.stop())
  );
}

export const MyRouterPlugin = {
  register(container: IContainer): IContainer {
    return configure(container);
  },
  customize(options: IRouterOptions) {
    return {
      register(container: IContainer): IContainer {
        return configure(container, options);
      }
    };
  }
};
```

### Validation-like Plugin Structure

Here's how a validation plugin might be structured:

```typescript
// validation-plugin.ts
import { IContainer, Registration } from '@aurelia/kernel';
import { DI } from '@aurelia/kernel';

export interface ValidationOptions {
  defaultTrigger?: 'blur' | 'change' | 'manual';
  showErrorsOnInit?: boolean;
  errorTemplate?: string;
}

export const IValidationOptions = DI.createInterface<ValidationOptions>('IValidationOptions');

const defaultOptions: ValidationOptions = {
  defaultTrigger: 'blur',
  showErrorsOnInit: false,
  errorTemplate: '<div class="error">${error}</div>'
};

function createValidationConfiguration(optionsProvider: (options: ValidationOptions) => void) {
  return {
    register(container: IContainer): void {
      const options = { ...defaultOptions };
      optionsProvider(options);

      container.register(
        Registration.instance(IValidationOptions, options),
        ValidateBindingBehavior,
        ValidationErrorsCustomAttribute,
        ValidationController
      );
    },
    customize(cb: (options: ValidationOptions) => void) {
      return createValidationConfiguration(cb);
    }
  };
}

export const ValidationPlugin = createValidationConfiguration(() => {
  // Default configuration
});
```

## Template and Style Handling in Plugins

When building plugins with custom elements, you need to decide how to handle templates and styles. Aurelia provides multiple approaches, each suited for different scenarios.

### Convention-Based Approach

The convention-based approach relies on file naming and automatic bundler processing. This is ideal for application development but requires specific bundler configuration.

#### File Structure
```
my-button/
├── my-button.ts          # Component class
├── my-button.html        # Template (auto-detected)
└── my-button.css         # Styles (auto-imported)
```

#### Component Definition
```typescript
// my-button.ts
import { customElement, bindable } from '@aurelia/runtime-html';

@customElement('my-button') // Name can be inferred from class name
export class MyButton {
  @bindable variant: 'primary' | 'secondary' = 'primary';
  @bindable disabled: boolean = false;
}
```

#### Template File
```html
<!-- my-button.html -->
<template>
  <button
    class="btn btn-${variant}"
    disabled.bind="disabled"
    click.trigger="handleClick()">
    <slot></slot>
  </button>
</template>
```

#### Styles File
```css
/* my-button.css */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}
```

### Explicit Import Approach

The explicit import approach gives you full control over dependencies and is ideal for UI libraries and distribution packages.

```typescript
import { customElement, bindable, shadowCSS } from '@aurelia/runtime-html';
import template from './my-button.html?raw';
import styles from './my-button.css';
import sharedStyles from '../shared/variables.css';

@customElement({
  name: 'my-button',
  template,
  dependencies: [shadowCSS(sharedStyles, styles)],
  shadowOptions: { mode: 'open' }
})
export class MyButton {
  @bindable variant: 'primary' | 'secondary' = 'primary';
  @bindable disabled: boolean = false;

  handleClick() {
    if (!this.disabled) {
      // Button click logic
    }
  }
}
```

### Styling Strategies

#### Light DOM (Global Styles)
Regular CSS injection into the document head:

```typescript
import './my-button.css'; // Injected globally

@customElement({
  name: 'my-button',
  template: '...'
})
export class MyButton {}
```

#### Shadow DOM with CSS
Encapsulated styles using Shadow DOM:

```typescript
import { shadowCSS } from '@aurelia/runtime-html';
import styles from './my-button.css';

@customElement({
  name: 'my-button',
  template: '...',
  dependencies: [shadowCSS(styles)],
  shadowOptions: { mode: 'open' }
})
export class MyButton {}
```

#### CSS Modules
Scoped class names for style isolation:

```typescript
import { cssModules } from '@aurelia/runtime-html';
import styles from './my-button.module.css';

@customElement({
  name: 'my-button',
  template: '<button class="button"><slot></slot></button>',
  dependencies: [cssModules(styles)]
})
export class MyButton {}
```

### Multiple Template Support

For components with different template variants:

```typescript
import { customElement } from '@aurelia/runtime-html';
import defaultTemplate from './my-button.html';
import compactTemplate from './my-button-compact.html';

export interface MyButtonOptions {
  variant?: 'default' | 'compact';
}

export const MyButtonPlugin = {
  configure(options: MyButtonOptions = {}) {
    const template = options.variant === 'compact' ? compactTemplate : defaultTemplate;

    return {
      register(container: IContainer): void {
        const ButtonElement = customElement({
          name: 'my-button',
          template
        })(MyButton);

        container.register(ButtonElement);
      }
    };
  }
};
```

### Inline Templates and Styles

For simple components, you can define templates and styles inline:

```typescript
import { customElement, bindable } from '@aurelia/runtime-html';

@customElement({
  name: 'simple-badge',
  template: `
    <span class="badge badge-\${variant}">
      <slot></slot>
    </span>
  `,
  dependencies: [],
  // Inline styles for Shadow DOM
  shadowOptions: { mode: 'open' }
})
export class SimpleBadge {
  @bindable variant: 'info' | 'success' | 'warning' | 'error' = 'info';
}
```

Or with CSS-in-JS approach:

```typescript
import { customElement, shadowCSS } from '@aurelia/runtime-html';

const styles = `
  .badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
  }
  .badge-info { background-color: #17a2b8; color: white; }
  .badge-success { background-color: #28a745; color: white; }
`;

@customElement({
  name: 'simple-badge',
  template: '<span class="badge badge-${variant}"><slot></slot></span>',
  dependencies: [shadowCSS(styles)],
  shadowOptions: { mode: 'open' }
})
export class SimpleBadge {
  @bindable variant: 'info' | 'success' = 'info';
}
```

### When to Use Each Approach

#### Use Convention-Based When:
- Building application-specific plugins
- Working in a controlled bundler environment
- Want minimal boilerplate code
- Following standard Aurelia project structure

#### Use Explicit Imports When:
- Building UI libraries for distribution
- Need precise control over dependencies
- Supporting multiple bundler configurations
- Want explicit dependency management
- Building plugins for npm distribution

### TypeScript Support

For explicit imports, provide proper TypeScript declarations:

```typescript
// types/assets.d.ts
declare module '*.html' {
  const template: string;
  export default template;
}

declare module '*.css' {
  const styles: string;
  export default styles;
}

declare module '*.module.css' {
  const styles: Record<string, string>;
  export default styles;
}
```

### Plugin Template Recommendations

For UI library plugins, structure your components like this:

```typescript
// src/components/button/au-button.ts
import { customElement, bindable, shadowCSS } from '@aurelia/runtime-html';
import template from './au-button.html?raw';
import styles from './au-button.css';

@customElement({
  name: 'au-button',
  template,
  dependencies: [shadowCSS(styles)],
  shadowOptions: { mode: 'open' }
})
export class AuButton {
  @bindable variant: 'primary' | 'secondary' | 'success' | 'danger' = 'primary';
  @bindable size: 'sm' | 'md' | 'lg' = 'md';
  @bindable disabled: boolean = false;
  @bindable loading: boolean = false;
}

// src/index.ts - Plugin entry point
import { IContainer } from '@aurelia/kernel';
import { AuButton } from './components/button/au-button';
import { AuCard } from './components/card/au-card';

export const UILibraryPlugin = {
  register(container: IContainer): void {
    container.register(
      AuButton,
      AuCard
      // ... other components
    );
  }
};

// Export individual components for selective registration
export { AuButton, AuCard };
```

This approach provides maximum flexibility for consumers while maintaining clean plugin architecture.

## Advanced Plugin Patterns

### Conditional Resource Registration

```typescript
export const ConditionalPlugin = {
  register(container: IContainer): void {
    const isProduction = process.env.NODE_ENV === 'production';

    // Always register core resources
    container.register(CoreService, CoreComponent);

    // Conditionally register development-only resources
    if (!isProduction) {
      container.register(DebugPanel, DevTools);
    }

    // Conditionally register based on feature flags
    const features = container.get(IFeatureFlags);
    if (features.isEnabled('new-ui')) {
      container.register(NewUIComponents);
    }
  }
};
```

### Plugin with Dynamic Imports

```typescript
export const LazyPlugin = {
  register(container: IContainer): void {
    container.register(
      AppTask.hydrating(IContainer, async (container) => {
        // Load heavy dependencies only when needed
        const config = container.get(IAppConfig);

        if (config.enableCharts) {
          const { ChartComponents } = await import('./chart-components');
          container.register(...ChartComponents);
        }

        if (config.enableMaps) {
          const { MapComponents } = await import('./map-components');
          container.register(...MapComponents);
        }
      })
    );
  }
};
```

### Plugin Composition

```typescript
// Compose multiple smaller plugins into a larger one
export const UILibraryPlugin = {
  register(container: IContainer): void {
    container.register(
      ButtonPlugin,
      ModalPlugin,
      FormPlugin,
      NavigationPlugin
    );
  }
};
```

## Best Practices

### Naming Conventions

- **Plugin Names**: Use descriptive names ending with "Plugin" or "Configuration"
- **Interfaces**: Prefix with "I" and use `DI.createInterface()`
- **Resources**: Prefix with your plugin name to avoid collisions

```typescript
// Good
export const ChartPlugin = { /* ... */ };
export const IChartOptions = DI.createInterface<ChartOptions>('IChartOptions');
export class ChartBarElement { /* ... */ }
export class ChartLineElement { /* ... */ }

// Avoid
export const Plugin = { /* ... */ };
export class BarElement { /* ... */ } // Too generic
```

### Error Handling

```typescript
export const RobustPlugin = {
  register(container: IContainer): void {
    try {
      // Register core functionality
      container.register(CoreService);

      // Optional enhancements
      try {
        const optionalService = container.get(IOptionalDependency);
        container.register(EnhancedFeature);
      } catch {
        // Gracefully degrade if optional dependency is missing
        container.register(BasicFeature);
      }
    } catch (error) {
      console.error('Failed to register plugin:', error);
      throw new Error('Plugin registration failed. Please check your configuration.');
    }
  }
};
```

### TypeScript Integration

```typescript
// Export types for consumer convenience
export type { MyPluginOptions, IMyPluginService };

// Provide type-safe configuration
export interface IMyPluginBuilder {
  withTheme(theme: 'light' | 'dark'): IMyPluginBuilder;
  withLocale(locale: string): IMyPluginBuilder;
  build(): IRegistry;
}
```

## Testing Plugins

### Unit Testing Plugin Registration

```typescript
// plugin.spec.ts
import { DI } from '@aurelia/kernel';
import { TestContext } from '@aurelia/testing';
import { MyPlugin, IMyPluginOptions } from './my-plugin';

describe('MyPlugin', () => {
  let container: IContainer;

  beforeEach(() => {
    const ctx = TestContext.create();
    container = ctx.container;
  });

  it('registers with default options', () => {
    container.register(MyPlugin);

    const options = container.get(IMyPluginOptions);
    expect(options.greeting).toBe('Hello');
  });

  it('registers with custom options', () => {
    container.register(
      MyPlugin.customize(options => {
        options.greeting = 'Bonjour';
      })
    );

    const options = container.get(IMyPluginOptions);
    expect(options.greeting).toBe('Bonjour');
  });
});
```

## Packaging and Distribution

### Package Structure

```
my-aurelia-plugin/
├── src/
│   ├── index.ts          # Main plugin export
│   ├── components/       # Custom elements
│   ├── attributes/       # Custom attributes
│   ├── services/         # Injectable services
│   └── interfaces.ts     # Type definitions
├── dist/                 # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

### Package.json Configuration

```json
{
  "name": "@my-org/aurelia-plugin",
  "version": "1.0.0",
  "main": "dist/cjs/index.js",
  "module": "dist/esm/index.js",
  "types": "dist/types/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js",
      "types": "./dist/types/index.d.ts"
    }
  },
  "peerDependencies": {
    "aurelia": "^2.0.0"
  },
  "keywords": ["aurelia", "plugin", "ui"],
  "files": ["dist"]
}
```

### Mono-Repository Setup

For complex plugins with multiple packages, consider using a workspace:

```json
{
  "name": "@my-org/ui-library",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces",
    "test": "npm test --workspaces",
    "lint": "eslint packages/*/src/**/*.ts"
  }
}
```

Directory structure:
```
my-ui-library/
├── packages/
│   ├── core/             # Core plugin
│   ├── charts/           # Chart components
│   ├── forms/            # Form components
│   └── themes/           # Theme packages
├── examples/             # Example applications
├── docs/                 # Documentation
└── package.json
```

This setup allows you to:
- Share common dependencies
- Cross-reference packages easily
- Build and test everything together
- Publish individual packages as needed

## Extending the Rendering Pipeline

Public exports from `@aurelia/runtime-html` make it possible to hook into Aurelia’s renderer without forking the framework. This is essential for plugins that add new template syntax, hydrate components into foreign DOM environments, or need to precompile custom elements on the fly.

### Register Custom Instruction Renderers

`IRenderer` implementations are discovered through the `@renderer` decorator. Each renderer receives the instruction at hydration time, so you can translate custom compiler output into DOM mutations.

```typescript
import { renderer, type IRenderer, IHydratableController } from '@aurelia/runtime-html';
import type { IInstruction } from '@aurelia/template-compiler';
import { ITranslationService } from './i18n-service';

interface TranslateInstruction extends IInstruction {
  type: 'translate';
  key: string;
}

@renderer
export class TranslateRenderer implements IRenderer {
  public readonly target = 'translate';

  public render(
    controller: IHydratableController,
    target: Element,
    instruction: TranslateInstruction
  ) {
    const i18n = controller.container.get(ITranslationService);
    target.textContent = i18n.translate(instruction.key);
  }
}
```

Once registered (for example via `Aurelia.register(TranslateRenderer)` or `StandardConfiguration.customize({ resources: [TranslateRenderer] })`), any instruction whose `type` matches `TranslateRenderer.target` is routed through your plugin. Combine this with a binding command or template compiler hook to emit `translate` instructions from HTML like `<span t="nav.home"></span>`.

### Use `IRendering` for Dynamic Definitions

Plugins that generate `PartialCustomElementDefinition` objects at runtime can inject `IRendering` to compile them, create node sequences, or materialize `ViewFactory` instances on demand.

```typescript
import { IRendering, CustomElement } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';

export class MarkdownBridge {
  private readonly rendering = resolve(IRendering);

  compile(template: string) {
    const definition = CustomElement.define({
      name: `markdown-view-${crypto.randomUUID()}`,
      template
    });

    return this.rendering.getViewFactory(definition, resolve(IContainer));
  }
}
```

`IRendering.createNodes()` returns reusable `FragmentNodeSequence` instances, letting you build headless renderers that project Aurelia content into other host libraries without going through standard component bootstrapping.

### Provide Host Nodes via `registerHostNode`

If you hydrate Aurelia components into DOM nodes created by another framework (for example, inside a CMS widget or micro-frontend shell), call `registerHostNode(container, host)` so that DI can resolve `HTMLElement`, `Element`, or `INode` within that scope.

```typescript
import { registerHostNode, Aurelia } from '@aurelia/runtime-html';

const host = document.querySelector('#cms-slot');
const au = new Aurelia();

registerHostNode(au.container, host);
await au.app({ host, component: WidgetShell }).start();
```

This mirrors what the runtime does for the default app host and keeps resource lookups such as `resolve(IEventTarget)` or `resolve(IPlatform).HTMLElement` working even when the DOM comes from an embedded document or shadow root.

## Summary

Building Aurelia plugins involves:

1. **Basic Structure**: Implement the `register` method pattern
2. **Configuration**: Use `DI.createInterface()` and the `.customize()` pattern
3. **Lifecycle Integration**: Leverage `AppTask` for initialization and cleanup
4. **Rendering Extensions**: Reach for `IRenderer`, `IRendering`, and `registerHostNode` when you need custom instructions or alternate hosts
5. **Best Practices**: Follow naming conventions, handle errors gracefully, and provide TypeScript support
6. **Testing**: Write comprehensive tests for registration and functionality
7. **Distribution**: Package properly for npm distribution

By following these patterns and practices, you can create robust, reusable plugins that integrate seamlessly with the Aurelia ecosystem.
