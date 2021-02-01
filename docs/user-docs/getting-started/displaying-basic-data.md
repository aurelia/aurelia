---
description: Leverage Aurelia's binding engine to connect views to your data.
---

# Displaying Data

One of Aurelia's strengths is its powerful, performant, and extensible templating engine. Let's dive into the basics and learn how to begin leveraging it for fun and profit!

{% hint style="success" %}
**Here's what you'll learn...**

* Binding any HTML or SVG attribute to data.
* Binding attributes and content with string interpolation.
* Passing function references to components.
* Obtaining a reference to a DOM element.
* Basic binding expression syntax.
{% endhint %}

## The Basics

As you learned in [Building Components](components/), a component typically involves two pieces: a _view-model_ and a _view_. The view-model is a vanilla JS class or object that provides basic state and actions through properties and methods. View-models don't require inheriting from a special base class, construction with a special factory function, or any other intrusive framework behavior. The view is a standards-based HTML template that renders the current state of the view-model. 

Aurelia joins these two pieces together through binding, allowing your view to efficiently update in response to view-model changes. Let's start by reviewing a class that's very similar to our `say-hello` view-model from earlier.

{% code title="say-hello.js" %}
```javascript
export class SayHello {
  constructor() {
    this.to = 'John Doe';
  }
}
```
{% endcode %}

Now, we'll create its view, binding the two together with our templating language:

{% code title="say-hello.html" %}
```markup
<p>
  Hello, ${to}!
</p>
```
{% endcode %}

One of the key features of Aurelia's templating system is its help to reduce context switching between your JavaScript code and your template markup. String interpolation using the `${}` operator is a feature of ES2015 that makes it simple to insert values into a string. Thus, Aurelia uses this standard syntax in templates as well.

When this template is run, Aurelia will insert the value of the `to` property into the template where `${to}` appears. Pretty simple, right? But what if we want logic in our string interpolation? Can we add our own expressions? Absolutely!

{% tabs %}
{% tab title="my-app.html" %}
```markup
<p>
  ${arriving ? 'Hello' : 'Goodbye'}, ${name}!
</p>
```
{% endtab %}

{% tab title="my-app.js" %}
```javascript
export class MyApp {
  constructor() {
    this.name = 'John Doe';
    this.arriving = true;
    setTimeout(() => this.arriving = false, 5000);
  }
}
```
{% endtab %}
{% endtabs %}

In our template, when `arriving` is true, the ternary operator makes our result `'Hello'`, but when it's false, it makes our result `'Goodbye'`. Our view-model code initializes `arriving` to `true` and changes it to `false` after 5 seconds \(5000 milliseconds\). So when we run the template, it will say "Hello, John Doe!" and after 5 seconds, it will say "Goodbye, John Doe!". Aurelia re-evaluates the string interpolation when the value of `arriving` changes!

But don't worry, there is no dirty-checking or VDOM diffing involved here. Aurelia uses an observable-based binding system that reacts to changes as they happen without having to resort to these costly alternatives. This means that Aurelia doesn't slow down as you add more complex functionality to your view-model or view.

### Syntax

Aurelia's expression parser implements a subset of [ECMAScript Expressions](https://tc39.github.io/ecma262/#sec-ecmascript-language-expressions). For the features that are supported, you can typically expect the JavaScript in your view to work the same way as it would in your view-model, or in the browser console. In addition there are two adjustments:

* The Ampersand `&` represents a `BindingBehavior` \(instead of Bitwise AND\)
* The Bar `|` represents a `ValueConverter` \(instead of a Bitwise OR\)

Non-expression syntax \(statements, declarations, function and class definitions\) is not supported. You can find more exhaustive examples of binding syntax in [the Expression Syntax Example](../examples/binding-and-templating/expression-syntax.md).

## Binding HTML and SVG Attributes

In addition to string interpolation, Aurelia supports binding HTML and SVG attributes to JavaScript expressions. Attribute binding declarations have three parts and take the following form:

`attribute.command="expression"`

Here's a brief explanation of each of these parts:

* `attribute`:  any HTML or SVG attribute name.
* `command`: one of Aurelia's attribute binding commands:
  * `one-time`: flows data one direction, from the view-model to the view, **once**.
  * `to-view` / `one-way`: continuously flows data one direction, from the view-model to the view.
  * `from-view`: continuously flows data one direction, from the view to the view-model.
  * `two-way`: continuously flows data both ways, from view-model to view and also from view to view-model.
  * `bind`: atomically chooses the binding mode. Uses `two-way` binding for form controls and `to-view` binding for almost everything else.
* `expression`: a JavaScript expression as described above, and detailed in the [Expression Syntax Example](../examples/binding-and-templating/expression-syntax.md).

Typically you'll use the `bind` command since it does what you intend most of the time. Consider using `one-time` in performance critical situations where the data never changes because it skips the overhead of observing the view-model for changes. Below are a few examples.

{% code title="HTML Attribute Binding Examples" %}
```markup
<input type="text" value.bind="firstName">
<input type="text" value.two-way="lastName">
<input type="text" value.from-view="middleName">

<a class="external-link" href.bind="profile.blogUrl">Blog</a>
<a class="external-link" href.to-view="profile.twitterUrl">Twitter</a>
<a class="external-link" href.one-time="profile.linkedInUrl">LinkedIn</a>
```
{% endcode %}

The first input uses the `bind` command which will automatically create `two-way` bindings for input value attribute bindings. The second and third inputs use the `two-way` / `from-view` commands which explicitly set the binding modes. For the first and second inputs, their value will be updated whenever the bound view-model `firstName` / `lastName` properties are updated, and then those properties will also be updated whenever the inputs change. For the third input, changes in the bound view-model `middleName` property will not update the input value, however, changes in the input will update the view-model. The first anchor element uses the `bind` command which will automatically create a `to-view` binding for anchor href attributes. The other two anchor elements use the `to-view` and `one-time` commands to explicitly set the binding's mode.

{% hint style="info" %}
**Info**

Because most apps do not leverage SVG binding, the standard configuration doesn't include all the necessary infrastructure needed to support binding SVG in a cross-browser way. This allows tree-shaking to make the runtime a little smaller for the most common scenarios. If you will be binding SVG elements, please register the `SVGAnalyzerRegistration` dependency from `@aurelia/runtime-html`, to ensure consistent cross-browser behavior.
{% endhint %}

## String Interpolation

String interpolation expressions enable interpolating \(surprise!\) the result of an expression with text. We showed this above in [The Basics](displaying-basic-data.md#the-basics), but let's take a closer look now.

The best way to understand how interpolation works is with an example. Below are two span elements with data-bound textcontent:

{% code title="String Interpolation Binding in Content" %}
```markup
<span textcontent.bind="'Hello' + firstName"></span>
<span>Hello ${firstName}</span>
```
{% endcode %}

The first span uses the `bind` command. The second uses string interpolation. The interpolated version is much easier to read and easy to remember because the syntax matches the [template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) syntax standardized in ES2015.

String interpolation can also be used within HTML attributes as an alternative to the `to-view` binding.

{% code title="String Interpolation Binding in Attributes" %}
```markup
<a class="external-link" href.to-view="profile.twitterUrl">Twitter</a>
<a class="external-link" href="${profile.twitterUrl}">Twitter</a>
```
{% endcode %}

By default, the mode of an interpolation binding is `to-view` and the result of the expression is always coerced to a string. Results that are `null` or `undefined` will result in an empty string.

## Special Attribute Binding

While Aurelia's attribute and string interpolation binding can work with any HTML or SVG attribute, a few scenarios are worth looking at specifically.

### Content Editable

The previous example compared string interpolation binding with `textcontent.bind`. Interpolation is easier to read but `textcontent.bind` can come in handy when you need to two-bind a `contenteditable` element:

{% code title="TwoWay textContent Binding" %}
```markup
<div contenteditable textcontent.bind="firstName"></div>
<div contenteditable textcontent.bind="lastName"></div>
```
{% endcode %}

You may also need to bind HTML text to an element's `innerHTML` property:

{% code title="HTML Binding innerHTML" %}
```markup
<div innerhtml.bind="htmlProperty | sanitizeHTML"></div>
<div innerhtml="${htmlProperty | sanitizeHTML}"></div>
```
{% endcode %}

{% hint style="danger" %}
**Warning**

Always use HTML sanitization! Aurelia provides a simple converter as a placeholder. However, it does NOT provide security against a wide variety of sophisticated XSS attacks, and should not be relied upon for sanitizing input from unknown sources. You can replace the built-in sanitizer by registering your own implementation of HTMLSanitizer with the app at startup. We recommend using a library such as [DOMPurify](https://github.com/cure53/DOMPurify) or [sanitize-html](https://github.com/apostrophecms/sanitize-html) for your implementation.
{% endhint %}

{% hint style="info" %}
**Important**

Binding using the `innerhtml` attribute simply sets the element's `innerHTML` property. The markup does not pass through Aurelia's templating system. Binding expressions and import elements will not be evaluated.
{% endhint %}

### Class

You can bind an element's `class` attribute using string interpolation or with `.bind`/`.to-view`.

{% code title="Class Bindings" %}
```markup
<div class="foo ${isActive ? 'active' : ''} bar"></div>
<div class.bind="isActive ? 'active' : ''"></div>
<div class.one-time="isActive ? 'active' : ''"></div>
```
{% endcode %}

This binding will accept not only a string, but also an array or a single object. It will coerce them into a class string that can be applied to the element.

* If a string is passed, it takes the literal value.
* If an object is passed, each property value is coerced to bool, and if true the property name is used.
* If an array is passed, it iterates each value applying the same behavior as string or object.

Here are a few examples of different values paired with final element results:

```markup
['class1', 'class2'];
<div class='class1 class2'></div>

['class1', { class2: true, 'class3 class4': true, class5: false }];
<div class='class1 class2 class3 class4'></div>

{ class1: true, 'class2 class4': true, class3 : false };
<div class='class1 class2 class4'></div>

{
  class1: true,
  ['innerArray', { innerArray1: true, innerArray2: false }],
  'class2 class4': true,
  class3 : false
};
<div class='class1 class2 class4 innerArray innerArray1'></div>
```

{% hint style="info" %}
**How Classes are Updated**

To ensure maximum interoperability with other JavaScript libraries, the binding system will only add or remove classes specified in the binding expression. This ensures classes added by other code \(eg via `classList.add(...)`\) are preserved. This "safe by default" behavior comes at a small cost but can be noticeable in benchmarks or other performance critical situations like repeats with lots of elements. You can opt out of the default behavior by binding directly to the element's [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) property using `class-name.bind="...."` or `class-name.one-time="..."`. This will be marginally faster but can add up over a lot of bindings.
{% endhint %}

### Style

You can bind a css string to an element's `style` attribute.

{% code title="Interpolation Binding with Styles" %}
```markup
<div style="width: ${width}px; height: ${height}px;"></div>
```
{% endcode %}

You can also bind an object:

{% tabs %}
{% tab title="my-app.html" %}
```markup
<div style.bind="styleString"></div>
<div style.bind="styleObject"></div>
```
{% endtab %}

{% tab title="my-app.js" %}
```javascript
export class MyApp {
  constructor() {
    this.styleString = 'color: red; background-color: blue';

    this.styleObject = {
      color: 'red',
      'background-color': 'blue'
    };
  }
}
```
{% endtab %}
{% endtabs %}

## Referencing DOM Elements

Use the `ref` binding command to create a reference to a DOM element. The `ref` command's most basic syntax is `ref="expression"`. When the view is data-bound the specified expression will be assigned the DOM element.

{% code title="Ref Bindings" %}
```markup
<input type="text" ref="nameInput"> ${nameInput.value}
```
{% endcode %}

The `ref` command has several qualifiers you can use in conjunction with custom elements and attributes:

* `element.ref="expression"`: create a reference to the DOM element
  * This is the same as `ref="expression"`
* `view-model.ref="expression"`: create a reference to a custom element's view-model
* `custom-attribute.ref="expression"`: create a reference to a custom attribute's view-model
* `controller.ref="expression"`: create a reference to a custom element's controller instance

## Passing Function References

While developing custom elements or custom attributes you may encounter a situation where you have a property that expects a reference to a function. Use the `call` binding command to declare and pass a function to the property. The `call` command is superior to the `bind` command for this use-case because it will execute the function in the correct context, ensuring `this` is what you expect it to be.

{% code title="Call Bindings" %}
```markup
<my-element go.call="doSomething()"></my-element>

<input type="text" value.bind="taskName">
<my-element go.call="doSomething(taskName)"></my-element>
```
{% endcode %}

Your custom element or attribute can invoke the function that was passed to the property using standard call syntax: `this.go();`. If you need to invoke the function with arguments, create an object whose keys are the argument names and whose values are the argument values, then invoke the function with this "arguments object". The object's properties will be available for data-binding in the `call` binding expression. For example, invoking the function with `this.go({ x: 5, y: -22, z: 11})`\) will make `x`, `y` and `z` available for binding:

{% code title="Call Bindings with Contextual Properties" %}
```markup
<my-element go.call="doSomething(x, y)"></my-element>
```
{% endcode %}

## Contextual Properties

Aurelia's binding engine makes several special properties available to you in your binding expressions. Some properties are available everywhere, while others are only available in a particular context, such as within a repeat block or an event handler. Below is a brief summary of all the available contextual properties that you have access to. We'll call out several of these again later in [Rendering Collections](rendering-collections.md#contextual-properties) and [Handling Events](handling-events.md#contextual-properties).

### General

* `$this` - The the view-model that your binding expressions are being evaluated against.

### Event

* `$event` - The DOM Event in `delegate`, `trigger`, and `capture` bindings.

### Repeater

* `$index` - In a repeat template, the index of the item in the collection.
* `$first` - In a repeat template, is `true` if the item is the first item in the array.
* `$last` - In a repeat template, is `true` if the item is the last item in the array.
* `$even` - In a repeat template, is `true` if the item has an even numbered index.
* `$odd` - In a repeat template, is `true` if the item has an odd numbered index.
* `$length` - In a repeat template, this indicates the length of the collection.
* `$parent` - Explicitly accesses the outer scope from within a `repeat` template. You may need this when a property on the current scope masks a property on the outer scope. Note that this property is chainable, e.g. `$parent.$parent.foo` is supported.

