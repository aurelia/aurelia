# Dynamic composition

In this section, we will learn how you can dynamically render components in your applications by utilizing Aurelia's dynamic composition functionality.&#x20;

When using Aurelia's `<au-compose>` element, inside of the view model being used, you have access to all of Aurelia's standard view lifecycle events, as well as an extra `activate`.

The `<au-compose>` element allows us to compose view/view model pairs and just views, like a custom element, without specifying a tag name.

## Basic Composition

The `au-compose` element can be used to render any custom element given to its `component` property. A basic example is:

{% code title="my-app.html" %}
```markup
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
With a custom element as a view model, all standard lifecycles, and `activate` will be called during the composition.
{% endhint %}

## Composing Without a Custom Element

Composing using a custom element definition is not always necessary or convenient. The `au-compose` can also work with a slightly simpler composition: either using view only or view and simple view model combination.

An example of template-only composition:

```markup
<au-compose template="<p>Hello world</p>"></au-compose>
```

Inside our template, we use the `<au-compose>` element and pass through a view to be rendered. The view is just a plain HTML string.

During a composition, this HTML string is processed by the Aurelia template compiler to produce necessary parts for UI composition and renders it inside the `<au-compose>` element.

Combining simple view and literal object as view model, we can also have powerful rendering without boilerplate:

```markup
<au-compose repeat.for="i of 5" component.bind="{ value: i }" template="<div>\\${value}</div>"></au-compose>
```

{% hint style="info" %}
When composing without a custom element as view model, the result component will use the parent scope as its scope unless `scope-behavior` is set to `scoped`
{% endhint %}

## Passing through data

`activate` method on the view model, regardless of whether a custom element or a plain object is provided, will be called during the first composition and subsequent changes of the `model` property on the `<au-compose>` element.

```html
<au-compose model.bind="myObject"></au-compose>
```

You can also pass an object inline from the template too:

```html
<au-compose model.bind="{myProp: 'value', test: 'something'}"></au-compose>
```

Inside the component view model being composed, the `activate` method will receive the object as its first argument.

```typescript
export class MyComponent {
    activate(model) {
        // Model contains the passed in model object
    }
}
```

## Accessing the view model

In some scenarios, you may want to access the view model of the component being rendered using `<au-compose>` we can achieve this by adding the `view-model.ref` binding to our compose element.

```html
<au-compose view-model.ref="myCompose"></au-compose>
```

This will work as though it were a `view-model.ref` binding on a standard custom element.

## Passing props through

The `<au-compose>` will pass all bindings, except those targeting its bindable properties (`model`/`component`/`template`) declared on it, to the composed view model, assuming it is a custom element.

As an example, for the following scenario:

{% code title="app.html"%}
```html
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

It will work as if you were having the following content in `app.html`:

{% code title="app.html"%}
```html
<my-input  value.bind="item">
```
{% endcode %}

## Migrating from Aurelia 1 \<compose>

The composition in Aurelia 2 is fundamentally different than Aurelia 1. The same ease of use is still there, but the way in which some things worked in v1 does not work the same in v2.

### Template and component-breaking changes

1. In aurelia 2, `view` and `view-model` properties have been renamed to `template` and `component` respectively.

    If you were having `view.bind` or `view-model.bind`, change them to `template.bind` or `component.bind` respectively.

2. In Aurelia 2, passing a string to the view or view-model properties no longer means module name. In Aurelia 1, the module would be resolved to a file. In v2, the view property only understands string values, and the view-model property only understands objects and classes.

If you still want a view supporting a dynamically loaded module, you can create a value converter that achieves this.

{% code title="my-component.html" %}
```markup
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

3. In Aurelia 2, all bindings are transferred to the underlying custom element composition. Therefore, `view-model.ref` no longer signifies obtaining a reference to the composer, but rather to the composed view model.
### Scope breaking changes

By default, when composing, the outer scope will not be inherited. The parent scope will only be inherited when it is not a custom element being composed. This means the outer scope will be used when composing only a view or plain object as the view model.

You can disable this behavior using the `scope-behavior` attribute.

```markup
  <au-compose scope-behavior="scoped">
```

**Possible values are:**

* auto: in view only composition: inherit the parent scope
* scoped: never inherit parent scope even in view only composition
