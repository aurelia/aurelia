---
description: >-
  Learn all there is to know about Aurelia's HTML templating syntax and
  features.
---

# Template syntax & features

Aurelia's HTML-based templating syntax offers an intuitive way to build applications. All templates are valid, spec-compliant HTML, ensuring compatibility across browsers and HTML parsers.

## Events

Using Aurelia's intuitive event binding syntax, you can listen to mouse clicks, keyboard events, mouse movements, touches and other native browser events that are accessible via Javascript.

If you have familiarized yourself with other aspects of Aurelia's template binding, a lot of this will look similar to you. Due to differences in how certain events function (bubbling vs non-bubbling), there are some nuances to be aware of when working with them.

You can listen to events using two types of event bindings; `trigger` and `capture`. The syntax for event binding is the event name you want to target, followed by one of the above event bindings.

To listen to an `click` event on a button, for example, you would do something like this:

```html
<button click.trigger="myClickFunction()">Click me!</button>
```

Inside the quotation marks, you specify the function's name to be called inside your view model.

### Common events

There are several events that you will bind onto in your Aurelia applications. These events are native events that Aurelia can bind to.

#### click

You will listen to the `click` event on buttons and links using `click.trigger`

#### keypress

The native `keypress` event using `keypress.trigger` will allow you to listen to keypress events on inputs and other elements.

### **Capturing event binding**

The `capture` event binding command should only be used as a last resort. Primarily, when an event is fired too early before Aurelia can capture it (third-party plugins, for example) or an event is being stopped using `event.preventDefault`, capture can guarantee the event is captured (hence the name).

In most situations, `trigger` will be more than sufficient.

## Template References

Template references in Aurelia 2 provide a powerful and flexible way to connect your HTML templates with your JavaScript or TypeScript view models. Using the ref attribute, you can easily identify and interact with specific parts of your template, making it more efficient to manipulate the DOM or access template data.

### Declaring Template References

#### Basic Usage
Add the ref attribute to an HTML element within your template to create a template reference. This marks the element as a reference, allowing you to access it directly in your view model.

```HTML
<input type="text" ref="myInput" placeholder="First name">
```

In this example, `myInput` references the input element, which can be used both in the template and the corresponding view model.

#### Accessing Reference in Template

Template references are immediately available within the template. For instance, you can display the value of the input field as follows:

```html
<p>${myInput.value}</p>
```

This binding displays the current value of the input field dynamically.

#### Accessing Reference in View Model

To access the referenced element in the view model, declare a property with the same name as the reference. For TypeScript users, it's important to define the type of this property for type safety.

```typescript
export class MyApp {
  private myInput: HTMLInputElement;

  // Additional view model logic here
}
```

### Advanced Usage

#### Working with Custom Elements and Attributes

Aurelia's `ref` attribute is not limited to standard HTML elements. It can also be used with custom elements and attributes to reference their component instances (view-models) or controllers.

**Custom Element Instance** 
Use `component.ref="expression"` to create a reference to a custom element's component instance (view-model). This was known as `view-model.ref` in Aurelia v1.

```html
<my-custom-element component.ref="customElementVm"></my-custom-element>
```

**Custom Attribute Instance**
Similarly, `custom-attribute.ref="expression"` can reference a custom attribute's component instance (view-model).

```html
<div my-custom-attribute custom-attribute.ref="customAttrVm"></div>
```

**Controller Instance**
For more advanced scenarios, `controller.ref="expression"` creates a reference to a custom element's controller instance.

```html
<my-custom-element controller.ref="customElementController"></my-custom-element>
```

### Practical Applications
Template references are incredibly useful for integrating with third-party libraries or when direct DOM manipulation is necessary. Instead of using traditional JavaScript queries to find elements, template references provide a more straightforward, framework-integrated approach.

{% hint style="info" %}
Leveraging template references can greatly simplify interactions with elements, particularly when integrating with libraries that require direct DOM element references. This approach promotes cleaner and more maintainable code by reducing reliance on direct DOM queries.
{% endhint %}

## Template Variables

In your view templates, you can specify inline variables using the `<let>` custom element.

The `<let>` element supports working with interpolation strings, plain strings, referencing view model variables, and other let bindings within your templates.

```markup
<let some-var="This is a string value"></let>
```

You could then display this value using its camelCase variant:

```markup
<p>${someVar}</p>
```

You can bind to variable values in a `<let>` too:

```markup
<let math-equation.bind="1 + 2 + 5"></let>

<!-- This will display 8 -->
<p>${mathEquation}</p>
```

## Template Promises

Aurelia 2 enhances the handling of promises within templates. Unlike Aurelia 1, where promises had to be resolved in the view model before passing their values to templates, Aurelia 2 allows direct interaction with promises in templates. This is achieved through the `promise.bind` template controller, which supports `then`, `pending`, and `catch` states, reducing the need for boilerplate code.

The `promise.bind` template controller allows you to use `then`, `pending` and `catch` in your view, removing unnecessary boilerplate.

### Basic Example

The promise binding simplifies working with asynchronous data. It allows attributes to bind to various states of a promise: pending, resolved, and rejected.

```html
<div promise.bind="promise1">
 <template pending>The promise is not yet settled.</template>
 <template then.from-view="data">The promise is resolved with ${data}.</template>
 <template catch.from-view="err">This promise is rejected with ${err.message}.</template>
</div>

<div promise.bind="promise2">
 <template pending>The promise is not yet settled.</template>
 <template then>The promise is resolved.</template>
 <template catch>This promise is rejected.</template>
</div>
```

### Promise Binding Using Functions

The following example demonstrates a method fetchAdvice bound to the `promise.bind` attribute. It uses `then.from-view` and `catch.from-view` to handle resolved data and errors.

{% tabs %}
{% tab title="my-app.html" %}
```markup
<let i.bind="0"></let>

<div promise.bind="fetchAdvice(i)">
  <span pending>Fetching advice...</span>
  <span then.from-view="data">
    Advice id: ${data.slip.id}<br>
    ${data.slip.advice}
    <button click.trigger="i = i+1">try again</button>
  </span>
  <span catch.from-view="err">
    Cannot get advice, error: ${err}
    <button click.trigger="i = i+1">try again</button>
  </span>
</div>
```
{% endtab %}

{% tab title="my-app.ts" %}
```typescript
export class MyApp {
  fetchAdvice() {
    return fetch(
        "https://api.adviceslip.com/advice",
        {
          // This is not directly related to promise template controller.
          // This is simply to ensure that the example demonstrates the
          // change in data in every browser, without any confusion.
          cache: 'no-store'
        }
      )
      .then(r => r.ok
        ? r.json()
        : (() => { throw new Error('Unable to fetch NASA APOD data') })
      )
  }
}
```
{% endtab %}
{% endtabs %}

{% hint style="info" %}
The `i` variable triggers a method call in the template, as Aurelia considers method calls pure and re-invokes them only if their parameters change.
{% endhint %}

This example can also be seen in action below.

{% embed url="https://stackblitz.com/edit/au2-promise-binding-using-functions?ctl=1&embed=1&file=src/my-app.ts" %}

### Promise Bind Scope

The `promise` template controller operates within its own scope, preventing accidental pollution of the parent scope or view model.

```html
<div promise.bind="promise">
 <foo-bar then.from-view="data" foo-data.bind="data"></foo-bar>
 <fizz-buzz catch.from-view="err" fizz-err.bind="err"></fizz-buzz>
</div>
```

In this example, `data` and `err` are scoped within the promise controller. To access these values in the view model, use `$parent.data` or `$parent.err`.

### Nested Promise Bindings

Aurelia 2 supports nested promise bindings, allowing you to handle promises returned by other promises.

```html
<template promise.bind="fetchPromise">
 <template pending>Fetching...</template>
 <template then.from-view="response" promise.bind="response.json()">
   <template then.from-view="data">${data}</template>
   <template catch>Deserialization error</template>
 </template>
 <template catch.from-view="err2">Cannot fetch</template>
</template>
```

### Promise Bindings with [repeat.for](repeats-and-list-rendering.md)

When using `promise.bind` within a `repeat.for`, it's recommended to use a `let` binding to create a scoped context.

```html
<let items.bind="[[42, true], ['foo-bar', false], ['forty-two', true], ['fizz-bazz', false]]"></let>
<template repeat.for="item of items">
  <template promise.bind="item[0] | promisify:item[1]">
    <let data.bind="null" err.bind="null"></let>
    <span then.from-view="data">${data}</span>
    <span catch.from-view="err">${err.message}</span>
  </template>
</template>
```

```typescript
import { valueConverter } from '@aurelia/runtime-html';

@valueConverter('promisify')
class Promisify {
  public toView(value: unknown, resolve: boolean = true): Promise<unknown> {
    return resolve ? Promise.resolve(value) : Promise.reject(new Error(String(value)));
  }
}
```

The above example shows usage involving `repeat.for` chained with a `promisify` value converter. The value converter converts a simple value to a resolving or rejecting promise depending on the second boolean value. The value converter in itself is not that important for this discussion. It is used to construct a `repeat.for`, `promise` combination easily.

The important thing to note here is the usage of `let` binding that forces the creation of two properties, namely `data` and `err`, in the overriding context, which gets higher precedence while binding.

Without these properties in the overriding context, the properties get created in the binding context, which eventually gets overwritten with the second iteration of the repeat. In short, with `let` binding in place, the output looks as follows.

```html
<span>42</span>
<span>foo-bar</span>
<span>forty-two</span>
<span>fizz-bazz</span>
```
