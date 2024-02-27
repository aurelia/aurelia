---
name: "Templating: Dynamic UI Composition"
description: An overview of Aurelia's dynamic template composition functionality.
---

## Introduction

In this section, we are going to be learning how you can dynamically render components in your applications by utilizing Aurelia's dynamic composition functionality.

When using Aurelia's `<au-compose>` element, inside of the component being used, you have access to all of Aurelia's standard view lifecycle events, as well as an extra `activate`.

## Basic Composition

The `au-compose` element can be used to render any custom element given to its `component` property. A basic example is:

```html
<au-compose component.bind="MyField"></au-compose>
```

```javascript
import { CustomElement } from 'aurelia';

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

```html
<au-compose template="<p>Hello world</p>"></au-compose>
```

Inside of our template, we are using the `<au-compose>` element and passing through a view to be rendered. The view is just a plain html string.

During a composition, this html string is processed by Aurelia template compiler to produce necessary parts for UI composition and renders it inside the `<au-compose>` element.

Combining simple template and literal object as view model, we can also have powerful rendering without boilerplate:

```html
<au-compose repeat.for="i of 5" component.bind="{ value: i }" template="<div>\\${value}</div>"></au-compose>
```

{% hint style="info" %}
When composing without a custom element as component, the result component will use parent scope as its scope, unless `scope-behavior` is set to `scoped`
{% endhint %}

## Passing Through Data

`activate` method on the view model, regardless a custom element or a plain object will be called during the first composition, and subsequent changes of the `model` property on the `<au-compose>` element.

## Migration from v1:

- `<compose>` is renamed to `<au-compose>`
- `view`/`view-model` have been renamed to `template`/`component`.
- `template`/`component` (BREAKING CHANGE): passing a string to either template/component no longer means module name. The composer only understands string as template for view and objects and classes for component now. Though if it's still possible to turn treat string as module name, with the help of value converter:
    ```html
    <au-compose template="https://my-server.com/template/${componentName} | loadTemplate">
    ```
    ```js
    class LoadTemplateValueConverter {
      toView(v) { return fetch(v).then(r => r.text()) }
    }
    ```
- `scope` (BREAKING CHANGE): context is no longer inherited by default. It will only inherit parent scope when it's not a custom element composition (can be view only, or with plain object as view model). User can also disable this via scope-behavior bindable:
    ```html
    <au-compose scope-behavior="scoped">
    ```
    Possible values are:
    - auto: in view only composition: inherit the parent scope
    - scoped: never inherit parent scope even in view only composition
- **naming** (BREAKING CHANGE): `compose` (v1) is changed to `au-compose` (v2)
    - (v2 only): the existing `au-compose` is renamed to `au-render`.