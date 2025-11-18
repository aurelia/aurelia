---
description: >-
  Learn how to use Shadow DOM in Aurelia components for style encapsulation and native web component features.
---

# Shadow DOM

Shadow DOM provides native browser encapsulation for your components, isolating styles and DOM structure. Aurelia makes it easy to enable Shadow DOM for any custom element.

## Enabling Shadow DOM

### Using the @useShadowDOM Decorator

The simplest way to enable Shadow DOM is with the `@useShadowDOM` decorator:

```typescript
import { customElement, useShadowDOM } from 'aurelia';

@customElement('my-card')
@useShadowDOM()
export class MyCard {
  message = 'Hello from Shadow DOM';
}
```

By default, this creates a shadow root with `mode: 'open'`.

### Configuring Shadow DOM Mode

Shadow DOM supports two modes: `open` and `closed`.

**Open mode** (default) allows external JavaScript to access the shadow root:

```typescript
@customElement('open-element')
@useShadowDOM({ mode: 'open' })
export class OpenElement {
  // External code can access: element.shadowRoot
}
```

**Closed mode** prevents external access to the shadow root:

```typescript
@customElement('closed-element')
@useShadowDOM({ mode: 'closed' })
export class ClosedElement {
  // External code cannot access shadowRoot
  // element.shadowRoot returns null
}
```

### Using the Configuration Object

You can also configure Shadow DOM using the `@customElement` decorator's configuration object:

```typescript
import { customElement } from 'aurelia';

@customElement({
  name: 'my-element',
  shadowOptions: { mode: 'open' }
})
export class MyElement {}
```

Or using a static property:

```typescript
export class MyElement {
  static shadowOptions = { mode: 'open' };
}
```

## Styling Shadow DOM Components

Shadow DOM provides complete CSS isolation. Styles defined outside the component won't affect elements inside, and styles inside won't leak out.

### Component-Local Styles

Use the `shadowCSS` helper to register styles for your component:

```typescript
import { customElement, useShadowDOM, shadowCSS } from 'aurelia';

@customElement({
  name: 'styled-card',
  template: `
    <div class="card">
      <h2 class="title">\${title}</h2>
      <div class="content">
        <slot></slot>
      </div>
    </div>
  `,
  dependencies: [
    shadowCSS(`
      .card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .title {
        margin: 0 0 12px 0;
        color: #333;
      }
      .content {
        color: #666;
      }
    `)
  ]
})
@useShadowDOM()
export class StyledCard {
  title = 'Card Title';
}
```

### Using Constructable Stylesheets

For better performance and reusability, you can pass `CSSStyleSheet` instances:

```typescript
// Create a reusable stylesheet
const cardStyles = new CSSStyleSheet();
cardStyles.replaceSync(`
  .card {
    border: 1px solid #ddd;
    padding: 16px;
  }
`);

@customElement({
  name: 'optimized-card',
  template: '<div class="card"><slot></slot></div>',
  dependencies: [shadowCSS(cardStyles)]
})
@useShadowDOM()
export class OptimizedCard {}
```

### Global Shared Styles

Configure styles that apply to all Shadow DOM components in your application:

```typescript
import Aurelia from 'aurelia';
import { StyleConfiguration } from '@aurelia/runtime-html';

Aurelia
  .register(
    StyleConfiguration.shadowDOM({
      sharedStyles: [
        `
          * {
            box-sizing: border-box;
          }
          :host {
            display: block;
          }
        `
      ]
    })
  )
  .app(component)
  .start();
```

Global styles are applied first, followed by component-local styles.

### Styling from Outside: CSS Custom Properties

The only way to style Shadow DOM components from outside is using CSS custom properties (CSS variables):

{% tabs %}
{% tab title="my-button.ts" %}
```typescript
import { customElement, useShadowDOM, shadowCSS } from 'aurelia';

@customElement({
  name: 'my-button',
  template: '<button><slot></slot></button>',
  dependencies: [
    shadowCSS(`
      button {
        background: var(--button-bg, #007bff);
        color: var(--button-color, white);
        border: none;
        padding: 8px 16px;
        border-radius: var(--button-radius, 4px);
        cursor: pointer;
      }
      button:hover {
        background: var(--button-hover-bg, #0056b3);
      }
    `)
  ]
})
@useShadowDOM()
export class MyButton {}
```
{% endtab %}

{% tab title="app.html" %}
```html
<style>
  /* Theme the button from outside */
  .danger {
    --button-bg: #dc3545;
    --button-hover-bg: #c82333;
    --button-radius: 8px;
  }
</style>

<my-button>Default Button</my-button>
<my-button class="danger">Danger Button</my-button>
```
{% endtab %}
{% endtabs %}

## Shadow DOM and Slots

Native `<slot>` elements **require** Shadow DOM. Attempting to use `<slot>` without Shadow DOM will throw a compilation error.

### Basic Slot Usage

```typescript
import { customElement, useShadowDOM } from 'aurelia';

@customElement({
  name: 'modal-dialog',
  template: `
    <div class="modal-overlay">
      <div class="modal-content">
        <slot></slot>
      </div>
    </div>
  `
})
@useShadowDOM()
export class ModalDialog {}
```

Usage:

```html
<modal-dialog>
  <h2>Modal Title</h2>
  <p>Modal content goes here</p>
</modal-dialog>
```

### Named Slots

```typescript
@customElement({
  name: 'card-layout',
  template: `
    <div class="card">
      <header class="card-header">
        <slot name="header"></slot>
      </header>
      <div class="card-body">
        <slot></slot>
      </div>
      <footer class="card-footer">
        <slot name="footer"></slot>
      </footer>
    </div>
  `
})
@useShadowDOM()
export class CardLayout {}
```

Usage:

```html
<card-layout>
  <span slot="header">Card Header</span>
  <p>Main content goes in the default slot</p>
  <div slot="footer">
    <button>Action</button>
  </div>
</card-layout>
```

### Fallback Content

Slots can have default content when nothing is projected:

```typescript
@customElement({
  name: 'greeting-card',
  template: `
    <div class="greeting">
      <slot>Hello, Guest!</slot>
    </div>
  `
})
@useShadowDOM()
export class GreetingCard {}
```

```html
<!-- Uses fallback -->
<greeting-card></greeting-card>
<!-- Output: Hello, Guest! -->

<!-- Overrides fallback -->
<greeting-card>Hello, John!</greeting-card>
<!-- Output: Hello, John! -->
```

### Listening to Slot Changes

React to changes in slotted content:

{% tabs %}
{% tab title="my-list.html" %}
```html
<div class="list">
  <slot slotchange.trigger="handleSlotChange($event)"></slot>
</div>
```
{% endtab %}

{% tab title="my-list.ts" %}
```typescript
import { customElement, useShadowDOM } from 'aurelia';

@customElement('my-list')
@useShadowDOM()
export class MyList {
  handleSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    const assignedNodes = slot.assignedNodes();
    console.log('Slot changed, node count:', assignedNodes.length);
  }
}
```
{% endtab %}
{% endtabs %}

For more advanced slot usage, including the `@children` decorator and component view model retrieval, see the [Slotted Content documentation](shadow-dom-and-slots.md).

## Constraints and Limitations

### Cannot Combine with @containerless

Shadow DOM requires a host element to attach to. You cannot use both `@useShadowDOM` and `@containerless` on the same component:

```typescript
// ❌ This will throw an error at runtime
@customElement('invalid-component')
@useShadowDOM()
@containerless()
export class InvalidComponent {}
```

**Error**: `Invalid combination: cannot combine the containerless custom element option with Shadow DOM.`

### Native Slots Require Shadow DOM

Using `<slot>` elements without enabling Shadow DOM will cause a compilation error:

```typescript
// ❌ This will throw a compilation error
@customElement({
  name: 'broken-component',
  template: '<div><slot></slot></div>'
  // Missing shadowOptions!
})
export class BrokenComponent {}
```

**Error**: `Template compilation error: detected a usage of "<slot>" element without specifying shadow DOM options in element: broken-component`

**Solution**: Either enable Shadow DOM or use `<au-slot>` instead:

```typescript
// ✅ Option 1: Enable Shadow DOM
@customElement({
  name: 'fixed-component',
  template: '<div><slot></slot></div>'
})
@useShadowDOM()
export class FixedComponent {}

// ✅ Option 2: Use <au-slot> without Shadow DOM
@customElement({
  name: 'alternative-component',
  template: '<div><au-slot></au-slot></div>'
})
export class AlternativeComponent {}
```

## Choosing Between Shadow DOM and Light DOM

### Use Shadow DOM When:

- **Style isolation is critical**: You need to prevent external styles from affecting your component
- **Building reusable components**: Your component will be used in different contexts and needs predictable styling
- **Using native web component features**: You need features like `<slot>`, CSS `:host` selector, or `::part`
- **Creating a design system**: Components should maintain consistent appearance regardless of environment

### Use Light DOM (no Shadow DOM) When:

- **Easy styling is important**: Parent components or application styles should easily affect the component
- **Working with global styles**: Your component should inherit application-wide styles
- **SEO is a concern**: Search engines can more easily index light DOM content
- **Using `<au-slot>`**: You need Aurelia's slot features like `$host` scope access

## Practical Examples

### Themed Button Component

{% tabs %}
{% tab title="theme-button.ts" %}
```typescript
import { customElement, useShadowDOM, shadowCSS, bindable } from 'aurelia';

@customElement({
  name: 'theme-button',
  template: `
    <button class="btn \${variant}">
      <slot></slot>
    </button>
  `,
  dependencies: [
    shadowCSS(`
      .btn {
        padding: var(--btn-padding, 10px 20px);
        border: none;
        border-radius: var(--btn-radius, 4px);
        font-size: var(--btn-font-size, 16px);
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn.primary {
        background: var(--primary-bg, #007bff);
        color: var(--primary-color, white);
      }
      .btn.primary:hover {
        background: var(--primary-hover, #0056b3);
      }
      .btn.secondary {
        background: var(--secondary-bg, #6c757d);
        color: var(--secondary-color, white);
      }
      .btn.secondary:hover {
        background: var(--secondary-hover, #545b62);
      }
    `)
  ]
})
@useShadowDOM()
export class ThemeButton {
  @bindable variant: 'primary' | 'secondary' = 'primary';
}
```
{% endtab %}

{% tab title="usage.html" %}
```html
<style>
  .custom-theme {
    --primary-bg: #28a745;
    --primary-hover: #218838;
    --btn-radius: 20px;
  }
</style>

<theme-button variant="primary">Default Primary</theme-button>
<theme-button variant="secondary">Default Secondary</theme-button>

<div class="custom-theme">
  <theme-button variant="primary">Custom Themed</theme-button>
</div>
```
{% endtab %}
{% endtabs %}

### Card with Multiple Slots

{% tabs %}
{% tab title="info-card.ts" %}
```typescript
import { customElement, useShadowDOM, shadowCSS, bindable } from 'aurelia';

@customElement({
  name: 'info-card',
  template: `
    <div class="card \${expanded ? 'expanded' : ''}">
      <header class="card-header" click.trigger="toggle()">
        <slot name="header">Untitled Card</slot>
        <span class="toggle">\${expanded ? '−' : '+'}</span>
      </header>
      <div class="card-body" if.bind="expanded">
        <slot></slot>
      </div>
      <footer class="card-footer" if.bind="expanded">
        <slot name="footer"></slot>
      </footer>
    </div>
  `,
  dependencies: [
    shadowCSS(`
      .card {
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 16px;
      }
      .card-header {
        background: #f8f9fa;
        padding: 16px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        user-select: none;
      }
      .card-header:hover {
        background: #e9ecef;
      }
      .toggle {
        font-size: 24px;
        font-weight: bold;
      }
      .card-body {
        padding: 16px;
      }
      .card-footer {
        background: #f8f9fa;
        padding: 12px 16px;
        border-top: 1px solid #ddd;
      }
    `)
  ]
})
@useShadowDOM()
export class InfoCard {
  @bindable expanded = false;

  toggle() {
    this.expanded = !this.expanded;
  }
}
```
{% endtab %}

{% tab title="usage.html" %}
```html
<info-card expanded.bind="true">
  <strong slot="header">User Information</strong>

  <div>
    <p><strong>Name:</strong> John Doe</p>
    <p><strong>Email:</strong> john@example.com</p>
    <p><strong>Role:</strong> Developer</p>
  </div>

  <div slot="footer">
    <button>Edit</button>
    <button>Delete</button>
  </div>
</info-card>

<info-card>
  <span slot="header">System Status</span>
  <p>All systems operational</p>
</info-card>
```
{% endtab %}
{% endtabs %}

### Component with Dynamic Styles

{% tabs %}
{% tab title="progress-bar.ts" %}
```typescript
import { customElement, useShadowDOM, shadowCSS, bindable, resolve } from 'aurelia';
import { INode } from '@aurelia/runtime-html';

@customElement({
  name: 'progress-bar',
  template: `
    <div class="progress-container">
      <div class="progress-bar" css="width: \${percentage}%"></div>
      <span class="progress-text">\${percentage}%</span>
    </div>
  `,
  dependencies: [
    shadowCSS(`
      .progress-container {
        position: relative;
        width: 100%;
        height: 30px;
        background: #e9ecef;
        border-radius: 15px;
        overflow: hidden;
      }
      .progress-bar {
        height: 100%;
        background: var(--progress-color, #007bff);
        transition: width 0.3s ease;
      }
      .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-weight: bold;
        color: #333;
      }
    `)
  ]
})
@useShadowDOM()
export class ProgressBar {
  @bindable percentage = 0;

  private host = resolve(INode);

  percentageChanged(newValue: number) {
    // Change color based on progress
    const color = newValue < 30 ? '#dc3545' :
                  newValue < 70 ? '#ffc107' :
                  '#28a745';
    this.host.style.setProperty('--progress-color', color);
  }
}
```
{% endtab %}

{% tab title="usage.html" %}
```html
<progress-bar percentage.bind="25"></progress-bar>
<progress-bar percentage.bind="50"></progress-bar>
<progress-bar percentage.bind="90"></progress-bar>
```
{% endtab %}
{% endtabs %}

## Best Practices

### 1. Use CSS Custom Properties for Theming

Allow users to customize your components through CSS variables with sensible defaults:

```typescript
shadowCSS(`
  .component {
    color: var(--component-color, #333);
    background: var(--component-bg, white);
    padding: var(--component-padding, 16px);
  }
`)
```

### 2. Provide Fallback Content for Slots

Give users a good default experience even when they don't provide slot content:

```html
<slot name="header">
  <h2>Default Header</h2>
</slot>
```

### 3. Namespace Your CSS Variables

Prevent naming conflicts by prefixing your component's CSS variables:

```typescript
shadowCSS(`
  .card {
    background: var(--my-card-bg, white);
    border: 1px solid var(--my-card-border, #ddd);
  }
`)
```

### 4. Consider Performance with Constructable Stylesheets

For components that may be instantiated many times, use `CSSStyleSheet` objects instead of strings:

```typescript
// Create once, reuse many times
const sharedStyles = new CSSStyleSheet();
sharedStyles.replaceSync(`/* styles */`);

dependencies: [shadowCSS(sharedStyles)]
```

### 5. Use Open Mode Unless You Have a Reason Not To

Closed mode prevents useful debugging and testing. Use open mode by default:

```typescript
@useShadowDOM() // defaults to open mode
```

### 6. Document Your CSS Custom Properties

If your component supports theming, document the available CSS variables:

```typescript
/**
 * CSS Variables:
 * --card-bg: Background color (default: white)
 * --card-border: Border color (default: #ddd)
 * --card-padding: Internal padding (default: 16px)
 */
@customElement('themable-card')
@useShadowDOM()
export class ThemableCard {}
```

## Additional Resources

- [Slotted Content Documentation](shadow-dom-and-slots.md) - Deep dive into slots, `@children`, and `@slotted` decorators
- [Web Components Documentation](../developer-guides/web-components.md) - Using Aurelia components as web components
- [CustomElement API Reference](customelement-api.md) - Complete API documentation including Shadow DOM options
