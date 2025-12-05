---
description: Explore just a bit more of what Aurelia has in store just ahead.
---

# Beyond the Basics

You've learned the fundamentals of Aurelia. Now let's peek under the hood and explore some powerful features that make Aurelia special.

## Conventions

Aurelia follows a "convention over configuration" philosophy. When you create a component, Aurelia automatically wires everything together using smart defaults.

### How Conventions Work

When you create `my-component.ts`, Aurelia automatically:

1. **Discovers the component** - Looks for a matching `.html` file
2. **Generates the name** - Converts `MyComponent` → `my-component`
3. **Associates the template** - Pairs `my-component.ts` with `my-component.html`
4. **Registers the component** - Makes it available in templates

```typescript
// my-component.ts
export class MyComponent {
  message = 'Hello from conventions!';
}
```

```html
<!-- my-component.html -->
<div>${message}</div>
```

```html
<!-- Use it anywhere -->
<my-component></my-component>
```

**That's it!** No decorators, no manual registration, no configuration.

### Manual Configuration

Want more control? You can override conventions:

```typescript
import { customElement } from 'aurelia';

@customElement({
  name: 'special-name',           // Custom element name
  template: '<div>${msg}</div>',  // Inline template
  dependencies: [OtherComponent], // Explicit dependencies
  shadowOptions: { mode: 'open' } // Shadow DOM configuration
})
export class MyComponent {
  msg = 'Configured manually!';
}
```

**When to use manual configuration:**
- Custom element names (non-standard kebab-case)
- Inline templates (no separate HTML file)
- Shadow DOM encapsulation
- Explicit dependency management

### Naming Conventions

| Class Name | Element Name | Template File |
|------------|--------------|---------------|
| `MyComponent` | `my-component` | `my-component.html` |
| `UserProfile` | `user-profile` | `user-profile.html` |
| `NavBar` | `nav-bar` | `nav-bar.html` |
| `DataTable2` | `data-table2` | `data-table2.html` |

**Pro tip:** Aurelia also looks for `.css` files with the same name and automatically associates them!

### Convention Benefits

- ✅ Less boilerplate code
- ✅ Faster development
- ✅ Consistent project structure
- ✅ Easy to understand
- ✅ Override when needed

**Learn more:** [Component Basics](../../components/components.md)

---

## Performance

Aurelia gives you control over how it tracks changes to your data. Choose the strategy that fits your needs.

### Observation Modes

Aurelia supports two observation strategies:

#### 1. Proxy Mode (Default)
**Best for:** Most applications, modern browsers

```typescript
// Automatically uses Proxy
export class TodoList {
  todos = [];  // Changes tracked automatically

  addTodo(text: string) {
    this.todos.push({ text, done: false });
    // UI updates automatically
  }
}
```

**Pros:**
- Zero configuration
- Works with all data structures
- Minimal memory overhead

**Cons:**
- Slightly higher CPU during updates

#### 2. Getter/Setter Mode
**Best for:** Maximum compatibility, performance-critical scenarios

```typescript
import Aurelia from 'aurelia';
import { SetterObservation } from '@aurelia/runtime-html';

Aurelia
  .register(SetterObservation)  // Enable getter/setter mode
  .app(MyApp)
  .start();
```

**Pros:**
- Maximum browser compatibility
- Faster updates in some scenarios
- Lower CPU during repaint

**Cons:**
- Slightly higher memory usage
- Requires initialization time

### Performance Characteristics

| Strategy | Startup Time | Update Speed | Memory | Browser Support |
|----------|--------------|--------------|--------|-----------------|
| **Proxy** | Fast | Fast | Low | Modern browsers |
| **Getter/Setter** | Slower | Very Fast | Medium | All browsers |

### Choosing the Right Mode

**Use Proxy (default) when:**
- Building modern web apps
- Prefer simplicity and low memory

**Use Getter/Setter when:**
- Need maximum browser compatibility
- Have extremely large object graphs
- Optimizing for update performance

### Performance Tips

1. **Use one-time bindings** for static data:
   ```html
   <div>${title & oneTime}</div>
   ```

2. **Debounce expensive updates:**
   ```html
   <input value.bind="searchTerm & debounce:300">
   ```

3. **Virtualize long lists:**
   ```html
   <div virtual-repeat.for="item of items">
     ${item.name}
   </div>
   ```

4. **Profile before optimizing:**
   - Use Chrome DevTools Performance tab
   - Measure real-world scenarios
   - Focus on bottlenecks

**Learn more:** [Performance Optimization Techniques](../../advanced-scenarios/performance-optimization-techniques.md)

---

## Web Standards

Aurelia embraces web standards. Shadow DOM and CSS Modules work out of the box.

### Shadow DOM Styles

Add a CSS file next to your component:

```
my-component/
├── my-component.ts
├── my-component.html
└── my-component.css    👈 Automatically loaded!
```

```css
/* my-component.css */
.container {
  background: #f0f0f0;
  padding: 20px;
  border-radius: 8px;
}

.title {
  color: #333;
  font-size: 1.5em;
}
```

```html
<!-- my-component.html -->
<div class="container">
  <h2 class="title">${title}</h2>
  <p>${content}</p>
</div>
```

**That's it!** Aurelia automatically:
- Discovers the CSS file
- Associates it with the component
- Scopes styles to prevent conflicts

### Enable Shadow DOM

For true style encapsulation:

```typescript
import { customElement } from 'aurelia';

@customElement({
  name: 'my-component',
  shadowOptions: { mode: 'open' }
})
export class MyComponent {
  title = 'Encapsulated Styles';
}
```

**Benefits:**
- ✅ No style leakage
- ✅ No naming conflicts
- ✅ True component isolation
- ✅ Uses browser's native Shadow DOM

### Style Sharing

Share styles across components:

```typescript
// styles/shared.css
:host {
  --primary-color: #814c9e;
  --secondary-color: #4a90e2;
}

.btn {
  background: var(--primary-color);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
}
```

```typescript
import { customElement } from 'aurelia';
import sharedStyles from './styles/shared.css';

@customElement({
  name: 'my-button',
  shadowOptions: { mode: 'open' },
  dependencies: [sharedStyles]
})
export class MyButton {}
```

### CSS Modules

Switch to CSS Modules with one configuration change:

```typescript
// vite.config.ts
export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCase',
      scopeBehaviour: 'local'
    }
  }
});
```

```typescript
import styles from './my-component.module.css';

export class MyComponent {
  styles = styles;
}
```

```html
<div class="${styles.container}">
  <h2 class="${styles.title}">${title}</h2>
</div>
```

**Learn more:**
- [Shadow DOM and Slots](../../components/shadow-dom-and-slots.md)
- [Styling Components](../../components/styling-components.md)

---

## Extensibility

Aurelia's template compiler is pluggable. You can add support for other framework syntaxes or create your own.

### Custom Binding Syntax

Want Vue-style `v-model`? Add it in 10 lines:

```typescript
import { attributePattern } from '@aurelia/template-compiler';

@attributePattern({ pattern: 'v-model', symbols: 'v-' })
export class VueModelPattern {
  ['v-model'](name: string, value: string) {
    return 'value.two-way';  // Convert to Aurelia syntax
  }
}

// Register it
Aurelia
  .register(VueModelPattern)
  .app(MyApp)
  .start();
```

Now use Vue syntax in your templates:

```html
<!-- Vue-style -->
<input v-model="username">

<!-- Becomes Aurelia-style internally -->
<input value.two-way="username">
```

### React-Style Event Handlers

Prefer `onClick`? Create it:

```typescript
@attributePattern({ pattern: 'onPART', symbols: '' })
export class ReactEventPattern {
  ['onPART'](name: string, value: string, parts: string[]) {
    const eventName = parts[0].toLowerCase();
    return `${eventName}.trigger`;
  }
}
```

```html
<!-- React-style -->
<button onClick="handleClick()">Click Me</button>

<!-- Angular-style -->
<button (click)="handleClick()">Click Me</button>

<!-- Aurelia-style -->
<button click.trigger="handleClick()">Click Me</button>
```

**All three work!** Pick your preferred syntax.

### Shorthand Syntax

Create shortcuts for common patterns:

```typescript
@attributePattern({ pattern: ':PART', symbols: ':' })
export class ColonBindPattern {
  [':PART'](name: string, value: string, parts: string[]) {
    return `${parts[0]}.bind`;
  }
}

@attributePattern({ pattern: '@PART', symbols: '@' })
export class AtTriggerPattern {
  ['@PART'](name: string, value: string, parts: string[]) {
    return `${parts[0]}.trigger`;
  }
}
```

```html
<!-- Shorthand -->
<input :value="username" @change="handleChange()">

<!-- Expands to -->
<input value.bind="username" change.trigger="handleChange()">
```

**Learn more:** [Extending the Binding Engine](../../advanced-scenarios/extending-the-binding-engine.md)

---

## Curated Plugins

Extend Aurelia with community and official plugins:

### Official Plugins

#### @aurelia/router
Full-featured routing with nested routes, transitions, and guards.

```bash
npm install @aurelia/router
```

```typescript
import { RouterConfiguration } from '@aurelia/router';

Aurelia
  .register(RouterConfiguration)
  .app(MyApp)
  .start();
```

**Features:** Nested routes, lazy loading, navigation guards, transitions

#### @aurelia/validation
Declarative validation with extensible rules.

```bash
npm install @aurelia/validation
```

```typescript
import { ValidationConfiguration } from '@aurelia/validation';

Aurelia
  .register(ValidationConfiguration)
  .app(MyApp)
  .start();
```

**Features:** Built-in rules, custom validators, async validation, i18n support

#### @aurelia/fetch-client
HTTP client with interceptors and caching.

```bash
npm install @aurelia/fetch-client
```

```typescript
import { IHttpClient } from '@aurelia/fetch-client';
import { resolve } from '@aurelia/kernel';

export class MyService {
  private http = resolve(IHttpClient);

  async getUsers() {
    return await this.http.get('api/users');
  }
}
```

**Features:** Interceptors, request/response transformation, caching, retry logic

#### @aurelia/store
State management inspired by Redux.

```bash
npm install @aurelia/store
```

**Features:** Centralized state, time-travel debugging, middleware support

#### @aurelia/dialog
Modal dialogs and overlays.

```bash
npm install @aurelia/dialog
```

**Features:** Modal dialogs, customizable, keyboard shortcuts, overlay management

#### @aurelia/i18n
Internationalization with i18next.

```bash
npm install @aurelia/i18n
```

**Features:** Multi-language support, pluralization, formatting, date/time localization

#### @aurelia/ui-virtualization
Virtual scrolling for large lists.

```bash
npm install @aurelia/ui-virtualization
```

**Features:** Handles 10,000+ items smoothly, configurable buffer, variable sizes

### Community Plugins

#### aurelia-animator-css
CSS-based animations.

```bash
npm install aurelia-animator-css
```

**Use cases:** Page transitions, component animations, list animations

#### aurelia-authentication
JWT authentication and OAuth.

```bash
npm install aurelia-authentication
```

**Use cases:** Login/logout, token management, route protection

### Integration Guides

Aurelia works great with popular libraries:

- **Apollo GraphQL** - [GraphQL Integration](../../developer-guides/scenarios/graphql.md)
- **Auth0** - [Auth0 Integration](../../developer-guides/scenarios/auth0.md)
- **Firebase** - [Firebase Integration](../../developer-guides/scenarios/firebase-integration.md)
- **SignalR** - [SignalR Integration](../../developer-guides/scenarios/signalr-integration.md)
- **TailwindCSS** - [TailwindCSS Integration](../../developer-guides/scenarios/tailwindcss-integration.md)
- **WebSockets** - [WebSockets Integration](../../developer-guides/scenarios/websockets.md)

### Finding More Plugins

- **GitHub:** Search for `aurelia2` or `@aurelia` packages
- **npm:** Browse packages with `aurelia` keyword
- **Discord:** Ask the community for recommendations

---

## Tooling

Professional Aurelia development is supercharged with the right tools.

### Aurelia VS Code Extension

Get IntelliSense, code completion, and go-to-definition for Aurelia templates.

#### Installation

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Search for "Aurelia"
4. Install **"Aurelia"** by AureliaEffect

**Or install via command line:**
```bash
code --install-extension AureliaEffect.aurelia
```

#### Features

**✨ Template IntelliSense**
- Autocomplete for custom elements
- Autocomplete for bindable properties
- Autocomplete for binding commands (`.bind`, `.trigger`, etc.)

**🔍 Go to Definition**
- Click on a custom element → jump to its definition
- Click on a bindable property → jump to its declaration
- Works across files

**⚡ Syntax Highlighting**
- Proper highlighting for `${}` expressions
- Binding command syntax
- Template controllers (`repeat.for`, `if.bind`, etc.)

**🐛 Error Detection**
- Invalid binding syntax
- Typos in element names
- Missing closing tags

#### Example Workflow

**Before typing:**
```html
<user-card>
```

**Start typing a bindable:**
```html
<user-card na█
```

**IntelliSense shows:**
```
- name (bindable)
- email (bindable)
- avatar-url (bindable)
```

**Select and it autocompletes:**
```html
<user-card name.bind="█"
```

**Ctrl+Click on `user-card`** → Opens `user-card.ts`

**Hover over `.bind`** → Shows documentation

### Additional VS Code Extensions

#### ES6 and TypeScript
```bash
code --install-extension ms-vscode.vscode-typescript-next
```

#### ESLint
```bash
code --install-extension dbaeumer.vscode-eslint
```

#### Prettier
```bash
code --install-extension esbenp.prettier-vscode
```

### VS Code Settings for Aurelia

```json
{
  "aurelia.featureToggles": {
    "smartAutocomplete": true
  },
  "files.associations": {
    "*.html": "html"
  },
  "emmet.includeLanguages": {
    "html": "html"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  }
}
```

### Chrome DevTools

Use Aurelia in Chrome DevTools:

1. Install [Aurelia Inspector](https://chrome.google.com/webstore/detail/aurelia-inspector) (if available)
2. Open DevTools (`F12`)
3. Navigate to "Aurelia" tab

**Features:**
- Inspect component tree
- View bindable values
- Track binding updates
- Performance profiling

### Debugging Tips

**1. Enable source maps:**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: true
  }
});
```

**2. Use `debugger` statements:**
```typescript
export class MyComponent {
  handleClick() {
    debugger;  // Pauses execution
    this.processData();
  }
}
```

**3. Log binding context:**
```html
<div ref="debug">
  <!-- In console: debug.$au.controller -->
  ${message}
</div>
```

---

## What's Next?

You've now explored Aurelia's conventions, performance modes, web standards support, extensibility, ecosystem, and tooling. Here are some next steps:

**Build Something:**
- [Create a Dashboard](../../tutorials/create-a-dashboard-using-dynamic-composition.md)
- [Build a ChatGPT App](../../tutorials/build-a-chatgpt-inspired-app.md)
- [Cryptocurrency Tracker](../../tutorials/building-a-realtime-cryptocurrency-price-tracker.md)

**Go Deeper:**
- [Router Guide](../../router/getting-started.md)
- [Validation Tutorial](../../aurelia-packages/validation/validation-tutorial.md)
- [State Management](../../aurelia-packages/state.md)

**Explore Advanced Topics:**
- [Performance Optimization](../../advanced-scenarios/performance-optimization-techniques.md)
- [Building Plugins](../../developer-guides/building-plugins.md)
- [Extending the Framework](../../advanced-scenarios/extending-the-binding-engine.md)

**Join the Community:**
- [Discord](https://discord.gg/RBtyM6u)
- [GitHub](https://github.com/aurelia/aurelia)
- [Twitter](https://twitter.com/aureliaeffect)

Happy coding! 🚀

