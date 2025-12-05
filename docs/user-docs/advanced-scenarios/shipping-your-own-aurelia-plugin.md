---
description: Learn how to build, package, and distribute production-ready Aurelia plugins that extend the framework and can be shared across applications.
---

# Shipping Your Own Aurelia Plugin

Building plugins is how you extend Aurelia's functionality and create reusable packages that can be shared across multiple applications or with the wider community. Whether you're creating a UI component library, adding framework capabilities, or integrating third-party services, plugins are the standard way to distribute Aurelia enhancements.

## Why This Is an Advanced Scenario

Plugin development requires mastery of:
- **Aurelia's dependency injection system** - Service registration and resolution
- **Lifecycle management** - App tasks and initialization hooks
- **Configuration patterns** - Providing customizable plugin options
- **Resource registration** - Custom elements, attributes, value converters, binding behaviors
- **Rendering pipeline** - Custom instruction renderers and template compilation
- **Distribution strategies** - Packaging, versioning, and publishing to npm
- **TypeScript integration** - Type definitions and module exports
- **Testing strategies** - Unit testing plugin registration and functionality

Advanced plugins often involve:
- Multi-package monorepo setups
- Dynamic resource loading
- Custom template syntax extensions
- Integration with external libraries
- Performance optimization for production use

## Complete Guide

For comprehensive documentation on building plugins, including:
- Minimal plugin structure and registration
- Adding components and resources
- Configurable plugins with `.customize()` pattern
- Working with App Tasks (lifecycle hooks)
- Template and style handling strategies
- Real-world plugin examples (router-like, validation-like)
- Extending the rendering pipeline
- Advanced patterns (conditional registration, dynamic imports, composition)
- Best practices and naming conventions
- Testing strategies
- Packaging and distribution for npm

**See the complete guide:** [Building Plugins](../developer-guides/building-plugins.md)

## Quick Example

### Basic Plugin

```typescript
// my-plugin.ts
import { IContainer } from '@aurelia/kernel';

export const MyPlugin = {
  register(container: IContainer): void {
    // Register your resources
    container.register(
      MyCustomElement,
      MyValueConverter,
      MyBindingBehavior
    );
  }
};
```

### Using Your Plugin

```typescript
// main.ts
import { Aurelia } from 'aurelia';
import { MyPlugin } from './my-plugin';

Aurelia
  .register(MyPlugin)
  .app(MyApp)
  .start();
```

### Configurable Plugin

```typescript
import { DI, IContainer } from '@aurelia/kernel';

export interface MyPluginOptions {
  theme?: 'light' | 'dark';
  apiKey?: string;
}

const defaultOptions: MyPluginOptions = {
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
        MyComponent
      );
    },
    customize(cb: (options: MyPluginOptions) => void) {
      return createConfiguration(cb);
    }
  };
}

export const MyPlugin = createConfiguration(() => {});
```

### Using Configurable Plugin

```typescript
Aurelia
  .register(
    MyPlugin.customize(options => {
      options.theme = 'dark';
      options.apiKey = 'your-api-key';
    })
  )
  .app(MyApp)
  .start();
```

## What You'll Learn

The full guide covers:

1. **Plugin Architecture** - Understanding the registration pattern
2. **Minimal Plugins** - Creating your first plugin
3. **Resource Registration** - Custom elements, attributes, converters
4. **Configuration** - The `.customize()` pattern
5. **Lifecycle Hooks** - App tasks for initialization and cleanup
6. **Template Handling** - Convention-based vs. explicit imports
7. **Styling Strategies** - Light DOM, Shadow DOM, CSS Modules
8. **Real-World Examples** - Router-like and validation-like structures
9. **Rendering Pipeline** - Custom instruction renderers
10. **Advanced Patterns** - Conditional registration, dynamic imports, composition
11. **Best Practices** - Naming, error handling, TypeScript integration
12. **Testing** - Unit testing registration and functionality
13. **Distribution** - Packaging for npm and monorepo setups

## Plugin Types

### Component Library Plugin
Provides reusable UI components:
```typescript
export const UILibraryPlugin = {
  register(container: IContainer): void {
    container.register(
      Button,
      Modal,
      Dropdown,
      DataTable
    );
  }
};
```

### Service Integration Plugin
Integrates external services:
```typescript
export const AnalyticsPlugin = {
  register(container: IContainer): void {
    container.register(
      AnalyticsService,
      TrackingDirective,
      AppTask.activated(IAnalytics, analytics => analytics.init())
    );
  }
};
```

### Template Extension Plugin
Adds new template syntax:
```typescript
@renderer
export class I18nRenderer implements IRenderer {
  public readonly target = 'i18n';

  public render(controller, target, instruction) {
    const i18n = controller.container.get(II18nService);
    target.textContent = i18n.translate(instruction.key);
  }
}
```

## Package Structure for Distribution

```
my-aurelia-plugin/
├── src/
│   ├── index.ts          # Main plugin export
│   ├── components/       # Custom elements
│   ├── services/         # Injectable services
│   └── types.ts          # Type definitions
├── dist/                 # Compiled output
│   ├── cjs/              # CommonJS
│   ├── esm/              # ES Modules
│   └── types/            # TypeScript declarations
├── package.json
├── tsconfig.json
├── README.md
└── LICENSE
```

## Package.json for npm

```json
{
  "name": "@your-org/aurelia-plugin",
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
  "keywords": ["aurelia", "plugin", "aurelia2"],
  "files": ["dist", "README.md", "LICENSE"]
}
```

## Publishing Checklist

Before publishing your plugin:

- [ ] **Functionality** - All features work as expected
- [ ] **Tests** - Comprehensive test coverage
- [ ] **Documentation** - README with installation and usage instructions
- [ ] **TypeScript** - Type definitions included
- [ ] **Examples** - Working example app or code samples
- [ ] **Licensing** - LICENSE file included
- [ ] **Versioning** - Semantic versioning (semver)
- [ ] **Peer Dependencies** - Correct Aurelia version specified
- [ ] **Build Output** - Both CJS and ESM formats
- [ ] **Package Size** - Optimized bundle size
- [ ] **Keywords** - Searchable npm keywords

## Community Best Practices

- **Name clearly** - Use descriptive names (e.g., `aurelia-charts`, `aurelia-i18n`)
- **Prefix resources** - Avoid naming collisions with other plugins
- **Document thoroughly** - Include API docs, examples, and migration guides
- **Support TypeScript** - Provide full type definitions
- **Test extensively** - Cover all registration scenarios
- **Version carefully** - Follow semantic versioning strictly
- **Maintain actively** - Respond to issues, update dependencies
- **License appropriately** - Use MIT or similar permissive license

## Real-World Plugin Examples

The Aurelia ecosystem includes many high-quality plugins you can learn from:

- **@aurelia/router** - Routing and navigation
- **@aurelia/validation** - Form validation
- **@aurelia/fetch-client** - HTTP client
- **@aurelia/dialog** - Modal dialogs
- **@aurelia/store** - State management
- **@aurelia/i18n** - Internationalization

Study these for patterns, architecture, and best practices.

---

**Ready to build your plugin?** Head to the [complete Building Plugins guide](../developer-guides/building-plugins.md).

