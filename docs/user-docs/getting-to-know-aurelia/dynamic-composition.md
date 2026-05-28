---
description: Render components and templates dynamically with Aurelia's au-compose element.
---

# Dynamic Composition

Dynamic composition lets you decide what to render at runtime instead of at compile time. Think of `<au-compose>` as a placeholder that can become any component or template based on your application's state, user preferences, or data.

Use it for:
- **Dashboard widgets** that change based on user configuration
- **Conditional components** where you need to render different components based on data
- **Plugin architectures** where components are loaded dynamically
- **Form builders** that render different field types
- **Content management** where layout components vary by content type

> **Before you start:** Make sure you are comfortable with [components](components/README.md) and [template controllers](template-controllers.md); both concepts show up throughout the examples.

## Quick Reference

| Bindable | Accepts | Default | Purpose |
| --- | --- | --- | --- |
| `component` | Registered element name (`string`), custom element class/definition, plain object/class, or `Promise` resolving to one of those values | `undefined` | Chooses what to render; strings must match a globally or locally registered custom element or Aurelia will throw. |
| `template` | Literal HTML `string` or `Promise<string>` | `undefined` | Provides markup for template-only composition or for a non-custom-element component object/class. Ignored when `component` resolves to a custom element. |
| `model` | Any value | `undefined` | Passed into the composed instance's `activate(model)` hook. Updating `model` re-runs `activate` without recreating the component; it does not spread model properties automatically. |
| `scope-behavior` | `'auto' \| 'scoped'` | `'auto'` | Controls scope inheritance for non-custom-element compositions, including template-only compositions and templates backed by plain objects. Has no effect for custom elements. |
| `tag` | `string \| null` | `null` (containerless) | For non-custom-element compositions, provide a tag name when you need a surrounding element; leave as `null` to keep the default comment boundaries. Ignored for custom elements. |
| `composition` | `ICompositionController` (from-view) | `undefined` | Exposes the controller for the currently composed view so you can call `controller.viewModel`, `update(model)`, or `deactivate()`. |
| `composing` | `Promise<void> \| void` (from-view) | `undefined` | Surfaces the pending composition promise so parents can show loading states or await the latest composition. |
| `flush-mode` | `'sync' \| 'async'` | `'sync'` | Controls whether composition updates are applied immediately or batched into the next change-processing turn. |

> Tip: Bindings placed on `<au-compose>` that match bindables on a composed custom element are forwarded to that element. Other attributes are applied to the generated host element when one exists, unless the custom element captures them with `capture` / `...$attrs`.

## Component Composition

### Composing with Custom Element Definitions

You can compose any custom element by passing its definition to the `component` property. Define those elements once at module scope so Aurelia reuses the same definition instead of recreating it for every view-model instance:

```typescript
// dashboard.ts
import { CustomElement } from '@aurelia/runtime-html';

const ChartWidget = CustomElement.define({
  name: 'chart-widget',
  template: '<div class="chart">Chart: ${title}</div>',
  bindables: ['title'],
});

const ListWidget = CustomElement.define({
  name: 'list-widget',
  template: '<ul><li repeat.for="item of items">${item}</li></ul>',
  bindables: ['items'],
});

export class Dashboard {
  selectedWidget = ChartWidget;

  switchToChart() {
    this.selectedWidget = ChartWidget;
  }

  switchToList() {
    this.selectedWidget = ListWidget;
  }
}
```

```html
<!-- dashboard.html -->
<div class="widget-controls">
  <button click.trigger="switchToChart()">Chart View</button>
  <button click.trigger="switchToList()">List View</button>
</div>

<au-compose component.bind="selectedWidget" title="Sales Data" items.bind="['Q1', 'Q2', 'Q3']"></au-compose>
```

### Composing with Component Names

If you have components registered globally or locally, you can reference them by name:

```html
<!-- These components must be registered globally or locally -->
<au-compose component="user-profile"></au-compose>
<au-compose component="admin-panel" if.bind="isAdmin"></au-compose>
```

## Template-Only Composition

Sometimes you need to render dynamic HTML without a full component. Template-only composition covers that case:

### Basic Template Composition

```html
<!-- Render static HTML -->
<au-compose template="<div class='alert'>Message sent successfully!</div>"></au-compose>

<!-- Render dynamic content from parent scope -->
<au-compose template="<h2>Welcome, ${user.name}!</h2>"></au-compose>
```

### Dynamic Templates with Data

```typescript
// notification.ts
export class NotificationCenter {
  notifications = [
    { type: 'success', message: 'Profile updated', icon: '✓' },
    { type: 'warning', message: 'Storage almost full', icon: '⚠' },
    { type: 'error', message: 'Connection failed', icon: '✗' }
  ];

  getTemplate(notification) {
    return `<div class="alert alert-${notification.type}">
      <span class="icon">${notification.icon}</span>
      <span class="message">${notification.message}</span>
    </div>`;
  }
}
```

```html
<!-- notification.html -->
<div class="notifications">
  <au-compose
    repeat.for="notif of notifications"
    template.bind="getTemplate(notif)">
  </au-compose>
</div>
```

### Template with Component Object

You can combine a template with a simple object that provides data and methods:

```html
<!-- Each item gets its own mini-component -->
<au-compose
  repeat.for="item of products"
  template="<div class='product'>
    <h3>${name}</h3>
    <p>${description}</p>
    <button click.trigger='addToCart()'>Add to Cart</button>
  </div>"
  component.bind="{
    name: item.name,
    description: item.description,
    addToCart: () => buyProduct(item)
  }">
</au-compose>
```

## Controlling the Host Element

### Default Host Behavior

When you compose a custom element, Aurelia creates that element as the host. For template-only and plain-object compositions, Aurelia does not create a wrapper element by default:

```html
<!-- Template-only composition - no wrapper element -->
<au-compose template="<span>Hello</span><span>World</span>"></au-compose>
```

The rendered DOM contains the two `<span>` elements plus Aurelia's render-location comments, not an extra `<div>` wrapper.

### Creating a Host Element with `tag`

When you need a wrapper element around non-custom-element composed content, use the `tag` property:

```html
<!-- Create a div wrapper -->
<au-compose
  tag="div"
  class="notification-container"
  template="<span class='icon'>✓</span><span class='message'>Success!</span>">
</au-compose>
```

This renders as:
```html
<div class="notification-container">
  <span class="icon">✓</span>
  <span class="message">Success!</span>
</div>
```

For non-custom-element compositions, attributes you put on `<au-compose>` (like `class`, `style`, or event handlers) are transferred only when `tag` creates a real host element. Without `tag`, there is no host element to receive them.

### Practical Host Element Example

```typescript
// card-layout.ts
export class CardLayout {
  cards = [
    { title: 'Sales', content: 'Revenue: $50,000', theme: 'success' },
    { title: 'Issues', content: '3 open tickets', theme: 'warning' },
    { title: 'Users', content: '1,250 active', theme: 'info' }
  ];

  getCardTemplate(card) {
    return `<h3>${card.title}</h3><p>${card.content}</p>`;
  }
}
```

```html
<!-- card-layout.html -->
<div class="dashboard">
  <au-compose
    repeat.for="card of cards"
    tag="div"
    class="card card-${card.theme}"
    template.bind="getCardTemplate(card)"
    click.trigger="selectCard(card)">
  </au-compose>
</div>
```

## Passing Data with Models and the Activate Method

### Understanding the Activate Lifecycle

Composed components can implement an `activate` method that runs when the component is created and whenever the `model` changes. Use it for initialization and data updates:

```typescript
// user-widget.ts
export class UserWidget {
  user = null;
  posts = [];

  // Called when component is first created and when model changes
  async activate(userData) {
    this.user = userData;

    // Load user's posts when activated
    if (userData?.id) {
      this.posts = await this.loadUserPosts(userData.id);
    }
  }

  async loadUserPosts(userId) {
    // Simulate API call
    return fetch(`/api/users/${userId}/posts`).then(r => r.json());
  }
}
```

### Using Models for Data Passing

```html
<!-- user-dashboard.html -->
<div class="user-dashboard">
  <au-compose
    component.bind="userWidget"
    model.bind="selectedUser">
  </au-compose>
</div>
```

```typescript
// user-dashboard.ts
import { UserWidget } from './user-widget';

export class UserDashboard {
  userWidget = UserWidget;
  users = [
    { id: 1, name: 'Alice', role: 'admin' },
    { id: 2, name: 'Bob', role: 'user' }
  ];

  selectedUser = this.users[0];

  selectUser(user) {
    // This will trigger activate() in the composed component
    this.selectedUser = user;
  }
}
```

### Model Updates vs Component Changes

Important distinction: changing the `model` doesn't recreate the component, it just calls `activate()` again. This is efficient for data updates:

```typescript
// dashboard.ts
import { CustomElement } from '@aurelia/runtime-html';

class UserProfileViewModel {
  user = null;

  activate(user) {
    this.user = user;
  }
}

const UserProfile = CustomElement.define({
  name: 'user-profile',
  template: '<div>User: ${user?.name}</div>',
}, UserProfileViewModel);

export class Dashboard {
  userProfile = UserProfile;

  currentUser = { id: 1, name: 'Alice' };

  switchUser() {
    // This calls activate() on the existing component.
    this.currentUser = { id: 2, name: 'Bob' };
  }

  switchComponent() {
    // This recreates the entire component - more expensive
    this.userProfile = SomeOtherComponent;
  }
}
```

```html
<au-compose component.bind="userProfile" model.bind="currentUser"></au-compose>
```

## Advanced Features

### Promise Support

Both `template` and `component` properties can accept promises, which keeps lazy loading straightforward:

```typescript
// lazy-dashboard.ts
export class LazyDashboard {
  selectedWidgetType = 'chart';
  widgetData = { range: '30d' };
  pending?: Promise<void> | void;

  get isLoading() {
    return this.pending != null;
  }

  // Lazy load components based on user selection
  get currentComponent() {
    switch (this.selectedWidgetType) {
      case 'chart':
        return import('./widgets/chart-widget').then(m => m.ChartWidget);
      case 'table':
        return import('./widgets/table-widget').then(m => m.TableWidget);
      case 'map':
        return import('./widgets/map-widget').then(m => m.MapWidget);
      default:
        return Promise.resolve(null);
    }
  }

  // Dynamically load templates from server
  get dynamicTemplate() {
    return fetch(`/api/templates/${this.selectedWidgetType}`)
      .then(response => response.text());
  }
}
```

```html
<!-- lazy-dashboard.html -->
<div class="widget-selector">
  <select value.bind="selectedWidgetType">
    <option value="chart">Chart</option>
    <option value="table">Table</option>
    <option value="map">Map</option>
  </select>
</div>

<div class="loading" if.bind="isLoading">Loading next widget...</div>

<au-compose
  component.bind="currentComponent"
  model.bind="widgetData"
  composing.bind="pending">
</au-compose>
```

### Scope Behavior Control

For non-custom-element compositions, you can control whether they inherit the parent scope:

```html
<!-- Auto scope (default) - inherits parent properties -->
<au-compose
  template="<div>Welcome, ${user.name}!</div>"
  scope-behavior="auto">
</au-compose>

<!-- Scoped - isolated from parent, only uses component object -->
<au-compose
  template="<div>Welcome, ${name}!</div>"
  component.bind="{ name: user.name }"
  scope-behavior="scoped">
</au-compose>
```

#### Plain object components and missing properties

When `component` is a plain object and the composed template is not a custom element, the default `scope-behavior="auto"` keeps the parent scope visible. This is convenient when a template intentionally reads parent properties, but it can surprise you if the plain object is replaced with one that does not contain every property used by the template.

```typescript
// my-app.ts
export class MyApp {
  data: Record<string, unknown> = {};
  template = "x:<input value.bind='x'><br>y:<input value.bind='y'><br>";

  replaceData() {
    this.data = { y: 12 };
  }
}
```

```html
<!-- my-app.html -->
<au-compose component.bind="data" template.bind="template"></au-compose>

<button click.trigger="replaceData()">Replace data</button>
```

After `replaceData()`, `y` resolves on the new `data` object. The template also asks for `x`, but `x` is missing from `data`; with `auto` scoping Aurelia can resolve that failed lookup against the nearest parent scope instead. Later changes to `data.x` will not update a binding that was already connected to the parent.

Use `scope-behavior="scoped"` when the composed template should stay anchored to the plain object:

```html
<au-compose
  component.bind="data"
  template.bind="template"
  scope-behavior="scoped">
</au-compose>
```

Another safe option is to keep the object shape complete whenever you replace it:

```typescript
replaceData() {
  this.data = { x: '', y: 12 };
}
```

Custom-element composition does not have this fallback behavior because composed custom elements are scoped by default.

### Accessing the Composition Controller

Use the `composition` property to access the composed component's controller:

```typescript
// admin-panel.ts
export class AdminPanel {
  composition: ICompositionController;

  async refreshWidget() {
    // Access the composed component directly
    if (this.composition?.controller) {
      const widgetInstance = this.composition.controller.viewModel;
      if (widgetInstance.refresh) {
        await widgetInstance.refresh();
      }
    }
  }

  getComposedData() {
    return this.composition?.controller?.scope?.bindingContext;
  }
}
```

```html
<!-- admin-panel.html -->
<au-compose
  component.bind="selectedWidget"
  composition.bind="composition">
</au-compose>

<button click.trigger="refreshWidget()">Refresh Widget</button>
```

### Tracking Pending Compositions

Bind to `composing` whenever you need to surface intermediate loading states. Aurelia assigns the currently pending composition promise to your property, allowing you to show a spinner or disable UI while the latest composition settles.

```typescript
// widget-shell.ts
import type { ICompositionController } from '@aurelia/runtime-html';

export class WidgetShell {
  composition?: ICompositionController;
  pending?: Promise<void> | void;

  get isLoading() {
    return this.pending != null;
  }
}
```

```html
<!-- widget-shell.html -->
<div class="widget-shell">
  <div class="loading" if.bind="isLoading">Loading latest widget...</div>

  <au-compose
    component.bind="selectedWidget"
    model.bind="widgetConfig"
    composition.bind="composition"
    composing.bind="pending">
  </au-compose>
</div>
```

### Synchronous and Asynchronous Updates

By default, `<au-compose>` reacts to `component`, `template`, `tag`, and `scope-behavior` changes synchronously. Set `flush-mode="async"` when several inputs can change together and you want Aurelia to batch the composition update into the next change-processing turn:

```html
<au-compose
  component.bind="currentComponent"
  model.bind="currentModel"
  flush-mode="async">
</au-compose>
```

A model-only update still calls `activate(model)` on the current composition instead of recreating it.

## Real-World Examples

### Form Builder with Dynamic Fields

```typescript
// form-builder.ts
import { CustomElement } from '@aurelia/runtime-html';

const TextInput = CustomElement.define({
  name: 'text-input',
  template: '<input type="text" value.bind="value" placeholder.bind="placeholder">',
  bindables: ['value', 'placeholder'],
});

const NumberInput = CustomElement.define({
  name: 'number-input',
  template: '<input type="number" value.bind="value" min.bind="min" max.bind="max">',
  bindables: ['value', 'min', 'max'],
});

const SelectInput = CustomElement.define({
  name: 'select-input',
  template: '<select value.bind="value"><option repeat.for="opt of options" value.bind="opt.value">${opt.label}</option></select>',
  bindables: ['value', 'options'],
});

const fieldTypes = {
  text: TextInput,
  number: NumberInput,
  select: SelectInput
};

export class FormBuilder {
  formConfig = [
    { type: 'text', name: 'firstName', label: 'First name', placeholder: 'First name', value: '' },
    { type: 'text', name: 'lastName', label: 'Last name', placeholder: 'Last name', value: '' },
    { type: 'number', name: 'age', label: 'Age', min: 0, max: 120, value: null },
    { type: 'select', name: 'country', label: 'Country', options: [
      { value: 'us', label: 'United States' },
      { value: 'ca', label: 'Canada' },
    ], value: '' },
  ];

  getFieldComponent(field) {
    return fieldTypes[field.type];
  }
}
```

```html
<!-- form-builder.html -->
<form class="dynamic-form">
  <div repeat.for="field of formConfig" class="field-group">
    <label>${field.label}</label>
    <au-compose
      component.bind="getFieldComponent(field)"
      value.two-way="field.value"
      placeholder.bind="field.placeholder"
      min.bind="field.min"
      max.bind="field.max"
      options.bind="field.options">
    </au-compose>
  </div>
</form>
```

### Plugin Architecture with Dynamic Loading

```typescript
// plugin-host.ts
export class PluginHost {
  availablePlugins = [
    { id: 'weather', name: 'Weather Widget', url: '/plugins/weather.js' },
    { id: 'news', name: 'News Feed', url: '/plugins/news.js' },
    { id: 'calendar', name: 'Calendar', url: '/plugins/calendar.js' },
  ];

  activePlugins = [];

  async loadPlugin(pluginConfig) {
    try {
      // Dynamically import the plugin module
      const module = await import(pluginConfig.url);
      const PluginComponent = module.default;

      this.activePlugins.push({
        id: pluginConfig.id,
        name: pluginConfig.name,
        component: PluginComponent,
        config: await this.loadPluginConfig(pluginConfig.id),
      });
    } catch (error) {
      console.error('Failed to load plugin:', error);
    }
  }

  async loadPluginConfig(pluginId) {
    return fetch(`/api/plugins/${pluginId}/config`).then(r => r.json());
  }

  removePlugin(pluginId) {
    this.activePlugins = this.activePlugins.filter(p => p.id !== pluginId);
  }
}
```

```html
<!-- plugin-host.html -->
<div class="plugin-dashboard">
  <div class="plugin-loader">
    <h3>Available Plugins</h3>
    <div repeat.for="plugin of availablePlugins">
      <button click.trigger="loadPlugin(plugin)">
        Load ${plugin.name}
      </button>
    </div>
  </div>

  <div class="active-plugins">
    <div repeat.for="plugin of activePlugins" class="plugin-container">
      <div class="plugin-header">
        <h4>${plugin.name}</h4>
        <button click.trigger="removePlugin(plugin.id)">Remove</button>
      </div>

      <au-compose
        component.bind="plugin.component"
        model.bind="plugin.config">
      </au-compose>
    </div>
  </div>
</div>
```

Each plugin component should read `plugin.config` in its `activate(model)` hook, or expose explicit bindables and pass those bindables on `<au-compose>`.

### Content Management with Dynamic Layouts

```typescript
// cms-renderer.ts
import { CustomElement } from '@aurelia/runtime-html';

function defineLayout(name: string, template: string) {
  return CustomElement.define({ name, template }, class {
    activate(data: Record<string, unknown>) {
      Object.assign(this, data);
    }
  });
}

const layoutComponents = {
  'hero-section': defineLayout(
    'hero-section',
    `
      <section class="hero" style="background-image: url(\${backgroundImage})">
        <h1>\${title}</h1>
        <p>\${subtitle}</p>
        <button if.bind="ctaText">\${ctaText}</button>
      </section>
    `,
  ),
  'text-block': defineLayout(
    'text-block',
    '<div class="text-content" innerHTML.bind="content"></div>',
  ),
  'image-gallery': defineLayout(
    'image-gallery',
    `
      <div class="gallery">
        <img repeat.for="img of images" src.bind="img.url" alt.bind="img.alt">
      </div>
    `,
  ),
};

export class CmsRenderer {
  pageContent = [
    {
      type: 'hero-section',
      data: {
        title: 'Welcome to Our Site',
        subtitle: 'Latest product updates and resources',
        backgroundImage: '/images/hero-bg.jpg',
        ctaText: 'Get Started',
      },
    },
    {
      type: 'text-block',
      data: {
        content: '<h2>About Us</h2><p>We publish product news and guides.</p>',
      },
    },
    {
      type: 'image-gallery',
      data: {
        images: [
          { url: '/images/1.jpg', alt: 'Project 1' },
          { url: '/images/2.jpg', alt: 'Project 2' },
        ],
      },
    },
  ];

  getLayoutComponent(block) {
    return layoutComponents[block.type];
  }
}
```

```html
<!-- cms-renderer.html -->
<div class="cms-page">
  <au-compose
    repeat.for="block of pageContent"
    component.bind="getLayoutComponent(block)"
    model.bind="block.data">
  </au-compose>
</div>
```

Only bind trusted or sanitized HTML into `innerHTML`; dynamic composition compiles templates, but it does not make unsafe content safe.

## Migrating from Aurelia 1

If you're upgrading from Aurelia 1, here are the key changes you need to know:

### Property Name Changes

**Aurelia 1:**
```html
<compose view.bind="myTemplate" view-model.bind="myComponent"></compose>
```

**Aurelia 2:**
```html
<au-compose template.bind="myTemplate" component.bind="myComponent"></au-compose>
```

### Component Reference Changes

**Aurelia 1:**
```html
<compose view-model.ref="composerRef"></compose>
```

**Aurelia 2:**
```html
<!-- Reference the composed custom element instance -->
<au-compose component.bind="selectedWidget" component.ref="widget"></au-compose>

<!-- Get the composition controller -->
<au-compose
  component.bind="selectedWidget"
  composition.bind="compositionRef">
</au-compose>

<!-- Use the controller to reach the composed view model -->
<button click.trigger="compositionRef?.controller?.viewModel?.refresh?.()">
  Refresh composed widget
</button>
```

> Note: `component.ref` is forwarded to a composed custom element. Use `composition.bind` when you need the composition controller, or when the composed value might be a plain object, plain class, or template-only composition.

### String Handling Changes

**Aurelia 1:**
```html
<!-- Both worked in v1 -->
<compose view="./my-template.html"></compose>
<compose view-model="./my-component"></compose>
```

**Aurelia 2:**
```html
<!-- Template strings are now literal HTML -->
<au-compose template="<div>Hello World</div>"></au-compose>

<!-- Component strings must be registered component names -->
<au-compose component="my-registered-component"></au-compose>

<!-- For dynamic imports, return the exported component from the import promise -->
<au-compose component.bind="import('./my-component').then(m => m.MyComponent)"></au-compose>
```

### Scope Inheritance Changes

**Aurelia 1:**
```html
<!-- Default was isolated scope -->
<compose view.bind="template" model.bind="data"></compose>
```

**Aurelia 2:**
```html
<!-- Template-only and plain-object compositions inherit by default -->
<au-compose template.bind="template" scope-behavior="auto"></au-compose>

<!-- Use scoped when the template should read only from the component object -->
<au-compose template.bind="template" scope-behavior="scoped" component.bind="data"></au-compose>
```

### Migration Examples

#### Before (Aurelia 1):
```typescript
// aurelia-1-dashboard.ts
export class Dashboard {
  selectedView = './widgets/chart-widget.html';
  selectedViewModel = './widgets/chart-widget';
  widgetData = { title: 'Sales Chart' };
}
```

```html
<!-- aurelia-1-dashboard.html -->
<compose
  view.bind="selectedView"
  view-model.bind="selectedViewModel"
  model.bind="widgetData">
</compose>
```

#### After (Aurelia 2):
```typescript
// aurelia-2-dashboard.ts
import { CustomElement } from '@aurelia/runtime-html';

class ChartWidgetViewModel {
  title = '';

  activate(model) {
    this.title = model.title;
  }
}

const ChartWidget = CustomElement.define({
  name: 'chart-widget',
  template: '<div class="chart">Chart: ${title}</div>',
}, ChartWidgetViewModel);

export class Dashboard {
  selectedComponent = ChartWidget;
  widgetData = { title: 'Sales Chart' };
}
```

```html
<!-- aurelia-2-dashboard.html -->
<au-compose
  component.bind="selectedComponent"
  model.bind="widgetData">
</au-compose>
```

### Dynamic Module Loading Migration

**Aurelia 1:**
```typescript
// System.js or RequireJS loading
export class Dashboard {
  async loadWidget(widgetName) {
    const viewModel = await System.import(`./widgets/${widgetName}`);
    return viewModel.Widget;
  }
}
```

**Aurelia 2:**
```typescript
// ES6 dynamic imports
export class Dashboard {
  async loadWidget(widgetName) {
    const module = await import(`./widgets/${widgetName}`);
    return module.Widget;
  }

  // Or use promises directly in template
  get currentWidget() {
    return import(`./widgets/${this.selectedWidgetName}`).then(m => m.Widget);
  }
}
```

```html
<!-- Can bind promises directly -->
<au-compose component.bind="currentWidget" model.bind="widgetData"></au-compose>
```

### Value Converter Pattern for Remote Templates

If you need to load templates from URLs (like in Aurelia 1), create a value converter:

Only compile template strings that you trust. A remote string passed to `template` becomes an Aurelia template, not inert display text.

```typescript
// template-loader.ts
export class TemplateLoaderValueConverter {
  private cache = new Map<string, Promise<string>>();

  toView(url: string): Promise<string> {
    if (!this.cache.has(url)) {
      this.cache.set(url,
        fetch(url).then(response => response.text())
      );
    }
    return this.cache.get(url)!;
  }
}
```

```html
<!-- Use in template -->
<au-compose template.bind="templateUrl | templateLoader"></au-compose>
```

### Common Migration Gotchas

1. **String components**: `component="..."` is a registered element name, not a module path.
2. **Dynamic imports**: bind a promise that resolves to the component export, not the whole module object.
3. **Model data**: `model` is passed to `activate(model)`; it is not spread across component properties.
4. **Binding transfer**: bindings matching custom element bindables go to the component. Other attributes go to the host element or to `...$attrs` when the custom element captures them.
5. **Scope behavior**: template-only and plain-object compositions use `auto` scope by default; custom elements are scoped by default.
6. **Lifecycle**: custom elements get their normal lifecycle. Plain objects and plain classes can use the dynamic composition `activate(model)` hook.

## Best Practices

1. **Use promises for lazy loading** - Return the component export from `import().then(...)`.
2. **Use `activate(model)` for model data** - Keep model normalization in one place instead of relying on property names to line up.
3. **Choose scope behavior intentionally** - Use `scoped` when a template should not fall back to parent properties, `auto` when fallback is desired.
4. **Cache component definitions** - Call `CustomElement.define` once per module and reuse the reference instead of redefining inside constructors.
5. **Handle loading states** - Bind to `composing` to show a spinner or disable UI while Aurelia hydrates the next component.
6. **Use models efficiently** - Changing models is cheaper than switching components because `activate(model)` re-runs without rehydration.

## Next steps

- Explore [portalling elements](portalling-elements.md) to move DOM across layout boundaries.
- Combine composition with [enhance](enhance.md) when progressively upgrading existing markup.
- Review [watching data](watching-data.md) to react to model changes that drive composition.
