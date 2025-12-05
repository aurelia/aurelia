---
description: >-
  Components are the building blocks of Aurelia applications. This guide covers creating, configuring, and using components effectively.
---

# Component Basics

Components are the core building blocks of Aurelia applications. Each component typically consists of:

- A TypeScript class (view model)
- An HTML template (view)
- Optional CSS styling

{% hint style="info" %}
**Component Naming**

Component names must include a hyphen (e.g., `user-card`, `nav-menu`) to comply with Web Components standards. Use a consistent prefix like `app-` or your organization's initials for better organization.
{% endhint %}

## Creating Your First Component

The simplest way to create a component is with convention-based files:

{% tabs %}
{% tab title="user-card.ts" %}
```typescript
export class UserCard {
  name = 'John Doe';
  email = 'john@example.com';
}
```
{% endtab %}

{% tab title="user-card.html" %}
```html
<div class="user-card">
  <h3>${name}</h3>
  <p>${email}</p>
</div>
```
{% endtab %}
{% endtabs %}

Aurelia automatically pairs `user-card.ts` with `user-card.html` by convention, creating a `<user-card>` element you can use in templates.

## Component Configuration

Use the `@customElement` decorator for explicit configuration:

```typescript
import { customElement } from 'aurelia';

@customElement({
  name: 'user-card',
  template: `
    <div class="user-card">
      <h3>\${name}</h3>
      <p>\${email}</p>
    </div>
  `
})
export class UserCard {
  name = 'John Doe';
  email = 'john@example.com';
}
```

For simple naming, use the shorthand syntax:

```typescript
@customElement('user-card')
export class UserCard {
  // Component logic
}
```

### Configuration Options

Key `@customElement` options:

**Template Configuration:**
```typescript
import template from './custom-template.html?raw';

@customElement({
  name: 'data-widget',
  template, // External file
})
export class DataWidget {}

@customElement({
  name: 'inline-widget',
  template: '<div>Inline template</div>',
})
export class InlineWidget {}

@customElement({
  name: 'viewless-widget',
  template: null,
})
export class ViewlessWidget {}
```

### Importing external HTML templates with bundlers

When a component imports an `.html` file, the bundler must deliver that file as a plain string. Otherwise tools such as Vite, Webpack, and Parcel try to parse the file as an entry point and emit errors like `[vite:build-html] Unable to parse HTML; parse5 error code unexpected-character-in-unquoted-attribute-value` or `"template" is not exported by src/components/product-name-search.html`.

Configure your bundler using the option that best matches your stack:

- **Vite / esbuild (default Aurelia starter), Parcel 2, Rollup + `@rollup/plugin-string`** – append `?raw` to the import so the bundler treats the file as text:
  ```ts
  import template from './product-name-search.html?raw';
  ```
  Add a matching declaration so TypeScript understands these imports (the query string can be reused for other text assets):
  ```ts
  declare module '*.html?raw' {
    const content: string;
    export default content;
  }
  ```
- **Webpack 5** – mark `.html` files as `asset/source` (or keep using `raw-loader`). After that you can import without a query parameter:
  ```ts
  // webpack.config.cjs
  module.exports = {
    module: {
      rules: [
        { test: /\.html$/i, type: 'asset/source' },
      ],
    },
  };
  ```
  ```ts
  import template from './product-name-search.html';
  declare module '*.html' {
    const content: string;
    export default content;
  }
  ```
- **Other bundlers** – use the equivalent “treat this file as a string” hook (e.g., SystemJS `text` plugin).

Once the bundler understands `.html` files as text, both `npm start` and `npm run build` can reuse the same component source without inline templates. Keep the import pattern consistent across the project so contributors immediately know which loader configuration applies.

**Dependencies:**
```typescript
import { ChildComponent } from './child-component';

@customElement({
  name: 'parent-widget',
  dependencies: [ChildComponent] // Available without <import>
})
```

### Alternative Creation Methods

**Static Configuration:**
```typescript
export class UserCard {
  static $au = {
    type: 'custom-element',
    name: 'user-card'
  };
}
```

**Programmatic (mainly for testing):**
```typescript
import { CustomElement } from '@aurelia/runtime-html';

const MyComponent = CustomElement.define({
  name: 'test-component',
  template: '<span>\${message}</span>'
});
```

## HTML-Only Components

Create simple components with just HTML:

{% code title="status-badge.html" %}
```html
<bindable name="status"></bindable>
<bindable name="message"></bindable>

<span class="badge badge-\${status}">\${message}</span>
```
{% endcode %}

Usage:
```html
<import from="./status-badge.html"></import>

<status-badge status="success" message="Complete"></status-badge>
```

## Viewless Components

Components that handle DOM manipulation through third-party libraries:

```typescript
import { bindable, customElement } from 'aurelia';
import * as nprogress from 'nprogress';

@customElement({
  name: 'progress-indicator',
  template: null
})
export class ProgressIndicator {
  @bindable loading = false;

  loadingChanged(newValue: boolean) {
    newValue ? nprogress.start() : nprogress.done();
  }
}
```

## Using Components

**Global Registration (in main.ts):**
```typescript
import Aurelia from 'aurelia';
import { UserCard } from './components/user-card';

Aurelia
  .register(UserCard)
  .app(MyApp)
  .start();
```

**Local Import (in templates):**
```html
<import from="./user-card"></import>
<!-- or with alias -->
<import from="./user-card" as="profile-card"></import>

<user-card user.bind="currentUser"></user-card>
<profile-card user.bind="selectedUser"></profile-card>
```

## Containerless Components

Render component content without wrapper tags:

```typescript
import { customElement, containerless } from 'aurelia';

@customElement({ name: 'list-wrapper' })
@containerless
export class ListWrapper {
  // Component logic
}
```

Or configure inline:
```typescript
@customElement({
  name: 'list-wrapper',
  containerless: true
})
export class ListWrapper {}
```

{% hint style="warning" %}
**Use Sparingly**

Containerless components lose their wrapper element, which can complicate styling, testing, and third-party library integration.
{% endhint %}

## Component Lifecycle

Components follow a predictable lifecycle. Implement only the hooks you need:

```typescript
export class UserProfile {
  constructor() {
    // Component instantiation
  }

  binding() {
    // Before bindings are processed
  }

  bound() {
    // After bindings are set
  }

  attached() {
    // Component is in the DOM
  }

  detaching() {
    // Before removal from DOM
  }
}
```

{% hint style="info" %}
See [Component Lifecycles](component-lifecycles.md) for comprehensive lifecycle documentation.
{% endhint %}

## Bindable Properties

Components accept data through bindable properties:

```typescript
import { bindable, BindingMode } from 'aurelia';

export class UserCard {
  @bindable user: User;
  @bindable isActive: boolean = false;
  @bindable({ mode: BindingMode.twoWay }) selectedId: string;

  userChanged(newUser: User, oldUser: User) {
    // Called when user property changes
  }
}
```

```html
<user-card 
  user.bind="currentUser" 
  is-active.bind="userIsActive"
  selected-id.two-way="selectedUserId">
</user-card>
```

See [Bindable Properties](bindable-properties.md) for complete configuration options.


## Advanced Features

### Shadow DOM

Enable Shadow DOM for complete style and DOM encapsulation:

```typescript
import { customElement, useShadowDOM, shadowCSS } from 'aurelia';

@customElement({
  name: 'isolated-widget',
  template: '<div class="widget"><slot></slot></div>',
  dependencies: [
    shadowCSS(`
      .widget {
        border: 1px solid var(--widget-border, #ddd);
        padding: 16px;
      }
    `)
  ]
})
@useShadowDOM({ mode: 'open' })
export class IsolatedWidget {
  // Styles and DOM are fully encapsulated from outside
}
```

Shadow DOM is useful for:
- Complete style isolation (styles won't leak in or out)
- Creating reusable components with predictable styling
- Using native `<slot>` elements for content projection
- Building design systems and component libraries

See the [Shadow DOM guide](shadow-dom.md) for detailed configuration, styling patterns, and best practices.

### Template Processing

Transform markup before compilation:

```typescript
import { customElement, processContent, INode } from 'aurelia';

@customElement({ name: 'card-grid' })
export class CardGrid {
  @processContent()
  static processContent(node: INode) {
    // Transform <card> elements into proper markup
    const cards = node.querySelectorAll('card');
    cards.forEach(card => {
      card.classList.add('card-item');
      // Additional transformations...
    });
  }
}
```

### Enhancing Existing DOM

Apply Aurelia to existing elements:

```typescript
import { resolve, Aurelia } from 'aurelia';

export class DynamicContent {
  private readonly au = resolve(Aurelia);

  async enhanceContent() {
    const element = document.getElementById('server-rendered');
    await this.au.enhance({
      host: element,
      component: { data: this.dynamicData }
    });
  }
}
```

### Reactive Properties

Watch for property changes:

```typescript
import { watch, bindable } from 'aurelia';

export class ChartWidget {
  @bindable data: ChartData[];
  @bindable config: ChartConfig;

  @watch('data')
  @watch('config') 
  onDataChange(newValue: any, oldValue: any, propertyName: string) {
    this.updateChart();
  }
}
```

### Child Element Observation

```typescript
import { children, slotted } from 'aurelia';

export class TabContainer {
  @children('tab-item') tabItems: TabItem[];
  @slotted('tab-panel') panels: TabPanel[];

  tabItemsChanged(newItems: TabItem[]) {
    this.syncTabs();
  }
}
```

### Component Configuration

**Attribute Capture:**
```typescript
import { capture, customElement } from 'aurelia';

@customElement({ name: 'flex-wrapper' })
@capture() // Captures all unrecognized attributes
export class FlexWrapper {}
```

**Aliases:**
```typescript
import { customElement } from 'aurelia';

@customElement({
  name: 'primary-button',
  aliases: ['btn-primary', 'p-btn']
})
export class PrimaryButton {}
```

## Best Practices

### Component Design
- **Single Responsibility**: Each component should have one clear purpose
- **Type Safety**: Use interfaces for complex data structures
- **Composition**: Favor composition over inheritance

```typescript
import { bindable, resolve } from 'aurelia';
import { ILogger } from '@aurelia/kernel';

interface User {
  id: string;
  name: string;
  email: string;
}

export class UserProfile {
  @bindable user: User;
  private readonly logger = resolve(ILogger);
  
  attached() {
    this.logger.info('Profile loaded', { userId: this.user.id });
  }
}
```

### Performance
- Use `attached()` for DOM-dependent initialization
- Clean up subscriptions in `detaching()`
- Prefer `@watch` over polling for reactive updates
- Consider Shadow DOM for style isolation

### Testing
- Mock dependencies properly
- Test lifecycle hooks and bindable properties
- Write tests for error scenarios

See [Testing Components](../developer-guides/testing/testing-components.md) for detailed guidance.

---

Components form the foundation of Aurelia applications. Start with simple convention-based components and add complexity as needed. The framework's flexibility allows you to adopt patterns that fit your project's requirements while maintaining clean, maintainable code.
