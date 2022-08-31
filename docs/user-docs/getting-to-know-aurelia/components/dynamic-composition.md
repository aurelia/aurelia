# Dynamic composition

In this section, we are going to be learning how you can dynamically render components in your applications by utilizing Aurelia's dynamic composition functionality. When using Aurelia's `<au-compose>` element, inside of the view-model being used, you have access to all of Aurelia's standard view lifecycle events, as well as an extra `activate`.

The `<au-compose>` element allows us to compose view/view model pairs as well as just views, kind of like a custom element without having to specify a tag name.

Here is a simple example showcasing how to dynamically compose a view/view model pair:

```markup
<au-compose view-model=""></au-compose>
```

## Basic Composition

The `au-compose` element can be used to render any custom element given to its `view-model` property. A basic example is:

{% code title="my-app.html" %}
```markup
<au-compose view-model.bind="MyField"></au-compose>
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
With a custom element as view model, all standard lifecycles, and `activate` will be called during the composition.
{% endhint %}

## Composing Without a Custom Element

It's not always necessary, or convenient to compose using a custom element definition. The `au-compose` can also work with a slightly simpler composition: either using view only, or view and simple view model combination.

An example of view only composition:

```markup
<au-compose view="<p>Hello world</p>"></au-compose>
```

Inside of our template, we are using the `<au-compose>` element and passing through a view to be rendered. The view is just a plain html string.

During a composition, this html string is processed by Aurelia template compiler to produce necessary parts for UI composition and renders it inside the `<au-compose>` element.

Combining simple view and literal object as view model, we can also have powerful rendering without boilerplate:

```markup
<au-compose repeat.for="i of 5" view-model.bind="{ value: i }" view="<div>\\${value}</div>"></au-compose>
```

{% hint style="info" %}
When composing without a custom element as view-model, the result component will use parent scope as its scope, unless `scope-behavior` is set to `scoped`
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

Inside of the component view model being composed, the `activate` method will receive the object as its first argument.

```typescript
export class MyComponent {
    activate(model) {
        // Model contains the passed in model object
    }
}
```

## Accessing the view-model

In some scenarios you may want to access the view-model of the component being rendered using `<au-compose>` we can achieve this by adding the `view-model.ref` binding to our compose element.

```html
<au-compose view-model.ref="myCompose"></au-compose>
```

This will add a property to the host class called `myCompose`

```typescript
export class MyApp {
    readonly myCompose;
}
```

However, one pitfall you will encounter is the view-model that gets passed to the `ref` binding is a constructable component and not the instance itself. If you worked with Aurelia 1, you might be expecting the passed `view-model` instance to be the instance itself, not the class definition.

To access the instance itself, we need to reference the composition controller:

```typescript
export class MyApp {
    readonly myCompose;
    myViewModel;
    
    constructor() {
        this.myViewModel= this.myCompose.composition.controller.viewModel;
    }
}
```

We can now do things such as calling methods inside of our composed view-model and other tasks you might need to accomplish for composed components.

## Migrating from v1 \<compose>

Composition in Aurelia 2 is fundamentally different than it was in Aurelia 1. The same ease of use is still there, but the way in which some things worked in v1 does not work the same in v2.

### View and view model breaking changes

In Aurelia 2, passing a string to the view or view-model properties no longer means module name. In Aurelia 1, the module would be resolved to a file. In v2, the view property only understands string values and the view-model property only understands objects and classes.

For views, if you still want the ability for a view to support a dynamically loaded module, you can create a value converter that achieves this.

{% code title="my-component.html" %}
```markup
  <au-compose view="https://my-server.com/views/${componentName} | loadView">
```
{% endcode %}

{% code title="load-view.ts" %}
```javascript
  class LoadViewValueConverter {
    toView(v) { return fetch(v).then(r => r.text()) }
  }
```
{% endcode %}

The above value converter will load the URL and then return the text response. For view models, something similar can be achieved where an object or class can be returned.

### Scope breaking changes

By default, when composing the outer scope will not be inherited by default. The parent scope will only be inherited when it is not a custom element being composed. This means when composing using only a view or plain object as the view model, the outer scope will will be used.

You can disable this behavior using the `scope-behavior` attribute.

```markup
  <au-compose scope-behavior="scoped">
```

&#x20; **Possible values are:**

* auto: in view only composition: inherit the parent scope
* scoped: never inherit parent scope even in view only composition
