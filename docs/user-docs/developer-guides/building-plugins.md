---
description: >-
  Aurelia makes it easy to create your plugins. Learn how to create
  individual plugins, register them, and work with tasks to run code during certain
  parts of the lifecycle process.
---

# Building Plugins

Aurelia plugins allow you to encapsulate functionality that can be reused across multiple applications. They can include custom elements, value converters, and other resources. The goal is to create packaged, easily shared, ready-to-use functionalities that integrate seamlessly with Aurelia applications.

## Minimal Plugin Example

### What a Plugin Is

At its core, a plugin in Aurelia is an object with a `register` method that configures dependencies and sets up your component or functionality for use in an Aurelia application.

### Simple Plugin Setup

```typescript
// my-simple-plugin.ts
import { IContainer } from '@aurelia/kernel';

export const MySimplePlugin = {
  register(container: IContainer): void {
    // Register your plugin resources here
  }
};
```

### Integrating the Plugin into Your Application

```typescript
// main.ts
import Aurelia from 'aurelia';
import { MySimplePlugin } from './my-simple-plugin';

Aurelia
  .register(MySimplePlugin)
  .app(MyApp)
  .start();
```

## Adding Components

You often want to add custom components to make your plugin more useful.

{% tabs %}
{% tab title="hello-world.ts" %}
```typescript
import { customElement } from '@aurelia/runtime-html';

@customElement({
  name: 'hello-world',
  template: '<div>Hello, ${name}!</div>'
})
export class HelloWorld {
  name = 'World';
}
```
{% endtab %}

{% tab title="my-component-plugin.ts" %}
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
{% endtab %}
{% endtabs %}

## Creating a Configurable Plugin

### Define Configuration Interface

```typescript
// plugin-configuration.ts
export interface MyPluginOptions {
  greeting?: string;
  debug?: boolean;
}

const defaultOptions: MyPluginOptions = {
  greeting: 'Hello',
  debug: false
};
```

### Implement Configuration in Plugin

{% tabs %}
{% tab title="plugin-configuration.ts" %}
```typescript
export interface MyPluginOptions {
  greeting?: string;
  debug?: boolean;
}

const defaultOptions: MyPluginOptions = {
  greeting: 'Hello', // default greeting
  debug: false       // default debug setting
};
```
{% endtab %}

{% tab title="my-configurable-plugin.ts" %}
```typescript
// my-configurable-plugin.ts
import { DI, IContainer, Registration } from '@aurelia/kernel';

export const IMyPluginOptions = DI.createInterface<MyPluginOptions>('IMyPluginOptions');

export const MyConfigurablePlugin = {
  configure(options: Partial<MyPluginOptions> = {}) {
    const finalOptions = { ...defaultOptions, ...options }; // Merge with defaults

    return {
      register(container: IContainer): void {
        container.register(
          Registration.instance(IMyPluginOptions, finalOptions) // Register configuration
        );
      }
    };
  }
};
```
{% endtab %}
{% endtabs %}

### Using the Configurable Plugin

```typescript
// main.ts
import Aurelia from 'aurelia';
import { MyConfigurablePlugin } from './my-configurable-plugin';

Aurelia
  .register(
    MyConfigurablePlugin.configure({
      greeting: 'Bonjour',
      debug: true
    })
  )
  .app(MyApp)
  .start();
```

### Accessing Configuration in a Component

```typescript
// greeting.ts
import { customElement } from '@aurelia/runtime-html';
import { resolve } from 'aurelia';
import { IMyPluginOptions } from './my-configurable-plugin';

@customElement({
  name: 'greeting',
  template: '<div>${options.greeting}, ${name}!</div>'
})
export class Greeting {
  name = 'World';

  private options = resolve(IMyPluginOptions); // Resolve the dependency
}
```

## Best Practices

- **Use Clear Naming Conventions**: Prefix your plugin resources with your plugin name to avoid naming collisions.
- **Provide Sensible Defaults**: Always have sensible default values when adding configuration options.
- **Document Plugin Usage**: Write clear documentation on how to use your plugin and its configurations.

## Advanced Features

Once you’ve mastered the basics of creating plugins, you may find that your needs evolve to require more complex functionality. This section covers advanced features in plugin development, such as advanced configuration management, lifecycle tasks, and mono-repository structures.

### Advanced Configuration Management

When your plugin settings are more intricate, consider adding more comprehensive configuration handling:

#### Dynamic Configuration

Plugins can adjust settings dynamically based on user input or environment conditions.

```typescript
// dynamic-configuration-plugin.ts
import { DI, IContainer, Registration } from '@aurelia/kernel';

export interface DynamicPluginOptions {
  mode: 'development' | 'production';
}

export const IDynamicPluginOptions = DI.createInterface<DynamicPluginOptions>('IDynamicPluginOptions');

export const DynamicPlugin = {
  configure(options: Partial<DynamicPluginOptions> = {}) {
    const environment = process.env.NODE_ENV || 'development';
    const finalOptions: DynamicPluginOptions = { 
      mode: environment, 
      ...options 
    };

    return {
      register(container: IContainer): void {
        container.register(
          Registration.instance(IDynamicPluginOptions, finalOptions)
        );
      }
    };
  }
};

// Usage
Aurelia
  .register(
    DynamicPlugin.configure({
      mode: 'production'
    })
  )
  .app(MyApp)
  .start();
```

### Plugin Lifecycle Management

Aurelia provides lifecycle hooks that you can hook into within your plugins to perform operations at specific times during the app’s startup process.

#### Using Lifecycle Tasks

```typescript
import { IContainer, AppTask } from '@aurelia/kernel';

const MyLifecyclePlugin = {
  register(container: IContainer): void {
    // Add tasks to run before or after different app stages
    container.register(
      AppTask.beforeStart(IContainer, () => {
        console.log('Plugin is initializing...');
      }),
      AppTask.afterStart(IContainer, () => {
        console.log('Plugin has finished initializing.');
      })
    );
  }
};
```

This approach is beneficial when your plugin needs to load data, configure services, or perform actions that require awareness of the application’s runtime state.

### Mono-Repository Structure

Maintaining individual repositories may become cumbersome for larger projects with multiple interrelated plugins. A mono-repository can simplify this by organizing multiple packages in a single repository.

#### Setting Up a Mono-Repository

1. **Directory Structure**
   ```
   my-mono-repo/
   ├── packages/
   │   ├── my-plugin-a/
   │   │   ├── src/
   │   │   ├── package.json
   │   │   └── ...
   │   ├── my-plugin-b/
   │   │   ├── src/
   │   │   ├── package.json
   │   │   └── ...
   └── package.json
   ```

2. **Top-level `package.json` Setup**
   ```json
   {
     "private": true,
     "workspaces": [
       "packages/*"
     ]
   }
   ```

3. **Link Dependencies**
   Use tools like `lerna` or native `npm` workspaces (`npm install -g lerna`).

   Initialize the repository:
   ```bash
   lerna init
   ```

   This setup helps maintain consistency, allows for easier inter-package dependencies, and simplifies testing across multiple plugins.
