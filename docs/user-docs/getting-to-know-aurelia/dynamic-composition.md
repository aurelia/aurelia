# Dynamic Composition

Dynamic composition lets you decide what to render at runtime instead of at compile time. Think of `<au-compose>` as a placeholder that can become any component or template based on your application's state, user preferences, or data.

This is perfect for:
- **Dashboard widgets** that change based on user configuration
- **Conditional components** where you need to render different components based on data
- **Plugin architectures** where components are loaded dynamically
- **Form builders** that render different field types
- **Content management** where layout components vary by content type

## Component Composition

### Composing with Custom Element Definitions

You can compose any custom element by passing its definition to the `component` property:

```typescript
// dashboard.ts
import { CustomElement } from '@aurelia/runtime-html';

export class Dashboard {
  // Define different widget types
  ChartWidget = CustomElement.define({
    name: 'chart-widget',
    template: '<div class="chart">Chart: ${title}</div>'
  });

  ListWidget = CustomElement.define({
    name: 'list-widget',
    template: '<ul><li repeat.for="item of items">${item}</li></ul>'
  });

  // Switch between widgets based on user choice
  selectedWidget = this.ChartWidget;

  switchToChart() {
    this.selectedWidget = this.ChartWidget;
  }

  switchToList() {
    this.selectedWidget = this.ListWidget;
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

If you have components registered globally or imported, you can reference them by name:

```html
<!-- These components must be registered or imported -->
<au-compose component="user-profile"></au-compose>
<au-compose component="admin-panel" if.bind="isAdmin"></au-compose>
```

## Template-Only Composition

Sometimes you just need to render dynamic HTML without a full component. Template-only composition is perfect for this:

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

When you compose a custom element, it creates its own host element. But for template-only compositions, Aurelia doesn't create a wrapper element by default:

```html
<!-- Template-only composition - no wrapper element -->
<au-compose template="<span>Hello</span><span>World</span>"></au-compose>
```

This renders as comment boundaries around your content:
```html
<!--au-start--><span>Hello</span><span>World</span><!--au-end-->
```

### Creating a Host Element with `tag`

When you need a wrapper element around your composed content, use the `tag` property:

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

Any attributes you put on `<au-compose>` (like `class`, `style`, or event handlers) get transferred to the host element.

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

Composed components can implement an `activate` method that runs when the component is created and whenever the `model` changes. This is perfect for initialization and data updates:

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
    component.bind="UserWidget"
    model.bind="selectedUser">
  </au-compose>
</div>
```

```typescript
// user-dashboard.ts
export class UserDashboard {
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
export class Dashboard {
  UserProfile = CustomElement.define({
    name: 'user-profile',
    template: '<div>User: ${user?.name}</div>'
  });

  currentUser = { id: 1, name: 'Alice' };

  switchUser() {
    // This calls activate() on existing component - efficient!
    this.currentUser = { id: 2, name: 'Bob' };
  }

  switchComponent() {
    // This recreates the entire component - more expensive
    this.UserProfile = SomeOtherComponent;
  }
}
```

## Advanced Features

### Promise Support

Both `template` and `component` properties can accept promises, perfect for lazy loading:

```typescript
// lazy-dashboard.ts
export class LazyDashboard {
  selectedWidgetType = 'chart';

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

<!-- Shows loading state while promise resolves -->
<au-compose
  component.bind="currentComponent"
  model.bind="widgetData">
</au-compose>
```

### Scope Behavior Control

For template-only compositions, you can control whether they inherit the parent scope:

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

## Real-World Examples

### Form Builder with Dynamic Fields

```typescript
// form-builder.ts
export class FormBuilder {
  TextInput = CustomElement.define({
    name: 'text-input',
    template: '<input type="text" value.bind="value" placeholder.bind="placeholder">'
  });

  NumberInput = CustomElement.define({
    name: 'number-input',
    template: '<input type="number" value.bind="value" min.bind="min" max.bind="max">'
  });

  SelectInput = CustomElement.define({
    name: 'select-input',
    template: '<select value.bind="value"><option repeat.for="opt of options" value.bind="opt.value">${opt.label}</option></select>'
  });

  fieldTypes = {
    text: this.TextInput,
    number: this.NumberInput,
    select: this.SelectInput
  };

  formConfig = [
    { type: 'text', name: 'firstName', placeholder: 'First Name', value: '' },
    { type: 'text', name: 'lastName', placeholder: 'Last Name', value: '' },
    { type: 'number', name: 'age', min: 0, max: 120, value: null },
    { type: 'select', name: 'country', options: [
      { value: 'us', label: 'United States' },
      { value: 'ca', label: 'Canada' }
    ], value: '' }
  ];

  getFieldComponent(field) {
    return this.fieldTypes[field.type];
  }
}
```

```html
<!-- form-builder.html -->
<form class="dynamic-form">
  <div repeat.for="field of formConfig" class="field-group">
    <label>${field.name | titleCase}:</label>
    <au-compose
      component.bind="getFieldComponent(field)"
      value.bind="field.value"
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
    { id: 'calendar', name: 'Calendar', url: '/plugins/calendar.js' }
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
        config: await this.loadPluginConfig(pluginConfig.id)
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

### Content Management with Dynamic Layouts

```typescript
// cms-renderer.ts
export class CmsRenderer {
  layoutComponents = {
    'hero-section': CustomElement.define({
      name: 'hero-section',
      template: `
        <section class="hero" style="background-image: url({{backgroundImage}})">
          <h1>{{title}}</h1>
          <p>{{subtitle}}</p>
          <button if.bind="ctaText">{{ctaText}}</button>
        </section>
      `
    }),
    'text-block': CustomElement.define({
      name: 'text-block',
      template: '<div class="text-content" innerHTML.bind="content"></div>'
    }),
    'image-gallery': CustomElement.define({
      name: 'image-gallery',
      template: `
        <div class="gallery">
          <img repeat.for="img of images" src.bind="img.url" alt.bind="img.alt">
        </div>
      `
    })
  };

  pageContent = [
    {
      type: 'hero-section',
      data: {
        title: 'Welcome to Our Site',
        subtitle: 'Building amazing experiences',
        backgroundImage: '/images/hero-bg.jpg',
        ctaText: 'Get Started'
      }
    },
    {
      type: 'text-block',
      data: {
        content: '<h2>About Us</h2><p>We create innovative solutions...</p>'
      }
    },
    {
      type: 'image-gallery',
      data: {
        images: [
          { url: '/images/1.jpg', alt: 'Project 1' },
          { url: '/images/2.jpg', alt: 'Project 2' }
        ]
      }
    }
  ];

  getLayoutComponent(block) {
    return this.layoutComponents[block.type];
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
<!-- Get the composition controller -->
<au-compose composition.bind="compositionRef"></au-compose>

<!-- Or get direct access to the view model (if it's a custom element) -->
<au-compose component.ref="viewModelRef"></au-compose>
```

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

<!-- For dynamic imports, use promises -->
<au-compose component.bind="import('./my-component')"></au-compose>
```

### Scope Inheritance Changes

**Aurelia 1:**
```html
<!-- Default was isolated scope -->
<compose view.bind="template" model.bind="data"></compose>
```

**Aurelia 2:**
```html
<!-- Default is now inherited scope -->
<au-compose template.bind="template" scope-behavior="auto"></au-compose>

<!-- For isolated scope like v1 default -->
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

export class Dashboard {
  // Define component inline or import it
  ChartWidget = CustomElement.define({
    name: 'chart-widget',
    template: '<div class="chart">Chart: ${title}</div>'
  });

  selectedComponent = this.ChartWidget;
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

1. **Binding Transfer**: In Aurelia 2, ALL bindings on `<au-compose>` are passed to the composed component
2. **Activation**: The `activate` method works the same but is now available on any component type
3. **Lifecycle**: Custom elements get full lifecycle, plain objects get activate/deactivate only
4. **Performance**: Aurelia 2's composition is more efficient with better change detection

## Best Practices

1. **Use promises for lazy loading** - Only load components when needed to improve performance
2. **Leverage the activate method** - Perfect for data initialization and updates
3. **Consider scope behavior** - Use `scoped` when you want isolation, `auto` for inheritance
4. **Cache component definitions** - Don't recreate the same CustomElement definitions repeatedly
5. **Handle loading states** - Show appropriate feedback while promises resolve
6. **Use models efficiently** - Changing models is cheaper than changing components

Dynamic composition gives you the flexibility to build truly dynamic UIs that adapt to your users' needs, load efficiently, and scale with your application's complexity.
