---
description: Learn all there is to know about Aurelia's HTML templating syntax.
---

# Template syntax

Aurelia uses an HTML-based syntax for templating, allowing you to build applications straightforwardly. All Aurelia templates are valid spec-compliant HTML that works in all browsers and HTML parsers.

## Text Interpolation

String interpolation allows you to display values within your template views. By leveraging `${}` which is a dollar sign followed by opening and closing curly braces, you can display values inside of your views. The syntax will be familiar to you if you are familiar with [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template\_literals).

### Displaying values with interpolation

Interpolation can be used to display the value of variables within your HTML templates,  object properties and other forms of valid data.

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

Notice how the variable we reference in our HTML template is the same as it is defined inside of our view model? Anything specified on our view model class is accessible in the view. Aurelia will replace `${myName}` with `Aurelia` think of it as a fancy string replacement. All properties defined in your view-model will be accessible inside of your templates.

### Template expressions

A template expression allows you to perform code operations inside of `${}` we learned about earlier. You can perform addition, subtraction and even call functions inside of interpolation.

In the following simple example, we are adding two and two together, the value that will be displayed will be `4`.

```
<p>Quick maths: ${2 + 2}</p>
```

If you have a function inside your view model, you can also call functions with parameters.

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

```markup
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
3. You can only use the pipe separator `|` when using value converters, but not as a bitwise operator

## Attribute Bindings

Attribute binding in Aurelia allows you to bind to any native HTML attribute in your templates. Binding to HTML attributes in Aurelia allows you to modify classes, style properties, attribute states and more.

The basic syntax for most attributes being bound is:

```html
<div attribute-name.bind="value"></div>
```

You can bind almost every attribute from this list [here](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes). Some examples of what you can bind to can be found below with code examples.

### Binding Keywords:

* `one-time`: flows data in one direction, from the view-model to the view, once.
* `to-view` / `one-way`: flows data in one direction, from the view-model to the view.
* `from-view`: flows data in one direction, from the view to the view-model.
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

The first input uses the `bind` command which will automatically create `two-way` bindings for input value attribute bindings. The second and third input uses the `two-way` / `from-view` commands which explicitly set the binding modes. For the first and second inputs, their value will be updated whenever the bound view-model `firstName` / `lastName` properties are updated, and the those properties will also be updated whenever the inputs change. For the third input, changes in the bound view-model `middleName` property will not update the input value, however, changes in the input will update the view-model. The first anchor element uses the `bind` command which will automatically create a `to-view` binding for anchor href attributes. The other two anchor elements use the `to-view` and `one-time` commands to explicitly set the binding's mode.

### Binding to images

You can bind to numerous image properties, but the most common one of those is the `src` attribute that allows you to bind the image source. The value in the below example is `imageSrc` which is a property inside of the view model.

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

### Binding to innerhtml and textcontent

The native innerhtml and textcontent properties allow you to set the values of HTML elements. When binding to these properties, the difference between what to choose is `textcontent` will not display HTML tags and `innerhtml` will.

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

When working with custom elements in Aurelia, if you leverage bindables to have custom bindable properties allowing values to be bound, you will use `.bind` extensively. Say you had a custom element that accepted an email value, you might call it `email` inside of your component definition.

{% code title="my-custom-element.ts" %}
```typescript
import { bindable, customElement } from 'aurelia';

@customElement('my-custom-element')
export class MyCustomElement {
  @bindable email = '';
}
```
{% endcode %}

Referencing our custom element, if we wanted to bind in a value to our `email` property we would do this:

```markup
<my-custom-element email.bind="myEmail"></my-custom-element>
```

This allows us to pass in data to custom elements in a clean and familiar way.

