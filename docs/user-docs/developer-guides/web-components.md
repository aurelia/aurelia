---
description: The basics of the web-component plugin for Aurelia.
---

# Web Components

## Introduction

Web Components are part of an ever-evolving web specification that aims to allow developers to create native self-contained components without the need for additional libraries or transpilation steps. This guide will teach you how to use Aurelia to create Web Components that can be used in any framework or vanilla JavaScript application.

## Installing The Plugin

To use the web components functionality, you need to install the `@aurelia/web-components` package:

```bash
npm install @aurelia/web-components
```

The package provides the `IWcElementRegistry` interface which allows you to define web-component custom elements by calling the `define` method.

## Basic Setup

To use web components in your Aurelia application, import the `IWcElementRegistry` interface from `@aurelia/web-components` and register your web components:

```typescript
import { Aurelia, AppTask } from 'aurelia';
import { IWcElementRegistry } from '@aurelia/web-components';

Aurelia
  .register(
    AppTask.creating(IWcElementRegistry, registry => {
      // Define your web components here
      registry.define('my-element', class MyElement {
        static template = '<p>Hello from Web Component!</p>';
      });
    })
  )
  .app(class App {})
  .start();
```

## API Reference

The `IWcElementRegistry.define` method has the following signatures:

```typescript
interface IWcElementRegistry {
  define(name: string, def: Constructable, options?: ElementDefinitionOptions): Constructable<HTMLElement>;
  define(name: string, def: Omit<PartialCustomElementDefinition, 'name'>, options?: ElementDefinitionOptions): Constructable<HTMLElement>;
}
```

### Parameters

- **name**: The custom element name (must contain a hyphen `-` as per Web Components specification)
- **def**: Either a class constructor or an object with element definition properties
- **options**: Optional configuration for extending built-in elements

## How it works

* Each web component custom element is backed by an Aurelia view model, like a normal Aurelia component.
* For each `define` call, a corresponding native custom element class is created and registered with the browser's `customElements` registry.
* Each bindable property on the backing Aurelia view model is converted to a reactive attribute (via `observedAttributes`) and reactive property on the custom element.
* The web component uses standard Web Components lifecycle callbacks (`connectedCallback`, `disconnectedCallback`, `attributeChangedCallback`, `adoptedCallback`).
* **Regular custom elements**: Used as `<my-element></my-element>` in HTML.
* **Extended built-in elements**: Used as `<button is="my-button"></button>` in HTML with the `is` attribute.

### Important Notes

* Web component custom elements work independently of Aurelia components. The same class can be both a web component and an Aurelia component, though this should be avoided to prevent double rendering.
* `containerless` mode is not supported. Use extend-built-in functionality instead if you want to avoid wrapper elements.
* Defined web components continue working even after the owning Aurelia application has stopped.
* `template` and `bindables` information is retrieved and compiled only once per `define` call. Changes after this call have no effect.
* Slot: `[au-slot]` is not supported when upgrading existing elements. Standard `<slot>` elements work as normal web components.

## Examples

{% hint style="info" %}
For simplicity, all examples below define elements at application start, but they can be defined at any time after the container is available.
{% endhint %}

### 1. Basic Web Component

```typescript
import { Aurelia, AppTask } from 'aurelia';
import { IWcElementRegistry } from '@aurelia/web-components';

Aurelia
  .register(
    AppTask.creating(IWcElementRegistry, registry => {
      registry.define('hello-world', class HelloWorld {
        static template = '<h1>Hello, Web Components!</h1>';
      });
    })
  )
  .app(class App {})
  .start();

// Usage in HTML: <hello-world></hello-world>
```

### 2. Web Component with Bindable Properties

```typescript
import { Aurelia, AppTask } from 'aurelia';
import { IWcElementRegistry } from '@aurelia/web-components';

Aurelia
  .register(
    AppTask.creating(IWcElementRegistry, registry => {
      registry.define('user-greeting', class UserGreeting {
        static template = '<p>Hello, ${name}! You are ${age} years old.</p>';
        static bindables = ['name', 'age'];

        name: string = 'World';
        age: number = 0;
      });
    })
  )
  .app(class App {})
  .start();

// Usage in HTML:
// <user-greeting name="John" age="25"></user-greeting>
// Or programmatically:
// const element = document.createElement('user-greeting');
// element.name = 'Jane';
// element.age = 30;
```

### 3. Web Component with Shadow DOM

```typescript
import { Aurelia, AppTask } from 'aurelia';
import { IWcElementRegistry } from '@aurelia/web-components';

Aurelia
  .register(
    AppTask.creating(IWcElementRegistry, registry => {
      registry.define('shadow-element', class ShadowElement {
        static template = `
          <style>
            p { color: blue; font-weight: bold; }
          </style>
          <p>This is styled within Shadow DOM</p>
        `;
        static shadowOptions = { mode: 'open' };
      });
    })
  )
  .app(class App {})
  .start();
```

### 4. Web Component with Lifecycle and Host Injection

```typescript
import { Aurelia, AppTask } from 'aurelia';
import { IWcElementRegistry } from '@aurelia/web-components';
import { INode } from 'aurelia';

Aurelia
  .register(
    AppTask.creating(IWcElementRegistry, registry => {
      registry.define('tick-clock', class TickClock {
        static template = '${message}';
        static inject = [INode];

        private time: number;
        private intervalId: number;
        message: string = '';

        constructor(private host: HTMLElement) {
          this.time = Date.now();
        }

        attaching() {
          this.intervalId = setInterval(() => {
            this.message = `${Math.floor((Date.now() - this.time) / 1000)} seconds passed.`;
          }, 1000);
        }

        detaching() {
          clearInterval(this.intervalId);
        }
      });
    })
  )
  .app(class App {})
  .start();
```

### 5. Web Component with Object Definition

```typescript
import { Aurelia, AppTask } from 'aurelia';
import { IWcElementRegistry } from '@aurelia/web-components';

Aurelia
  .register(
    AppTask.creating(IWcElementRegistry, registry => {
      registry.define('simple-card', {
        template: `
          <div class="card">
            <h2>\${title}</h2>
            <p>\${content}</p>
          </div>
        `,
        bindables: ['title', 'content'],
        shadowOptions: { mode: 'open' }
      });
    })
  )
  .app(class App {})
  .start();
```

### 6. Extending Built-in Elements

When extending built-in elements, you use the `{ extends: 'element-name' }` option and reference them in HTML using the `is` attribute:

```typescript
import { Aurelia, AppTask } from 'aurelia';
import { IWcElementRegistry } from '@aurelia/web-components';

Aurelia
  .register(
    AppTask.creating(IWcElementRegistry, registry => {
      // Extend a button element
      registry.define('enhanced-button', class EnhancedButton {
        static template = '<span>🚀</span> <slot></slot>';
        static bindables = ['variant'];

        variant: string = 'primary';
      }, { extends: 'button' });

      // Extend a paragraph element
      registry.define('rich-paragraph', class RichParagraph {
        static template = '<strong>${title}</strong>: ${content}';
        static bindables = ['title', 'content'];

        title: string = '';
        content: string = '';
      }, { extends: 'p' });
    })
  )
  .app(class App {})
  .start();

// Usage in HTML:
// <button is="enhanced-button" variant="secondary">Click Me</button>
// <p is="rich-paragraph" title="Note" content="This is enhanced content"></p>
```

### 7. Web Component with Advanced Features

```typescript
import { Aurelia, AppTask } from 'aurelia';
import { IWcElementRegistry } from '@aurelia/web-components';
import { INode, ILogger } from 'aurelia';

Aurelia
  .register(
    AppTask.creating(IWcElementRegistry, registry => {
      registry.define('data-display', class DataDisplay {
        static template = `
          <div class="loading" if.bind="loading">Loading...</div>
          <div class="content" else>
            <h3>\${title}</h3>
            <div repeat.for="item of items">
              <p>\${item.name}: \${item.value}</p>
            </div>
          </div>
        `;
        static bindables = ['url', 'title'];
        static inject = [INode, ILogger];

        url: string = '';
        title: string = 'Data';
        loading: boolean = false;
        items: Array<{name: string, value: string}> = [];

        constructor(
          private host: HTMLElement,
          private logger: ILogger
        ) {}

        async urlChanged(newUrl: string) {
          if (!newUrl) return;

          this.loading = true;
          try {
            const response = await fetch(newUrl);
            const data = await response.json();
            this.items = data.items || [];
            this.logger.info(`Loaded ${this.items.length} items`);
          } catch (error) {
            this.logger.error('Failed to load data', error);
            this.items = [];
          } finally {
            this.loading = false;
          }
        }
      });
    })
  )
  .app(class App {})
  .start();
```

## Error Handling and Validation

The web components implementation includes built-in validation:

### Invalid Element Names

```typescript
// This will throw an error because element names must contain a hyphen
registry.define('myelement', class MyElement {}); // ❌ Error!

// This works
registry.define('my-element', class MyElement {}); // ✅ Correct!
```

### Containerless Components

```typescript
// This will throw an error because containerless is not supported
registry.define('my-element', class MyElement {
  static containerless = true; // ❌ Error!
});

// Use extend-built-in instead if you need to avoid wrapper elements
registry.define('enhanced-span', class MyElement {
  static template = '<span>Content</span>';
}, { extends: 'span' }); // ✅ Alternative approach

// Usage in HTML: <span is="enhanced-span">Content</span>
```

## Usage Outside Aurelia Applications

Web components defined with Aurelia can be used in any context:

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <script src="./aurelia-web-components-bundle.js"></script>
</head>
<body>
  <!-- Use regular web components -->
  <user-greeting name="John" age="25"></user-greeting>

  <!-- Use extended built-in elements -->
  <button is="enhanced-button" variant="primary">Click Me</button>

  <script>
    // Create regular web components programmatically
    const greeting = document.createElement('user-greeting');
    greeting.name = 'Jane';
    greeting.age = 30;
    document.body.appendChild(greeting);

    // Create extended built-in elements programmatically
    const enhancedBtn = document.createElement('button', { is: 'enhanced-button' });
    enhancedBtn.variant = 'secondary';
    enhancedBtn.textContent = 'Dynamic Button';
    document.body.appendChild(enhancedBtn);
  </script>
</body>
</html>
```

### React Integration

```jsx
import React from 'react';

function App() {
  return (
    <div>
      <h1>React App with Aurelia Web Components</h1>
      <user-greeting name="React User" age="25" />
      {/* For extended built-in elements: */}
      <button is="enhanced-button" variant="primary">Enhanced Button</button>
    </div>
  );
}
```

### Angular Integration

```typescript
// app.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
```

```html
<!-- app.component.html -->
<user-greeting name="Angular User" [attr.age]="userAge"></user-greeting>
<!-- For extended built-in elements: -->
<button is="enhanced-button" variant="primary">Enhanced Button</button>
```

## Best Practices

1. **Element Naming**: Always use kebab-case with at least one hyphen for element names.

2. **Property Binding**: Define bindable properties explicitly using the `bindables` array for reactive updates.

3. **Shadow DOM**: Use Shadow DOM for style encapsulation when your component has its own styles.

4. **Lifecycle Management**: Implement `attaching` and `detaching` lifecycle methods for setup and cleanup.

5. **Error Handling**: Always handle errors gracefully, especially in async operations.

6. **Performance**: Remember that web components are created for each instance, so avoid heavy operations in constructors.

7. **Dependencies**: Keep dependencies minimal since web components should be self-contained.

8. **Extended Built-ins**: When extending built-in elements, remember to use the `is` attribute in HTML (`<button is="my-button">`) rather than creating new element names.

This enhanced documentation provides a complete guide to creating and using Aurelia-powered Web Components with accurate examples and proper error handling.
