---
description: >-
  Learn all there is to know about Aurelia's HTML templating syntax and
  features.
---

# Template syntax & features

Aurelia uses an HTML-based syntax for templating, allowing you to build applications in an intuitive way. All Aurelia templates are valid spec-compliant HTML that works in all browsers and HTML parsers.

## Text Interpolation

String interpolation allows you to display values within your template views. By leveraging `${}` which is a dollar sign followed by opening and closing curly braces, you can display values inside of your views. The syntax will be familiar to you if you are familiar with [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template\_literals).

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

In Aurelia, you can bind attributes in more than one way, and it is important to understand the difference in syntax. To illustrate our point, we are going to be using the native `id` attribute for our example.

#### Binding with interpolation

You can bind values with interpolation. The following example illustrates how this looks.

```html
<div>
    <h1 id="${headingId}">My Heading</h1>
</div>
```

We specify the `id` attribute and then use string interpolation to get the `headingId` value. This will populate the `id` attribute with our value (if one exists).

#### Binding with keywords

For a full list of binding keywords, please see below. However, we are now going to bind the `id` attribute using the `.bind` keyword.  If the value being bound is `null` or `undefined` the attribute will not be displayed.

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

The first input uses the `bind` command to create `two-way` bindings for input value attribute bindings automatically. The second and third input uses the `two-way` / `from-view` commands which explicitly set the binding modes. For the first and second inputs, their value will be updated whenever the bound view-model `firstName` / `lastName` properties are updated, and those properties will also be updated whenever the inputs change.&#x20;

For the third input, changes in the bound view-model `middleName` property will not update the input value. However, changes in the input will update the view model. The first anchor element uses the `bind` command that automatically creates a `to-view` binding for anchor HREF attributes. The other two anchor elements use the `to-view` and `one-time` commands to explicitly set the binding's mode.

### Binding to images

You can bind to numerous image properties, but the most common is the `src` attribute that allows you to bind the image source. The value in the below example is `imageSrc` which is a property inside of the view model.

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

When working with custom elements in Aurelia, if you leverage bindables to have custom bindable properties allowing values to be bound, you will use `.bind` extensively.&#x20;

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

You can listen to events using two different types of event bindings; `trigger` and `capture`. The syntax for event binding is the event name you want to target, followed by one of the above event bindings.

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

The `capture` event binding command should only be used as a last resort. Primarily in situations where an event is fired too early before Aurelia can capture it (third-party plugins, for example) or an event is being stopped using `event.preventDefault` capture can guarantee the event is captured (hence the name).

In most situations, `trigger` will be more than sufficient.

## Template References

Template references and variables allow you to identify and specify parts of your templates that are accessible both inside of the view itself as well as the view model.

Using the `ref` attribute, you can denote elements as variables.

```markup
<input type="text" ref="myInput" placeholder="First name">
```

We can then reference our input by the identifying value we provided to the `ref` attribute. For inputs, this is convenient because we can access the value property of the input itself.

```markup
<p>${myInput.value}</p>
```

You can also access this referenced element inside of your view model as well. Just make sure if you're using TypeScript to specify this property before attempting to reference it inside of your code.

```typescript
export class MyApp {
  private myInput: HTMLInputElement;
}
```

The `ref` attribute has several qualifiers you can use in conjunction with custom elements and attributes:

* `view-model.ref="expression"`: create a reference to a custom element's view-model
* `custom-attribute.ref="expression"`: create a reference to a custom attribute's view-model
* `controller.ref="expression"`: create a reference to a custom element's controller instance

{% hint style="info" %}
Template references are a great way to reference elements inside view models for use with third-party libraries. They negate the need to query for elements using Javascript APIs.
{% endhint %}

## Template Variables

In your view templates, you can specify inline variables using the `<let>` custom element.

The `<let>` element supports working with interpolation strings, plain strings, referencing view model variables and other let bindings within your templates.

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

When working with promises in Aurelia, previously in version 1, you had to resolve them in your view model and then pass the values to your view templates. It worked, but you had to write code to handle those promise requests. In Aurelia 2, we can work with promises directly inside of our templates.

The `promise.bind` template controller allows you to use `then`, `pending` and `catch` in your view removing unnecessary boilerplate.

### A basic example

The promise binding is intuitive, allowing you to use attributes to bind to steps of the promise resolution process from initialization (pending to resolution and errors).

```html
<div promise.bind="promise1">
 <template pending>The promise is not yet settled.</template>
 <template then.from-view="data">The promise is resolved with ${data}.</template>         <!-- grab the resolved value -->
 <template catch.from-view="err">This promise is rejected with ${err.message}.</template> <!-- grab the rejection reason -->
</div>

<div promise.bind="promise2">
 <template pending>The promise is not yet settled.</template>
 <template then>The promise is resolved.</template>
 <template catch>This promise is rejected.</template>
</div
```

### Promise binding using functions

In the following example, notice how we have a parent `div` with the `promise.bind` binding and then a method called `fetchAdvice`? Followed by other attributes inside `then.from-view` and `catch.from-view` which handles both the resolved value as well as any errors.

Ignore the `i` variable being incremented, this is only there to make Aurelia fire off a call to our `fetchAdvice` method as it sees the parameter value has changed.

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
    Cannot get an advice, error: ${err}
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
The parameter `i` passed to the method `fetchAdvice()` call in the template is for refreshing binding purposes. It is not used in the method itself. This is because method calls in Aurelia are considered pure, and will only be called again if any of its parameters have changed.
{% endhint %}

This example can also be seen in action below.

{% embed url="https://stackblitz.com/edit/au2-promise-binding-using-functions?ctl=1&embed=1&file=src/my-app.ts" %}

### Promise bind scope

The `promise` template controller creates its own scope. This prevents accidentally polluting the parent scope or the view model where this template controller is used. Let's see an example to understand what it means.

```html
<div promise.bind="promise">
 <foo-bar then.from-view="data" foo-data.bind="data"></foo-bar>
 <fizz-buzz catch.from-view="err" fizz-err.bind="err"></fizz-buzz>
</div>
```

In the example above, we are storing the resolved value from the promise in the `data` property, and then passing the value to the `foo-bar` custom element by binding the `foo-data` property.

This is useful when we need the data only in view for passing from one component to another custom element, as it does not pollute the underlying view model. Note that this does not make any difference regarding data binding or change observation. However, when we do need to access the settled data inside the view model, we can use the `$parent.data` or `$parent.err` as shown in the example below.

### Nested promise bindings

If you have a promise inside of a promise (promise-ception), you can nest promise controllers in your markup.

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

### Using promise bindings inside of a [repeat.for](repeats-and-list-rendering.md)

Due to the way the scoping and binding context resolution works, you might want to use a `let` binding when using the `promise` inside `repeat.for`.

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
    return resolve
      ? Promise.resolve(value)
      : Promise.reject(new Error(String(value)));
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
