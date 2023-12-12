---
description: >-
  Learn all there is to know about Aurelia's HTML templating syntax and
  features.
---

# Template syntax & features

Aurelia's HTML-based templating syntax offers an intuitive way to build applications. All templates are valid, spec-compliant HTML, ensuring compatibility across browsers and HTML parsers.

## Text Interpolation

String interpolation allows you to display values within your template views. By leveraging `${}`, a dollar sign followed by opening and closing curly braces, you can display values inside your views. The syntax will be familiar to you if you are familiar with [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template\_literals).

### Displaying values with interpolation

Interpolation can be used to display the value of variables within your HTML templates, object properties and other forms of valid data.

To show how interpolation works, here is an example.

{% code title="my-app.ts" %}
```typescript
export class MyApp {
  myName = 'Aurelia';
}
```
{% endcode %}

{% code title="my-app.html" %}
```markup
<p>Hello, my name is ${myName}</p>
```
{% endcode %}

Notice how the variable we reference in our HTML template is the same as it is defined inside of our view model? Anything specified on our view model class is accessible in the view. Aurelia will replace `${myName}` with `Aurelia` think of it as a fancy string replacement. All properties defined in your view model will be accessible inside your templates.

### Template expressions

A template expression allows you to perform code operations inside of `${}` we learned about earlier. You can perform addition, subtraction and even call functions inside of interpolation.

In the following simple example, we are adding two and two together. The value that will be displayed will be `4`.

```html
<p>Quick maths: ${2 + 2}</p>
```

You can call functions with parameters if you have a function inside your view model.

{% code title="my-app.ts" %}
```typescript
export class MyApp {
  adder(val1, val2) {
    return parseInt(val1) + parseInt(val2);
  }
}
```
{% endcode %}

{% code title="my-app.html" %}
```markup
<p>Behold mathematics, 6 + 1 = ${adder(6, 1)}</p>
```
{% endcode %}

You can also use ternaries inside of your interpolation expressions:

```html
<p>${isTrue ? 'True' : 'False'}</p>
```

### Optional Syntax

Also supported in template expressions is optional syntax. Aurelia supports the following optional syntax in templates.

* `??`
* `?.`
* `?.()`
* `?.[]`

{% hint style="warning" %}
While Aurelia supports a few optional syntaxes, `??=` is not supported.
{% endhint %}

Using optional syntax and nullish coalescing allows us to create safer expressions without the need for `if.bind` or boilerplate code in view models.

```html
${myValue ?? 'Some default'}
```

This can help clean up what otherwise might have been long and complex ternary expressions to achieve the above result.

### Notes on syntax

You would be forgiven for thinking that you can do pretty much anything that Javascript allows you to do, but there are limitations in what you can do inside of interpolation you need to be aware of.

1. Expressions cannot be chained using `;` or `,`
2. You cannot use primitives such as `Boolean`, `String`, `instanceOf`, `typeof` and so on
3. You can only use the pipe separator `|` when using value converters but not as a bitwise operator

## Attribute Bindings

Attribute binding in Aurelia allows you to bind to any native HTML attribute in your templates. Binding to HTML attributes in Aurelia allows you to modify classes, style properties, attribute states and more.

The basic syntax for most attributes being bound is:

```html
<div attribute-name.bind="value"></div>
```

You can bind almost every attribute from this list [here](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes). Some examples of what you can bind to can be found below with code examples.

### Binding syntax

In Aurelia, you can bind attributes in multiple ways, and it is important to understand the difference in syntax. To illustrate our point, we will use the native `id` attribute for our example.

#### Binding with interpolation

You can bind values with interpolation. The following example illustrates how this looks.

```html
<div>
    <h1 id="${headingId}">My Heading</h1>
</div>
```

We specify the `id` attribute and then use string interpolation to get the `headingId` value. This will populate the `id` attribute with our value (if one exists).

#### Binding with keywords

For a full list of binding keywords, please take a look below. However, we will now bind the `id` attribute using the `.bind` keyword.  If the bound value is `null` or `undefined`, the attribute will not be displayed.

```html
<div>
    <h1 id.bind="headingId">My Heading</h1>
</div>
```

This achieves the same result. The value `headingId` will populate the `id` attribute and add the value.

{% hint style="info" %}
A note on binding. Both approaches detailed above from an implementation perspective are the same. You can use either of the above approaches, and there would be no noticeable difference in performance or features.
{% endhint %}

### Binding Keywords:

* `one-time`: flows data in one direction, from the view model to the view, once.
* `to-view` / `one-way`: flows data in one direction, from the view model to the view.
* `from-view`: flows data in one direction, from the view to the view model.
* `two-way`: flows data both ways, from view-model to view and from view to view-model.
* `bind`: automatically chooses the binding mode. Uses `two-way` binding for form controls and `to-view` binding for almost everything else.

```html
  <input type="text" value.bind="firstName">
  <input type="text" value.two-way="lastName">
  <input type="text" value.from-view="middleName">

  <a class="external-link" href.bind="profile.blogUrl">Blog</a>
  <a class="external-link" href.to-view="profile.twitterUrl">Twitter</a>
  <a class="external-link" href.one-time="profile.linkedInUrl">LinkedIn</a>
```

The first input uses the `bind` command to create `two-way` bindings for input value attribute bindings automatically. The second and third inputs use the `two-way` / `from-view` commands, which explicitly set the binding modes. For the first and second inputs, their value will be updated whenever the bound view-model `firstName` / `lastName` properties are updated, and those properties will also be updated whenever the inputs change.&#x20;

For the third input, changes in the bound view-model `middleName` property will not update the input value. However, changes in the input will update the view model. The first anchor element uses the `bind` command that automatically creates a `to-view` binding for anchor HREF attributes. The other two anchor elements use the `to-view` and `one-time` commands to explicitly set the binding's mode.

### Binding to images

You can bind to numerous image properties, but the most common is the `src` attribute, which allows you to bind the image source. The value in the example below is `image`, a property inside the view model.

```html
<img src.bind="imageSrc">
```

Want to bind to the alt text attribute?

```html
<img src.bind="imageSrc" alt.bind="altValue">
```

### Disabling buttons and inputs

You can easily disable a button by binding to the native `disabled` attribute of buttons and inputs.

{% code title="my-component.html" %}
```html
<button disabled.bind="disableButton">Disabled Button</button>
```
{% endcode %}

The `disableButton` value is a class property boolean. When `disableButton` is `true`, the button is disabled.

{% code title="my-component.ts" %}
```typescript
export class MyComponent {
    disableButton = true;
}
```
{% endcode %}

### Binding to innerHtml and textContent

The native `innerhtml` and `textcontent` properties allow you to set the values of HTML elements. When binding to these properties, the difference between what to choose is `textcontent` will not display HTML tags and `innerhtml` will.

{% code title="my-component.html" %}
```html
<div textcontent.bind="myContent"></div>
```
{% endcode %}

{% code title="my-component.html" %}
```html
<div innerhtml.bind="myContent"></div>
```
{% endcode %}

## Binding values to custom elements

When working with custom elements in Aurelia, if you leverage bindables to have custom bindable properties allowing values to be bound, you will use `.bind` extensively.

Say you had a custom element that accepted an email value. You might call it `email` inside your component definition.

{% code title="my-custom-element.ts" %}
```typescript
import { bindable, customElement } from 'aurelia';

@customElement('my-custom-element')
export class MyCustomElement {
  @bindable email = '';
}
```
{% endcode %}

Referencing our custom element, if we wanted to bind a value to our `email` property, we would do this:

```markup
<my-custom-element email.bind="myEmail"></my-custom-element>
```

This allows us to pass in data to custom elements cleanly and familiarly.

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
