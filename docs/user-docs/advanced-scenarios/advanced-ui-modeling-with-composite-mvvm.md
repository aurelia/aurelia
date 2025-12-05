---
description: Master dynamic UI composition, runtime component selection, and advanced MVVM patterns for building flexible, data-driven user interfaces with Aurelia.
---

# Advanced UI Modeling with Composite MVVM

Build sophisticated, dynamic user interfaces where components and layouts are determined at runtime based on data, user preferences, or application state. This advanced scenario covers composite patterns, dynamic composition strategies, and architectural approaches for building highly flexible UIs.

## Why This Is an Advanced Scenario

Advanced UI modeling requires mastery of:
- **Dynamic composition** - Rendering components chosen at runtime
- **MVVM architecture** - Clean separation of concerns at scale
- **Component communication** - Message passing between dynamic parts
- **Lifecycle management** - Coordinating activate/deactivate across compositions
- **Data-driven UI** - Metadata-to-component mappings
- **Performance** - Efficient composition and view recycling
- **Type safety** - TypeScript across dynamic boundaries

Use cases for composite MVVM:
- **Dashboard builders** - Users configure widget layouts
- **Form builders** - Dynamic form fields based on schemas
- **Plugin architectures** - Extensible UIs with runtime-loaded components
- **Content management** - Page layouts vary by content type
- **Multi-tenant applications** - UI variations per customer
- **Wizards and flows** - Step sequences determined by data

## Complete Guide

For comprehensive documentation on dynamic composition and component patterns:

**See the complete guide:** [Dynamic Composition](../getting-to-know-aurelia/dynamic-composition.md)

This covers:
- `<au-compose>` element and all its capabilities
- Component composition vs. template composition
- Passing data with the `model` bindable
- Scope inheritance and isolation
- Lifecycle hooks (`activate`, `deactivate`)
- Promise-based async composition
- Performance optimization techniques

## Quick Example: Dashboard Widgets

```typescript
// dashboard.ts
import { CustomElement } from '@aurelia/runtime-html';

// Define widgets
const ChartWidget = CustomElement.define({
  name: 'chart-widget',
  template: '<div class="chart">${title}</div>'
});

const TableWidget = CustomElement.define({
  name: 'table-widget',
  template: '<table><tr><td>${data}</td></tr></table>'
});

export class Dashboard {
  // User configuration determines layout
  widgets = [
    { type: ChartWidget, title: 'Sales', row: 0, col: 0 },
    { type: TableWidget, data: 'Revenue', row: 0, col: 1 },
    { type: ChartWidget, title: 'Users', row: 1, col: 0 }
  ];
}
```

```html
<!-- dashboard.html -->
<div class="dashboard-grid">
  <div repeat.for="widget of widgets"
       class="grid-item"
       style="grid-row: ${widget.row + 1}; grid-column: ${widget.col + 1};">
    <au-compose component.bind="widget.type"
                model.bind="widget">
    </au-compose>
  </div>
</div>
```

## Architecture Patterns

### 1. Factory Pattern
Centralize component resolution logic:

```typescript
import { IContainer, resolve } from '@aurelia/kernel';

export class ComponentFactory {
  private container = resolve(IContainer);

  create(type: string, config: any) {
    switch(type) {
      case 'chart': return ChartComponent;
      case 'table': return TableComponent;
      case 'form': return FormComponent;
      default: throw new Error(`Unknown type: ${type}`);
    }
  }
}
```

### 2. Registry Pattern
Map metadata to components:

```typescript
export class ComponentRegistry {
  private registry = new Map<string, CustomElementType>();

  register(name: string, component: CustomElementType) {
    this.registry.set(name, component);
  }

  resolve(name: string) {
    const component = this.registry.get(name);
    if (!component) {
      throw new Error(`Component not found: ${name}`);
    }
    return component;
  }
}
```

### 3. Builder Pattern
Construct complex UIs fluently:

```typescript
export class UIBuilder {
  private components: ComponentConfig[] = [];

  addSection(title: string) {
    this.components.push({ type: 'section', props: { title } });
    return this;
  }

  addChart(data: any) {
    this.components.push({ type: 'chart', props: { data } });
    return this;
  }

  build() {
    return this.components;
  }
}

// Usage
const ui = new UIBuilder()
  .addSection('Overview')
  .addChart(salesData)
  .addSection('Details')
  .build();
```

### 4. Strategy Pattern
Swap rendering strategies:

```typescript
export interface IRenderStrategy {
  render(data: any, container: Element): void;
}

export class GridStrategy implements IRenderStrategy {
  render(data, container) {
    // Render in grid layout
  }
}

export class ListStrategy implements IRenderStrategy {
  render(data, container) {
    // Render in list layout
  }
}

export class Renderer {
  constructor(private strategy: IRenderStrategy) {}

  setStrategy(strategy: IRenderStrategy) {
    this.strategy = strategy;
  }

  render(data, container) {
    this.strategy.render(data, container);
  }
}
```

## Communication Patterns

### Event Aggregator
Decouple dynamic components:

```typescript
import { IEventAggregator, resolve } from '@aurelia/kernel';

export class WidgetA {
  private ea = resolve(IEventAggregator);

  sendMessage() {
    this.ea.publish('widget:message', { data: 'hello' });
  }
}

export class WidgetB {
  private ea = resolve(IEventAggregator);

  attached() {
    this.ea.subscribe('widget:message', msg => {
      console.log('Received:', msg.data);
    });
  }
}
```

### Shared State
Use dependency injection for shared data:

```typescript
import { DI, resolve } from '@aurelia/kernel';

export interface IDashboardState {
  selectedWidget: string | null;
  filters: Record<string, any>;
}

export const IDashboardState = DI.createInterface<IDashboardState>();

export class DashboardState implements IDashboardState {
  selectedWidget = null;
  filters = {};
}

// Widgets inject shared state
export class Widget {
  private state = resolve(IDashboardState);

  select() {
    this.state.selectedWidget = this.id;
  }
}
```

## Data-Driven UI Example

```typescript
// Schema-based form rendering
export class FormBuilder {
  schema = {
    fields: [
      { type: 'text', name: 'username', label: 'Username', required: true },
      { type: 'email', name: 'email', label: 'Email', required: true },
      { type: 'select', name: 'country', label: 'Country', options: ['US', 'UK', 'CA'] },
      { type: 'checkbox', name: 'newsletter', label: 'Subscribe to newsletter' }
    ]
  };

  componentMap = {
    'text': TextInput,
    'email': EmailInput,
    'select': SelectInput,
    'checkbox': CheckboxInput
  };

  getComponent(field) {
    return this.componentMap[field.type];
  }
}
```

```html
<form>
  <div repeat.for="field of schema.fields">
    <au-compose component.bind="getComponent(field)"
                model.bind="field">
    </au-compose>
  </div>
  <button>Submit</button>
</form>
```

## Performance Optimization

### View Recycling
```typescript
export class OptimizedDashboard {
  // Reuse component instances
  private viewCache = new Map();

  getOrCreateView(type: string) {
    if (!this.viewCache.has(type)) {
      this.viewCache.set(type, this.createView(type));
    }
    return this.viewCache.get(type);
  }
}
```

### Lazy Loading
```typescript
export class LazyDashboard {
  async loadWidget(name: string) {
    const module = await import(`./widgets/${name}`);
    return module.default;
  }
}
```

```html
<au-compose component.bind="loadWidget('chart-widget')">
</au-compose>
```

## Testing Dynamic UIs

```typescript
import { TestContext, assert } from '@aurelia/testing';

describe('DynamicDashboard', () => {
  it('renders widgets based on configuration', async () => {
    const ctx = TestContext.create();
    const au = ctx.container.get(IAurelia);

    await au.app({
      host: ctx.doc.createElement('div'),
      component: Dashboard
    }).start();

    const composed = ctx.doc.querySelectorAll('au-compose');
    assert.strictEqual(composed.length, 3);
  });
});
```

## What You'll Learn

The complete dynamic composition guide covers:

1. **`<au-compose>` Basics** - The core composition element
2. **Component Composition** - Using custom element classes
3. **Template Composition** - Inline HTML templates
4. **Model Passing** - Data flow to composed components
5. **Lifecycle Integration** - activate/deactivate hooks
6. **Scope Management** - Inheritance vs. isolation
7. **Async Composition** - Promise-based loading
8. **Performance** - Caching and optimization
9. **Advanced Patterns** - Inheritance, mixins, decorators
10. **Real-World Examples** - Dashboard, forms, content management

## Common Pitfalls

1. **Memory leaks** - Clean up subscriptions in dynamic components
2. **Scope confusion** - Understand when scope inherits vs. isolates
3. **Lifecycle timing** - Compose/activate order matters
4. **Type safety** - Use generics for strongly-typed models
5. **Performance** - Don't recreate components unnecessarily

## Architecture Principles

### Single Responsibility
Each composed component should have one clear purpose.

### Open/Closed
Design components to be extended without modification.

### Dependency Inversion
Depend on abstractions (interfaces) not concrete components.

### Interface Segregation
Composed components should only implement needed interfaces.

### Liskov Substitution
Composed components should be interchangeable.

## Migration from Aurelia 1

Key differences:
- **`<au-compose>` replaces `<compose>`**
- **More bindables** - Better control over composition
- **Better TypeScript** - Full type inference
- **Improved performance** - Faster composition and teardown
- **Simpler lifecycle** - Fewer hooks to manage

---

**Ready to build dynamic UIs?** Head to the [complete Dynamic Composition guide](../getting-to-know-aurelia/dynamic-composition.md).

## Additional Resources

- [Component Basics](../components/components.md)
- [Template Controllers](../getting-to-know-aurelia/template-controllers.md)
- [Event Aggregator](../getting-to-know-aurelia/event-aggregator.md)
- [Dependency Injection](../getting-to-know-aurelia/dependency-injection.md)
- [Building Dashboard Tutorial](../tutorials/create-a-dashboard-using-dynamic-composition.md)

