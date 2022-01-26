# Dynamic composition

In this section, we are going to be learning how you can dynamically render components in your applications by utilizing Aurelia's dynamic composition functionality. When using Aurelia's `<au-compose>` element, inside of the view-model being used, you have access to all of Aurelia's standard view lifecycle events, as well as an extra `activate`.

The `<au-compose>` element allows us to compose view/view model pairs as well as just views, kind of like a custom element without having to specify a tag name.

Here is a simple example showcasing how to dynamically compose a view/view model pair:

```markup
<au-compose view-model=""></au-compose>
```

## Basic Composition

The `au-compose` element can be used to render any custom element given to its `view-model` property. A basic example is:

```markup
<au-compose view-model.bind="MyField"></au-compose>
```

```javascript
import { CustomElement } from '@aurelia/runtime-html';

export class App {
  MyField = CustomElement.define({
    name: 'my-input',
    template: '<input value.bind="value">'
  })
}
```

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

## Migrating from v1 \<compose>

*   `view`/`view-model` (BREAKING CHANGE): passing a string to either view/ view model no longer means module name. The composer only understands string as a template for view and objects and classes for view-model now. Though if it's still possible to treat a string as a module name, with the help of a value converter:

    ```markup
      <au-compose view="https://my-server.com/views/${componentName} | loadView">
    ```

    ```javascript
      class LoadViewValueConverter {
        toView(v) { return fetch(v).then(r => r.text()) }
      }
    ```
*   `scope` (BREAKING CHANGE): context is no longer inherited by default. It will only inherit parent scope when it's not a custom element composition (can be view only, or with a plain object as view model). Users can also disable this using the `scope-behavior` bindable:

    ```markup
      <au-compose scope-behavior="scoped">
    ```

    &#x20; **Possible values are:**

    * auto: in view only composition: inherit the parent scope
    * scoped: never inherit parent scope even in view only composition
