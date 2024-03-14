# Dynamic composition

In this section, we will learn how you can dynamically render components in your applications by utilizing Aurelia's dynamic composition functionality.

When using Aurelia's `<au-compose>` element, inside of the view model being used, you have access to all of Aurelia's standard view lifecycle events and an extra `activate`.

The `<au-compose>` element allows us to compose view/view model pairs and just views, like a custom element, without specifying a tag name.

## Basic Composition

The `au-compose` element can render any custom element given to its `component` property. 

A basic example is:

{% code title="my-app.html" %}
```html
<au-compose component.bind="MyField"></au-compose>
```
{% endcode %}

{% code title="my-component.ts" %}
```javascript
import { CustomElement } from '@aurelia/runtime-html';

export class App {
  MyField = CustomElement.define({
    name: 'my-input',
    template: '<input value.bind="value">'
  })
}
```
{% endcode %}

{% hint style="info" %}
With a custom element as a view model, all standard lifecycles and `activate` will be called during the composition.

`activate` will be called right after `constructor`, before all other lifecycles.
{% endhint %}

### Composition with string as custom element name

When using a string value for `component` binding on `<au-compose>`, the value will be understood as a custom element name, and will be used to lookup the actual element definition.
If there's no element definition found either locally or globally, an error will be thrown.

The following usages are valid:

```html
<import from="./my-input"></import>

<au-compose component="my-input">
```

or, suppose `my-input` is a globally available custom element:
```html
<au-compose component="my-input">
```

## Composing Without a Custom Element

Composing using a custom element definition is not always necessary or convenient. The `au-compose` can also work with a slightly simpler composition: either using view only or view and simple view model combination.

An example of template-only composition:

```html
<au-compose template="<p>Hello world</p>"></au-compose>
```

We use the `<au-compose>` element inside our template and pass through a view to be rendered. The view is just a plain HTML string.

During a composition, this HTML string is processed by the Aurelia template compiler to produce necessary parts for UI composition and renders it inside the `<au-compose>` element.

Combining simple template and literal object as the component instance, we can also have powerful rendering without boilerplate:

```html
<au-compose repeat.for="i of 5" component.bind="{ value: i }" template="<div>\\${value}</div>"></au-compose>
```

{% hint style="info" %}
When composing without a custom element as a the component view model, the resulted component will use the parent scope as its scope unless `scope-behavior` is set to `scoped`
{% endhint %}

### Customized host element

When composing a custom element as component, a host element will be created based on the custom element name (e.g `my-input` results in `<my-input>`).
For non custom element composition, a comment will be created as the host, like in the following example:

{% code title="my-component.html" %}
```html
<au-compose template="<input class='input-field' value.bind='value'">
```
{% endcode %}

The rendered HTML will be:

```html
<!--au-start--><input class='input-field'><!--au-end-->
```

the comments `<!--au-start-->` and `<!--au-end-->` are the boundary of the composed html. Though sometimes it's desirable to have a real HTML element as the host. This can be achieved via the `tag` bindable property on the `<au-compose>` element. For example, in the same scenario above, we want to wrap the `<input class='input-field'>` in a `<div>` element with class `form-field`:

{% code title="my-component.html" %}
```html
<au-compose tag='div' class='form-field' template="<input class='input-field' value.bind='value'">
```
{% endcode %}

The rendered HTML will be:

```html
<div class='form-field'><input class='input-field'></div>
```

This behavior can be used to switch between different host elements when necessary, all bindings declared on `<au-compose>` will be transferred to the newly created host element if there is one.

## Passing Data Through `model.bind`

`activate` method on the view model, regardless of whether a custom element or a plain object is provided, will be called during the first composition and subsequent changes of the `model` property on the `<au-compose>` element.

```html
<au-compose model.bind="myObject"></au-compose>
```

You can also pass an object inline from the template:

```html
<au-compose model.bind="{myProp: 'value', test: 'something'}"></au-compose>
```

Inside the component view model being composed, the `activate` method will receive the object as its first argument.

```typescript
export class MyComponent {
    activate(model) {
        // Model contains the passed-in model object
    }
}
```
## When to Use Dynamic Composition Over Components

Dynamic composition in Aurelia is a powerful feature allowing greater flexibility in rendering components or views dynamically based on runtime conditions. However, it's important to understand when using dynamic composition (`<au-compose>`) over standard components is more appropriate. Here are some scenarios where dynamic composition can be particularly advantageous:

### Dynamic Content Based on User Input or State
When the content of your application needs to change dynamically based on user interactions or application state, dynamic composition is a great fit. For example, in a dashboard application where different widgets must be displayed based on user preferences, `<au-compose>` can dynamically load these widgets.

### Rendering Unknown Components at Runtime
Suppose your application needs to render components unknown at compile time, such as in a plugin-based architecture where plugins are loaded dynamically. In that case, dynamic composition is the way to go. It allows you to render these components without hardcoding them into your application.

### Conditional Rendering of Multiple Views
In cases where you need to render one of many possible views or components based on certain conditions, dynamic composition can be more efficient. Instead of using multiple `if.bind` statements or switch cases in your templates, you can use `<au-compose>` to select and render the appropriate view or component.

### Complex Reusable Layouts
When creating complex layouts that are reused across different parts of your application with different content, dynamic composition can be used to inject the specific content into these layouts. This approach promotes reusability and keeps your code DRY.

### Simplify Component Interfaces
In scenarios where passing numerous parameters to a component could make its interface overly complex, dynamic composition allows for encapsulating these parameters within a model object. This can simplify the interface and make the component easier to use.

### Decoupling of Component Logic
Dynamic composition can help decouple the logic of which component to display from the display logic itself. This separation of concerns can make your codebase more maintainable and easier to test.

### Reduce Initial Load Time
If your application is large and you want to reduce the initial load time, dynamic composition can be used to load components on demand. This lazy loading of components can significantly improve performance, especially for single-page applications with many features.

## Accessing the view model
In some scenarios, you may want to access the view model of the rendered component using `<au-compose>`. We can achieve this by adding the `component.ref`(known as `view-model.ref` in v1) binding to our compose element.

```html
<au-compose component.ref="myCompose"></au-compose>
```

This will work as though it were a `component.ref` binding on a standard custom element.

## Passing props through

The `<au-compose>` will pass all bindings, except those targeting its bindable properties (`model`/`component`/`template`) declared on it, to the composed view model, assuming it is a custom element.

As an example, for the following scenario:

{% code title="app.html"%}
```HTML
<au-compose component.bind="myInput" value.bind="item">
```
{% endcode %}

{% code title="my-input.ts" %}
```ts
export class MyInput {
  @bindable() value
}
```
{% endcode %}

{% code title="my-input.html" %}
```html
<input value.bind="value">
```
{% endcode %}

It will work as if you have the following content in `app.html`:

{% code title="app.html"%}
```html
<my-input  value.bind="item">
```
{% endcode %}

## Migrating from Aurelia 1 \<compose>

The composition in Aurelia 2 is fundamentally different from Aurelia 1. The same ease of use is still there, but how some things worked in v1 does not work the same in v2.

### Template and component-breaking changes

1. In Aurelia 2, the `view` and `view-model` properties have been renamed `template` and `component` respectively.

    If you were having `view.bind` or `view-model.bind`, change them to `template.bind` or `component.bind` respectively.

2. In Aurelia 2, passing a string to the view or view-model properties no longer means module name. In Aurelia 1, the module would be resolved to a file. In v2, the view property only understands string values, and the view-model property only understands objects and classes.

If you still want a view supporting a dynamically loaded module, you can create a value converter that achieves this.

{% code title="my-component.html" %}
```html
  <au-compose template="https://my-server.com/templates/${componentName} | loadTemplate">
```
{% endcode %}

{% code title="load-template.ts" %}
```javascript
  class LoadTemplateValueConverter {
    toView(v) { return fetch(v).then(r => r.text()) }
  }
```
{% endcode %}

The above value converter will load the URL and return the text response. For view models, something similar can be achieved where an object or class can be returned.

3. In Aurelia 2, all bindings are transferred to the underlying custom element composition. Therefore, `component.ref` no longer signifies obtaining a reference to the composer but rather to the composed view model.
4. Scope-breaking changes

    By default, when composing, the outer scope will not be inherited. The parent scope will only be inherited when no custom element is composed. This means the outer scope will be used when composing only a view or plain object as the view model.

    You can disable this behaviour using the `scope-behavior` attribute.

    ```html
      <au-compose scope-behavior="scoped">
    ```

    **Possible values are:**

    * auto: in view only composition: inherit the parent scope
    * scoped: never inherit parent scope even in view only composition
