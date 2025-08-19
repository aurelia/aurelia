# Components

Components are the fundamental building blocks of Aurelia applications. A component consists of a view-model (TypeScript class) and an optional view (HTML template) that work together to create reusable UI elements.

## Basic Component Structure

Every Aurelia component starts with a simple class:

```typescript
export class MyComponent {
  message = 'Hello from Aurelia!';
}
```

And its corresponding HTML template:

```html
<h1>${message}</h1>
```

The `${message}` syntax creates a binding between your view-model property and the template, automatically updating the UI when the property changes.

## Custom Elements

To create reusable custom elements, use the `@customElement` decorator:

```typescript
import { customElement } from 'aurelia';

@customElement('hello-world')
export class HelloWorld {
  name = 'World';
}
```

```html
<h1>Hello, ${name}!</h1>
```

Now you can use `<hello-world></hello-world>` anywhere in your application.

## Bindable Properties

Make component properties configurable from the outside using `@bindable`:

```typescript
import { bindable } from 'aurelia';

export class UserCard {
  @bindable name: string;
  @bindable email: string;
  @bindable avatar: string;
}
```

```html
<div class="user-card">
  <img src.bind="avatar" alt="Avatar">
  <h3>${name}</h3>
  <p>${email}</p>
</div>
```

Use the component by binding values to its properties:

```html
<user-card name.bind="user.name" email.bind="user.email" avatar.bind="user.avatar"></user-card>
```

## Component Lifecycle

Components have lifecycle hooks for initialization and cleanup:

```typescript
export class MyComponent {
  created() {
    // Component instance created
  }

  binding() {
    // Data binding about to occur
  }

  bound() {
    // Data binding completed
  }

  attached() {
    // Component attached to DOM
  }

  detached() {
    // Component removed from DOM
  }
}
```

## What's Next

- Learn more about [component lifecycles](../components/component-lifecycles.md)
- Explore [bindable properties](../components/bindable-properties.md) in detail
- Understand [shadow DOM and slots](../components/shadow-dom-and-slots.md) for advanced composition