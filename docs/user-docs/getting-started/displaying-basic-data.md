---
description: Leverage Aurelia's binding engine to connect views to your data.
---

# Displaying Basic Data

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

In Aurelia, building a component typically involves two pieces: a view-model and a view. The view-model is a vanilla JS class or object that provides basic state and actions through properties and methods. View-models don't require inheriting from a special base class, construction with a special factory function, or any other intrusive framework behavior. The view is a standards-based HTML template that renders the current state of the view-model. Aurelia joins these two pieces together through binding, allowing your view to efficiently update in response to view-model changes. Let's start with a simple `hello` view-model as an example.

{% code-tabs %}
{% code-tabs-item title="hello.js" %}
```javascript
export class Hello {
  constructor() { 
    this.name = 'John Doe';
  } 
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

Now, we'll create its view, binding the two together with our templating language:

{% code-tabs %}
{% code-tabs-item title="hello.html" %}
```markup
<p>
  Hello, ${name}!
</p>
```
{% endcode-tabs-item %}
{% endcode-tabs %}

One of the key features of Aurelia's templating system is helping to reduce context switching between your JavaScript code and your template markup. String interpolation using the `${}` operator is a feature of ES2015 that makes it simple to insert values into a string. Thus, Aurelia uses this standard syntax in templates as well.

When this template is run, Aurelia will insert the value of the `name` property into the template where `${name}` appears. Pretty simple, right? But what if we want logic in our string interpolation. Can we add our own expressions? Absolutely!

{% code-tabs %}
{% code-tabs-item title="greeter.html" %}
```markup
<p>
  ${arriving ? 'Hello' : 'Goodbye'}, ${name}!
</p>
```
{% endcode-tabs-item %}

{% code-tabs-item title="greeter.js" %}
```javascript
export class Greeter { 
  constructor() { 
    this.name = 'John Doe';
    this.arriving = true; 
    setTimeout(() => this.arriving = false, 5000); 
  }
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

In our template, when `arriving` is true, the ternary operator makes our result `'Hello'`, but when it's false, it makes our result `'Goodbye'`. Our view-model code initializes `arriving` to `true` and changes it to `false` after 5 seconds \(5000 milliseconds\). So when we run the template, it will say "Hello, John Doe!" and after 5 seconds, it will say "Goodbye, John Doe!". Aurelia re-evaluates the string interpolation when the value of `arriving` changes!

But don't worry, there is no dirty-checking or VDOM diffing involved here. Aurelia uses an observable-based binding system that reacts to changes as they happen without having to resort to these costly alternatives. This means that Aurelia doesn't slow down as you add more complex functionality to your view-model or view.

## Binding HTML and SVG Attributes

Aurelia supports binding HTML and SVG attributes to JavaScript expressions. Attribute binding declarations have three parts and take the form `attribute.command="expression"`.

* `attribute`:  an HTML or SVG attribute name.
* `command`: one of Aurelia's attribute binding commands:
  * `one-time`: flows data one direction, from the view-model to the view, **once**.
  * `to-view` / `one-way`: flows data one direction, from the view-model to the view.
  * `from-view`: flows data one direction, from the view to the view-model.
  * `two-way`: flows data both ways, from view-model to view and from view to view-model.
  * `bind`: automically chooses the binding mode. Uses two-way binding for form controls and to-view binding for almost everything else.
* `expression`: a JavaScript expression.

Typically you'll use the `bind` command since it does what you intend most of the time. Consider using `one-time` in performance critical situations where the data never changes because it skips the overhead of observing the view-model for changes. Below are a few examples.

\`\`\`HTML HTML Attribute Binding Examples

[Blog](displaying-basic-data.md) [Twitter](displaying-basic-data.md) [LinkedIn](displaying-basic-data.md)

```text
The first input uses the `bind` command which will automatically create `two-way` bindings for input value attribute bindings. The second and third input uses the `two-way` / `from-view` commands which explicitly set the binding modes. For the first and second inputs, their value will be updated whenever the bound view-model `firstName` / `lastName` properties are updated, and the those properties will also be updated whenever the inputs change. For the third input, changes in the bound view-model `middleName` property will not update the input value, however, changes in the input will update the view-model. The first anchor element uses the `bind` command which will automatically create a `to-view` binding for anchor href attributes. The other two anchor elements use the `to-view` and `one-time` commands to explicitly set the binding's mode.

> Info
> Because most apps do not leverage SVG binding, the core runtime doesn't include all the necessary infrastructure needed to support binding SVG in a cross-browser way. This allows us to make the runtime a little smaller for the most common scenarios. If you will be binding SVG elements, please install `plugin-svg`, to ensure consistent cross-browser behavior.

## String Interpolation

String interpolation expressions enable interpolating (surprise!) the result of an expression with text. The best way to demonstrate this capability is with an example. Below are two span elements with data-bound textcontent:

```HTML String interpolation example
<span textcontent.bind="'Hello' + firstName"></span>

<span>Hello ${firstName}</span>
```

The first span uses the `bind` command. The second uses string interpolation. The interpolated version is much easier to read and easy to remember because the syntax matches the [template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) syntax standardized in ES2015.

String interpolation can be used within HTML attributes as an alternative to `to-view` binding. By default, the mode of an interpolation binding is `to-view` and the result of the expression is always coerced to a string. Results that are `null` or `undefined` will result in an empty string.

## Special Attribute Binding

### Class

You can bind an element's `class` attribute using string interpolation or with `.bind`/`.to-view`.

This binding will accept a string, an array, or a single object and coerce them into a class string. If a string is passed it takes the literal value, when an object is passed each property value is coerced to bool and if true the property name is used, and when an array is passed it iterates each value in the same behavior as string or object.

```typescript
['class1', 'class2']; // <div class='class1 class2'></div>
['class1', { class2: true, 'class3 class4':true, class5: false}]; // <div class='class1 class2 class3 class4'></div>
{ class1: true, 'class2 class4': true, class3 : false}; // <div class='class1 class2 class4'></div>
{ class1: true,
['innerArray', {innerArray1:true, innerArray2: false}],
'class2 class4': true,
class3 : false}; // <div class='class1 class2 class4 innerArray innerArray1'></div>
```

\`\`\`HTML Class Binding

```text
To ensure maximum interoperability with other JavaScript libraries, the binding system will only add or remove classes specified in the binding expression. This ensures classes added by other code (eg via `classList.add(...)`) are preserved. This "safe by default" behavior comes at a small cost but can be noticeable in benchmarks or other performance critical situations like repeats with lots of elements. You can opt out of the default behavior by binding directly to the element's [`className`](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) property using `class-name.bind="...."` or `class-name.one-time="..."`. This will be marginally faster but can add up over a lot of bindings.

### Style

You can bind a css string or object to an element's `style` attribute.

```JavaScript Style Binding Data
export class StyleData {
  constructor() {
    this.styleString = 'color: red; background-color: blue';

    this.styleObject = {
      color: 'red',
      'background-color': 'blue'
    };
  }
}
```

\`\`\`TypeScript Style Binding Data \[variant\] export class StyleData { styleString: string; styleObject: any;

constructor\(\) { this.styleString = 'color: red; background-color: blue';

```text
this.styleObject = {
  color: 'red',
  'background-color': 'blue'
};
```

} }

```text
```HTML Style Binding View
<template>
  <div style.bind="styleString"></div>
  <div style.bind="styleObject"></div>
</template>
```

\`\`\`HTML Style Interpolation

```text
### Focus

We can also use two-way data binding to communicate whether or not an element has focus:

```HTML bind-focus.html
<template>
  <input focus.bind="hasFocus">
  ${hasFocus}
</template>
```

When we click the input field, we see "true" printed. When we click elsewhere, it changes to "false".

### Blur

We can also use one-way data binding, from view to view model, to communicate whether an element is no longer "focused". This is different with normal focus model of the web, which only supports "focusable" element \(element with `tabindex` attribute, form fields such as `<input>` & `<select>` etc..., `<button>`, `<anchor>` with `href` attribute\). Blur attribute consider any interaction inside an element as focus-maintaining action, which will not trigger blur event. It also gives ability to link elements together to determine focus-state of a group of element \(think of a form submission and its confirmation dialog\).

Example of reflecting the focus of a form via a property `detailFormFocused`:

```markup
<form blur.bind='detailFormFocused'>
  <label>Name: <input value.bind='name' /></label>
  <label>Author: <input value.bind='author' /></label>
</form>
```

Then we can use `detailFormFocused` value to determine further actions.

### With

Aurelia provides a special attribute, `with`, that can be used to declare certain parts of our markup to reference properties in a child object of the view-model.

\`\`\`JavaScript bind-with.js export class BindWith { constructor\(\) { this.first = { message : 'Hello' };

```text
this.second = {
  message : 'Goodbye'
}
```

} }

```text
```HTML bind-with.html
<template>
  <p with.bind="first">
    <input type="text" value.bind="message">
  </p>
  <p with.bind="second">
    <input type="text" value.bind="message">
  </p>
</template>
```

Using `with` is basically shorthand for "I'm working with properties of this object", which lets you reuse code as necessary. If you are familiar with `with` keyword of JavaScript, you should be able to see some familiarities here too.

### Content Editable

The previous example compared string interpolation binding with `textcontent.bind`. Interpolation is easier to read but `textcontent.bind` can come in handy when you need to two-bind a `contenteditable` element:

\`\`\`HTML textContent example

```text
You may also need to bind HTML text to an element's `innerHTML` property:

```HTML Binding innerHTML
<template>
  <div innerhtml.bind="htmlProperty | sanitizeHTML"></div>
  <div innerhtml="${htmlProperty | sanitizeHTML}"></div>
</template>
```

> Danger Always use HTML sanitization. We provide a simple converter as a placeholder. However, it does NOT provide security against a wide variety of sophisticated XSS attacks, and should not be relied upon for sanitizing input from unknown sources. You can replace the built-in sanitizer by registering your own implementation of [HTMLSanitizer](https://github.com/aurelia/templating-resources/blob/master/src/html-sanitizer.js) with the app at startup. For example, `aurelia.use.singleton(HTMLSanitizer, BetterHTMLSanitizer);` We recommend using a library such as DOMPurify or sanitize-html for your implementation.
>
> Warning Binding using the `innerhtml` attribute simply sets the element's `innerHTML` property. The markup does not pass through Aurelia's templating system. Binding expressions and `import` elements will not be evaluated.

## Passing Function References

While developing custom elements or custom attributes you may encounter a situation where you have a property that expects a reference to a function. Use the `call` binding command to declare and pass a function to the property. The `call` command is superior to the `bind` command for this use-case because it will execute the function in the correct context, ensuring `this` is what you expect it to be.

\`\`\`HTML Simple call binding

&lt;/my-element&gt;

&lt;/my-element&gt;

```text
Your custom element or attribute can invoke the function that was passed to the property using standard call syntax: `this.go();`. If you need to invoke the function with arguments, create an object whose keys are the argument names and whose values are the argument values, then invoke the function with this "arguments object". The object's properties will be available for data-binding in the `call` binding expression.  For example, invoking the function with `this.go({ x: 5, y: -22, z: 11})`) will make `x`, `y` and `z` available for binding:

```HTML Accessing the call argument properties
<my-element execute.call="doSomething(x, y)"></my-element>
```

## Referencing DOM Elements

Use the `ref` binding command to create a reference to a DOM element. The ref command's most basic syntax is `ref="expression"`. When the view is data-bound the specified expression will be assigned the DOM element.

\`\`\`HTML Simple ref example

 ${nameInput.value}

\`\`\`

The `ref` command has several qualifiers you can use in conjunction with custom elements and attributes:

* `element.ref="expression"`: create a reference to the DOM element \(same as `ref="expression"`\).
* `attribute-name.ref="expression"`: create a reference to a custom attribute's view-model.
* `view-model.ref="expression"`: create a reference to a custom element's view-model.
* `controller.ref="expression"`: create a reference to a custom element's controller instance.

> Info Not Implemented: Only the basic `ref` command is implemented in vNext right now.

## Expression Syntax

Aurelia's expression parser implements a subset of [ECMAScript Expressions](https://tc39.github.io/ecma262/#sec-ecmascript-language-expressions). For the features that are supported, you can typically expect the JavaScript in your view to work the same way as it would in your view-model, or in the browser console. In addition there are two adjustments:

* The Ampersand `&` represents a `BindingBehavior` \(instead of Bitwise AND\)
* The Bar `|` represents a `ValueConverter` \(instead of a Bitwise OR\)

Non-expression syntax \(statements, declarations, function and class definitions\) is not supported.

As an overview of various expressions that are possible, the following list is for illustrative purposes and not exhaustive \(and not necessarily recommended, either\), but should give you a fairly good idea of what you can do:

### Primary Expressions

#### Identifiers

* `foo` - The `foo` variable in the current view-model
* `ßɑṙ` - The `ßɑṙ` variable in the current view-model

> Info non-ASCII characters in the [Latin](https://en.wikipedia.org/wiki/Latin_script_in_Unicode#Table_of_characters) script are supported. This script contains 1,350 characters covering the vast majority of languages. Other \[Non-BMP characters / Surrogate Pairs\]\([https://en.wikipedia.org/wiki/Plane\_\(Unicode](https://en.wikipedia.org/wiki/Plane_%28Unicode)\)\) are not supported.

#### Identifiers with special meaning in Aurelia

* `$this` - The current view-model
* `$parent` - The parent view-model

#### Primitive literals

* `true` - The literal value `true`
* `false` - The literal value `false`
* `null` - The literal value `null`
* `undefined` - The literal value `undefined`

#### String literals and escape sequences

* `'foo'` or `"foo"` - The literal string `foo`
* `'\n'` - The literal string `[NEWLINE]`
* `'\t'` - The literal string `[TAB]`
* `'\''` - The literal string `'`
* `'\\'` - The literal string `\`
* `'\\n'` - The literal string `\n`
* `'\u0061'` - The literal string `a`

> Warning Unsupported string literals include `'\x61'` \(2-point hex escape\), `'\u{61}'` or `'\u{000061}'` \(n-point braced unicode escape\), and Non-BMP characters and Surrogate Pairs.

#### Template literals

* ```foo```  - Equivalent to `'foo'`
* ```foo\${bar}baz\${qux}quux```  - Equivalent to `'foo'+bar+'baz'+qux+'quux'`

#### Numeric literals

* `42` - The literal number `42`
* `42.` or `42.0` - The literal number `42.0`
* `.42` or `0.42` - The literal number `0.42`
* `42.3` - The literal number `42.3`
* `10e3` or `10E3` - The literal number `1000`

> Warning Unsupported numeric literals include `0b01` \(binary integer literal\), `0o07` \(octal integer literal\), and `0x0F` \(hex integer literal\).

#### Array literals

* `[]` - An empty array
* `[1,2,3]` - An array containing the literal numbers `1`, `2` and `3`
* `[foo, bar]` - An array containing the variables `foo` and `bar`
* `[[]]` - An array containing an empty array

> Warning Unsupported array literals include `[,]` - [Elision](https://tc39.github.io/ecma262/#prod-Elision)

#### Object literals

* `{}` - An empty object
* `{foo}` or `{foo,bar}` - ES6 shorthand notation, equivalent to `{'foo':foo}` or `{'foo':foo,'bar':bar}`
* `{42:42}` - Equivalent to `{'42':42}`

> Warning Unsupported object literals include `{[foo]: bar}` or `{['foo']: bar}` \(computed property names\).

### Unary expressions

**`foo` here represents any valid primary expression or unary expression.**

* `+foo` or `+1` - Equivalent to `foo` or `1` \(the `+` unary operator is always ignored\)
* `-foo` or `-1` - Equivalent to `0-foo` or `0-1`
* `!foo` - Negates `foo`
* `typeof foo` - Returns the primitive type name of `foo`
* `void foo` - Evaluates `foo` and returns `undefined`

> Warning Unary increment \(`++foo` or `foo++`\), decrement \(`--foo` or `foo--`\), bitwise \(`~`\), `delete`, `await` and `yield` operators are not supported.

### Binary expressions \(from highest to lowest precedence\)

**`a` and `b` here represent any valid primary, unary or binary expression.**

* `a*b` or `a/b` or `a%b` - Multiplicative
* `a+b` or `a-b` - Additive
* `a<b` or `a>b` or `a<=b` or `a>=b` or `a in b` or `a instanceof b` - Relational
* `a==b` or `a!=b` or `a===b` or `a!==b` - Equality
* `a&&b` - Logical AND
* `a||b` - Logical OR

> Warning Exponentiation \(`a**b`\) and bitwise operators are not supported.

### Conditional expressions

**`foo` etc here represent any valid primary, unary, binary or conditional expression.**

* `foo ? bar : baz`
* `foo ? bar : baz ? qux : quux`

### Assignment expressions

**`foo` here must be an assignable expression \(a simple accessor, a member accessor or an indexed member accessor\). `bar` can any valid primary, unary, binary, conditional or assignment expression.**

* `foo = bar`
* `foo = bar = baz`

### Member and Call expressions

Member expressions with special meaning in Aurelia:

* `$parent.foo` - Access the `foo` variable in the parent view-model
* `$parent.$parent.foo` - Access the `foo` variable in the parent's parent view-model
* `$this` - Access the current view-model \(equivalent to simply `this` inside the view-model if it's an ES class\)

Normal member and call expressions:

**`foo` here represents any valid member, call, assignment, conditional, binary, unary or primary expression \(provided the expression as a whole is also valid JavaScript\).**

* `foo.bar` - Member accessor
* `foo['bar']` - Keyed member accessor
* `foo()` - Function call
* `foo.bar()` - Member function call
* `foo['bar']()` - Keyed member function call

Tagged template literals:

**`foo` here should be a function that can be called. The string parts of the template are passed as an array to the first argument and the expression parts are passed as consecutive arguments.**

* ``foo`bar```  - Equivalent to `foo(['bar'])`
* ``foo`bar\${baz}qux```  - Equivalent to `foo(['bar','qux'], baz)`
* ``foo`bar\${baz}qux\${quux}corge```  - Equivalent to `foo(['bar','qux','corge'],baz,quux)`
* ``foo`\${bar}\${baz}\${qux}```  - Equivalent to `foo(['','','',''],bar,baz,qux)`

### Binding Behaviors and Value Converters

These are not considered to be a part of normal expressions and must always come at the end of an expression \(though multiple can be chained\). Furthermore, BindingBehaviors must come after ValueConverters. \(note: BindingBehavior and ValueConverter are abbreviated to BB and VC for readability\)

Valid BB expressions:

* `foo & bar & baz` - Applies the BB `bar` to the variable `foo`, and then applies the BB `baz` to the result of that.
* `foo & bar:'baz'` - Applies the BB `bar` to the variable `foo`, and passes the literal string `'baz'` as an argument to the BB
* `foo & bar:baz:qux` - Applies the BB `bar` to the variable `foo`, and passes the variables `baz` and `qux` as arguments to the BB
* `'foo' & bar` - Applies the BB `bar` to the literal string `'foo'`

Valid VC expressions \(likewise\):

* `foo | bar | baz`
* `foo | bar:'baz'`
* `foo | bar:baz:qux`
* `'foo' | bar`

Combined BB and VC expressions:

* `foo | bar & baz`
* `foo | bar:42:43 & baz:'qux':'quux'`
* `foo | bar | baz & qux & quux`

Invalid combined BB and VC expressions \(BB must come at the end\):

* `foo & bar | baz`
* `foo | bar & baz | qux`

