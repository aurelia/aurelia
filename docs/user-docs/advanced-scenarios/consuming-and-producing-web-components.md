---
description: Learn how to create framework-agnostic Web Components with Aurelia and integrate them into any web application or framework.
---

# Consuming and Producing Web Components

Web Components are a set of web platform standards that allow you to create reusable, encapsulated custom elements that work across any framework—or no framework at all. Aurelia provides first-class support for both **creating** Web Components from Aurelia components and **consuming** third-party Web Components in your Aurelia applications.

## Why This Is an Advanced Scenario

Web Components are essential for:
- **Framework-agnostic libraries** - Share components across React, Vue, Angular, and vanilla JS
- **Micro-frontends** - Build independent, composable UI modules
- **Design systems** - Create reusable component libraries for enterprise applications
- **Legacy integration** - Embed modern components in older applications
- **Progressive enhancement** - Upgrade existing HTML with custom behavior

Advanced considerations include:
- Shadow DOM encapsulation strategies
- Lifecycle coordination between Aurelia and Web Components
- Property vs. attribute binding
- Event bubbling across shadow boundaries
- Performance implications of custom elements
- Browser compatibility and polyfills

## Complete Guide

For comprehensive documentation on Web Components in Aurelia, including:
- Installing the `@aurelia/web-components` plugin
- Creating basic and advanced Web Components
- Shadow DOM configuration
- Bindable properties and attributes
- Lifecycle management
- Extending built-in elements
- Using Web Components in React, Vue, Angular
- Error handling and validation
- Best practices

**See the complete guide:** [Web Components](../developer-guides/web-components.md)

## Quick Example

### Creating a Web Component with Aurelia

```typescript
// main.ts
import { Aurelia, AppTask } from 'aurelia';
import { IWcElementRegistry } from '@aurelia/web-components';

Aurelia
  .register(
    AppTask.creating(IWcElementRegistry, registry => {
      registry.define('user-card', class UserCard {
        static template = `
          <div class="card">
            <h2>\${name}</h2>
            <p>\${title}</p>
            <p>\${email}</p>
          </div>
        `;
        static bindables = ['name', 'title', 'email'];

        name = '';
        title = '';
        email = '';
      });
    })
  )
  .app(class App {})
  .start();
```

### Using It Anywhere

```html
<!-- In vanilla HTML -->
<user-card name="Jane Doe" title="Developer" email="jane@example.com"></user-card>

<!-- In React -->
<user-card name="Jane Doe" title="Developer" email="jane@example.com" />

<!-- In Vue -->
<user-card :name="user.name" :title="user.title" :email="user.email"></user-card>

<!-- Programmatically -->
<script>
  const card = document.createElement('user-card');
  card.name = 'Jane Doe';
  card.title = 'Developer';
  card.email = 'jane@example.com';
  document.body.appendChild(card);
</script>
```

## Key Concepts

### Creating Web Components
- Define custom elements using `IWcElementRegistry.define()`
- Use standard Aurelia component syntax (bindables, lifecycle, DI)
- Configure Shadow DOM for style encapsulation
- Extend built-in HTML elements

### Consuming Web Components
- Import and register third-party components
- Use standard HTML syntax in Aurelia templates
- Bind to properties using `.bind` syntax
- Handle custom events with `.trigger`

### Shadow DOM
- Encapsulate styles within components
- Choose `open` or `closed` shadow mode
- Use `<slot>` for content projection
- Understand styling boundaries

### Property Binding
- Bindables become reactive properties
- Attributes automatically sync with properties
- Use `observedAttributes` for change detection
- Handle complex object and array binding

## What You'll Learn

The full guide covers:

1. **Installation & Setup** - Adding Web Components support to your project
2. **Basic Web Components** - Creating your first custom element
3. **Bindable Properties** - Making components configurable
4. **Shadow DOM** - Style encapsulation and isolation
5. **Lifecycle Hooks** - Component initialization and cleanup
6. **Host Injection** - Accessing the custom element's host
7. **Advanced Features** - Dynamic templates, DI, and more
8. **Extending Built-ins** - Enhancing native HTML elements
9. **Framework Integration** - Using in React, Vue, Angular
10. **Error Handling** - Validation and debugging
11. **Best Practices** - Performance, naming, and architecture

## Use Cases

### Design System Component Library
```typescript
registry.define('ds-button', ButtonComponent);
registry.define('ds-input', InputComponent);
registry.define('ds-modal', ModalComponent);
// Use across all company applications
```

### Micro-Frontend Architecture
```typescript
// Team A builds a shopping cart
registry.define('shop-cart', ShoppingCart);

// Team B builds product catalog
registry.define('product-list', ProductList);

// Compose in any application
```

### Progressive Enhancement
```html
<!-- Enhance existing HTML -->
<button is="enhanced-button" variant="primary">
  Click Me
</button>
```

## Browser Support

Web Components are supported in all modern browsers:
- **Chrome/Edge**: Full native support
- **Firefox**: Full native support
- **Safari**: Full native support

For legacy browsers, polyfills are available via `@webcomponents/webcomponentsjs`.

## Performance Considerations

- Web Components are lightweight when created with Aurelia
- Shadow DOM adds minimal overhead
- Component registry is one-time setup cost
- DOM recycling happens automatically
- Consider lazy loading for large component libraries

---

**Ready to build framework-agnostic components?** Head to the [complete Web Components guide](../developer-guides/web-components.md).

