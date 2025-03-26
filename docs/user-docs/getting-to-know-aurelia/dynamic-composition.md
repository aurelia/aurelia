# Dynamic composition

Aurelia's dynamic composition enables you to render a view/view model pair—or just a view—dynamically at runtime. With `<au-compose>`, you can:
- Render any custom element by binding its definition to the `component` property.
- Render plain HTML templates.
- Dynamically swap components based on user state or configuration.
- Access lifecycle hooks (including an extra `activate` method) on the composed view model.

## Basic Composition

To render a custom element using its component definition, bind the element to `<au-compose>`:

{% code title="my-app.html" %}
```html
<au-compose component.bind="MyField"></au-compose>
```
{% endcode %}

In your view model, define the component with a custom element definition:

{% code title="my-component.ts" %}
```typescript
import { CustomElement } from '@aurelia/runtime-html';

export class App {
  MyField = CustomElement.define({
    name: 'my-input',
    template: '<input value.bind="value">'
  });
}
```
{% endcode %}

> **Info:** When a custom element is used, all standard lifecycle events (including `activate`) will be invoked.

---

## Composition with a String Component

If you pass a string to the `component` property, Aurelia treats it as the name of a custom element and performs a lookup. For example:

```html
<import from="./my-input"></import>
<au-compose component="my-input"></au-compose>
```

If `my-input` is registered globally, the lookup will succeed; otherwise, an error is thrown if no matching element definition is found.

---

## Composing Without a Custom Element

Dynamic composition isn’t limited to custom elements. You can compose a view only or combine a simple view model (plain object) with a view.

### Template-Only Composition

Render a simple HTML template:

```html
<au-compose template="<p>Hello world</p>"></au-compose>
```

Here, Aurelia processes the HTML string with its template compiler and renders it in place.

### Combining Template and Literal Object

You can supply both a view (template) and a literal object as the component:

```html
<au-compose repeat.for="i of 5" component.bind="{ value: i }" template="<div>\${value}</div>"></au-compose>
```

> **Note:** When composing without a custom element as the view model, the composed component will by default use the parent scope—unless you override it using `scope-behavior`.

---

## Customized Host Element

By default, composing a custom element creates a host element based on the element’s name (e.g. `<my-input>`). For non-custom element compositions, Aurelia inserts a comment boundary:

```html
<au-compose template="<input class='input-field' value.bind='value'"></au-compose>
```

**Renders as:**
```html
<!--au-start--><input class='input-field'><!--au-end-->
```

To wrap the composed content in a real HTML element, use the `tag` bindable property:

{% code title="my-component.html" %}
```html
<au-compose tag="div" class="form-field" template="<input class='input-field' value.bind='value'"></au-compose>
```
{% endcode %}

**Renders as:**
```html
<div class="form-field"><input class="input-field"></div>
```

Bindings declared on `<au-compose>` will be transferred to the new host element.

---

## Passing Data with `model.bind`

The `model` bindable lets you pass data into the composed view model. When the `model` changes, the `activate` method of the composed view model is called with the new value.

### Example – Passing a View Model

```html
<au-compose model.bind="myObject"></au-compose>
```

Or, pass an inline object:

```html
<au-compose model.bind="{ myProp: 'value', test: 'something' }"></au-compose>
```

In the composed component:

```typescript
export class MyComponent {
  activate(model) {
    // Access passed-in model properties.
  }
}
```

---

## When to Use Dynamic Composition

Dynamic composition is best suited for scenarios where standard custom element usage may be too rigid. Consider using `<au-compose>` when:

| **Scenario**                                         | **Why Use Dynamic Composition**                                                             |
|------------------------------------------------------|---------------------------------------------------------------------------------------------|
| **Dynamic Content Based on User Input or State**     | To render different views or components on the fly (e.g., dashboards, conditional widgets).  |
| **Rendering Unknown Components at Runtime**          | In plugin-based architectures, where components are not known at compile time.               |
| **Conditional Rendering of Multiple Views**          | Instead of complex `if.bind` or switch statements, use a single dynamic composition point.    |
| **Complex Reusable Layouts**                         | To inject varying content into consistent layouts, promoting reusability and DRY code.         |
| **Simplifying Component Interfaces**               | To encapsulate multiple parameters in a model object, avoiding overly complex interfaces.     |
| **Decoupling Component Logic**                     | To separate the decision of what to render from the rendering logic itself.                  |
| **Lazy Loading to Reduce Initial Load Time**         | To load components only when needed, improving performance in large, single-page applications. |

---

## Accessing the Composed View Model

Sometimes you need a reference to the view model of the composed component. Use the `component.ref` binding to capture it:

```html
<au-compose component.ref="myCompose"></au-compose>
```

This works similarly to `view-model.ref` in Aurelia 1, giving you programmatic access to the instance.

---

## Passing Props Through to the Composed Component

Bindings declared on `<au-compose>` are automatically passed to the composed view model (if it is a custom element). For example:

{% code title="app.html" %}
```html
<au-compose component.bind="myInput" value.bind="item"></au-compose>
```
{% endcode %}

Assuming the following component definition:

{% code title="my-input.ts" %}
```typescript
export class MyInput {
  @bindable() value;
}
```
{% endcode %}

{% code title="my-input.html" %}
```html
<input value.bind="value">
```
{% endcode %}

This works as if you had written in `app.html`:

```html
<my-input value.bind="item"></my-input>
```

---

## Migrating from Aurelia 1 `<compose>`

Dynamic composition in Aurelia 2 differs from Aurelia 1. Key changes include:

### Template and Component Property Renames

- **Aurelia 1:** `view.bind` and `view-model.bind`
- **Aurelia 2:** Use `template.bind` and `component.bind`

### String Values

- Passing a string now only works for custom element names. A string passed to `template` is interpreted as literal HTML.

### Scope Inheritance

- By default, when composing a view only or a plain object, the parent scope is inherited. To disable this, set the `scope-behavior` attribute:

```html
<au-compose scope-behavior="scoped"></au-compose>
```

### Bindings Transfer

- All bindings on `<au-compose>` are now transferred to the composed custom element’s view model. Thus, `component.ref` now returns the view model, not the composer itself.

### Dynamic Module Loading

If you need to load a module dynamically for the view, use a value converter:

{% code title="my-component.html" %}
```html
<au-compose template="https://my-server.com/templates/${componentName} | loadTemplate"></au-compose>
```
{% endcode %}

{% code title="load-template.ts" %}
```typescript
export class LoadTemplateValueConverter {
  toView(url: string): Promise<string> {
    return fetch(url).then(response => response.text());
  }
}
```
{% endcode %}

This value converter fetches the template from a URL and returns its text.
