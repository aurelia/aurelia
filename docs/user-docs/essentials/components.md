# Components

Components are the fundamental building blocks of Aurelia applications. A component consists of a view-model (TypeScript class) and an optional view (HTML template) that work together to create reusable UI elements.

## Basic Component Structure

Every Aurelia component starts with a simple class:

```typescript
export class MyComponent {
  message = 'Hello from Aurelia!';
}
```

And its corresponding HTML template (no `<template>` wrapper is needed in Aurelia 2):

```html
<h1>${message}</h1>
```

The `${message}` syntax creates a binding between your view-model property and the template, automatically updating the UI when the property changes.

## When to Create a Component?

Before creating a component, consider these guidelines:

### Create a component when:
- ✅ You need reusable UI that appears in multiple places
- ✅ The UI has its own behavior and state
- ✅ You want to encapsulate complexity (a component should do one thing well)
- ✅ The UI represents a meaningful concept in your domain (e.g., `<user-card>`, `<product-list>`)

### Use a custom attribute instead when:
- ✅ You're adding behavior to existing elements without changing structure
- ✅ You're creating a decorator or modifier (e.g., `tooltip`, `draggable`)
- ✅ Multiple behaviors can be combined on the same element
- ✅ Examples: `<button tooltip="Save changes">`, `<div draggable sortable>`

### Use a value converter when:
- ✅ You're just formatting data for display
- ✅ The transformation is pure (same input → same output)
- ✅ Examples: `${date | dateFormat}`, `${price | currency}`

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

## Using Components

After creating a component, you need to make it available for use. There are two ways to do this:

### Option 1: Import in Templates (Recommended for Most Cases)

Import the component where you need it using the `<import>` element:

```html
<import from="./hello-world"></import>

<div>
  <hello-world></hello-world>
</div>
```

This is the recommended approach because:
- Components are only loaded where they're used
- Better code organization and maintainability
- Clear dependencies in each template

### Option 2: Global Registration

Register components globally in your `main.ts` to use them anywhere without imports:

```typescript
import Aurelia from 'aurelia';
import { MyApp } from './my-app';
import { HelloWorld } from './hello-world';

Aurelia
  .register(HelloWorld)  // Register globally
  .app(MyApp)
  .start();
```

Now `<hello-world></hello-world>` works in any template without `<import>`.

**When to use global registration:**
- Components used on almost every page (headers, footers, layout components)
- Shared UI components used throughout the app
- Components you want available in all templates by default

**When to use local imports:**
- Feature-specific components
- Most custom components
- Better tree-shaking and bundle optimization

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

## Common Component Patterns

### Pattern: Container/Presenter (Smart/Dumb Components)

**Use case**: Separate data management from presentation logic.

**Container (Smart) Component** - Manages data and business logic:

```typescript
import { resolve } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';

export class UserListPage {
  private router = resolve(IRouter);
  users: User[] = [];
  isLoading = false;

  async binding() {
    this.isLoading = true;
    try {
      const response = await fetch('/api/users');
      this.users = await response.json();
    } finally {
      this.isLoading = false;
    }
  }

  viewUser(user: User) {
    this.router.load(`/users/${user.id}`);
  }

  deleteUser(user: User) {
    // Handle deletion
  }
}
```

```html
<div class="page">
  <h1>Users</h1>
  <loading-spinner if.bind="isLoading"></loading-spinner>

  <user-list
    users.bind="users"
    on-view.bind="(user) => viewUser(user)"
    on-delete.bind="(user) => deleteUser(user)">
  </user-list>
</div>
```

**Presenter (Dumb) Component** - Pure presentation, no data fetching:

```typescript
import { bindable } from 'aurelia';

export class UserList {
  @bindable users: User[];
  @bindable onView: (user: User) => void;
  @bindable onDelete: (user: User) => void;
}
```

```html
<div class="user-list">
  <div repeat.for="user of users" class="user-card">
    <h3>${user.name}</h3>
    <p>${user.email}</p>
    <button click.trigger="onView(user)">View</button>
    <button click.trigger="onDelete(user)">Delete</button>
  </div>
</div>
```

**Why this works**: Container components handle complexity (data, routing, state), while presenter components are simple, reusable, and easy to test. You can reuse `<user-list>` anywhere without worrying about data fetching.

### Pattern: Composition with Slots

**Use case**: Create flexible container components that accept custom content.

```typescript
export class Card {
  @bindable title: string;
  @bindable actions: boolean = false;
}
```

```html
<div class="card">
  <div class="card-header">
    <h2>${title}</h2>
  </div>

  <div class="card-body">
    <slot></slot> <!-- Main content goes here -->
  </div>

  <div class="card-footer" if.bind="actions">
    <slot name="actions"></slot> <!-- Named slot for actions -->
  </div>
</div>
```

**Usage:**

```html
<card title="User Profile" actions.bind="true">
  <!-- Default slot content -->
  <p>Name: ${user.name}</p>
  <p>Email: ${user.email}</p>

  <!-- Named slot content -->
  <button slot="actions" click.trigger="edit()">Edit</button>
  <button slot="actions" click.trigger="delete()">Delete</button>
</card>
```

**Why this works**: Slots make components flexible without needing dozens of bindable properties. The component controls the structure while consumers control the content.

### Pattern: Form Components with Two-Way Binding

**Use case**: Reusable form inputs that work seamlessly with parent form state.

```typescript
import { bindable, BindingMode } from 'aurelia';

export class FormInput {
  @bindable label: string;
  @bindable({ mode: BindingMode.twoWay }) value: string;
  @bindable type: string = 'text';
  @bindable required: boolean = false;
  @bindable error: string;
}
```

```html
<div class="form-group">
  <label>
    ${label}
    <span if.bind="required" class="required">*</span>
  </label>

  <input
    type.bind="type"
    value.bind="value"
    class="form-control ${error ? 'is-invalid' : ''}">

  <div class="error-message" if.bind="error">
    ${error}
  </div>
</div>
```

**Usage:**

```typescript
export class RegistrationForm {
  email: string = '';
  password: string = '';
  emailError: string;

  validateEmail() {
    this.emailError = this.email.includes('@') ? '' : 'Invalid email';
  }
}
```

```html
<form-input
  label="Email"
  value.bind="email"
  type="email"
  required.bind="true"
  error.bind="emailError"
  blur.trigger="validateEmail()">
</form-input>

<form-input
  label="Password"
  value.bind="password"
  type="password"
  required.bind="true">
</form-input>
```

**Why this works**: Two-way binding with `BindingMode.twoWay` keeps the parent and child in sync automatically. Changes in either place propagate to both.

### Pattern: Stateful UI Components

**Use case**: Components that manage their own internal state.

```typescript
import { bindable } from 'aurelia';

export class Accordion {
  @bindable items: AccordionItem[];
  expandedIndex: number | null = null;

  toggle(index: number) {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  isExpanded(index: number) {
    return this.expandedIndex === index;
  }
}
```

```html
<div class="accordion">
  <div repeat.for="item of items" class="accordion-item">
    <button
      class="accordion-header ${isExpanded($index) ? 'expanded' : ''}"
      click.trigger="toggle($index)">
      ${item.title}
    </button>

    <div class="accordion-content" show.bind="isExpanded($index)">
      ${item.content}
    </div>
  </div>
</div>
```

**Why this works**: The component owns its UI state (which item is expanded) while accepting data as props. This keeps the parent simple - it just provides data, not UI state.

### Pattern: Event-Emitting Components

**Use case**: Child components that notify parents of user actions.

```typescript
import { bindable } from 'aurelia';
import { resolve } from '@aurelia/kernel';
import { IEventAggregator } from '@aurelia/kernel';

export class SearchBox {
  @bindable placeholder: string = 'Search...';
  @bindable onSearch: (query: string) => void;

  private ea = resolve(IEventAggregator);
  query: string = '';

  handleSearch() {
    // Option 1: Callback binding
    if (this.onSearch) {
      this.onSearch(this.query);
    }

    // Option 2: Event aggregator (for loosely coupled components)
    this.ea.publish('search:query', this.query);
  }

  handleClear() {
    this.query = '';
    this.handleSearch();
  }
}
```

```html
<div class="search-box">
  <input
    value.bind="query"
    placeholder.bind="placeholder"
    keyup.trigger="handleSearch() & debounce:300">

  <button click.trigger="handleClear()" if.bind="query">
    Clear
  </button>
</div>
```

**Usage:**

```html
<!-- Using callback -->
<search-box on-search.bind="(query) => performSearch(query)"></search-box>

<!-- Or listen via event aggregator -->
```

```typescript
export class ProductCatalog {
  private ea = resolve(IEventAggregator);

  binding() {
    this.ea.subscribe('search:query', query => {
      this.performSearch(query);
    });
  }
}
```

**Why this works**: Components can communicate via callbacks (tight coupling) or events (loose coupling) depending on your needs. Use callbacks for parent-child communication, events for unrelated components.

## Best Practices

### Keep Components Focused
- ✅ Each component should have one clear responsibility
- ✅ If a component is doing too much, split it into smaller components
- ❌ Avoid "god components" that handle everything

### Favor Composition Over Inheritance
- ✅ Use slots and component composition
- ✅ Build complex UIs from simple, reusable pieces
- ❌ Avoid deep inheritance hierarchies

### Make Components Predictable
- ✅ Use bindable properties for inputs
- ✅ Use callbacks or events for outputs
- ✅ Document what bindables are required vs optional
- ❌ Don't manipulate parent state directly

### Test-Friendly Components
- ✅ Presenter components are easy to test (just props)
- ✅ Keep business logic in services, not components
- ✅ Use dependency injection for testability

## What's Next

- Learn more about [component lifecycles](../components/component-lifecycles.md)
- Explore [bindable properties](../components/bindable-properties.md) in detail
- Understand [shadow DOM and slots](../components/shadow-dom-and-slots.md) for advanced composition
