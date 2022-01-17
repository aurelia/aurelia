---
description: As you will soon discover, Aurelia is enhanced HTML.
---

# Enhanced HTML

All of Aurelia's templating is HTML driven, with some Aurelia-specific concepts sprinkled over the top in the form of enhanced HTML.

{% hint style="warning" %}
As a security precaution, Aurelia will not allow you to use script elements inside of your Aurelia views.  This is to prevent script injection attacks and other forms of unsafe code from making your Aurelia applications insecure.
{% endhint %}

## Interpolation

String interpolation allows you to display values within your template views. By leveraging `${}` which is a dollar sign followed by opening and closing curly braces, you can display values inside of your views. If you are familiar with [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template\_literals), the syntax will be familiar to you.

### Displaying values with interpolation

Interpolation can be used to display the value of variables within your HTML templates, as well as object properties and other forms of valid data.

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

If you have a function inside of your view model, you can also call functions with parameters.

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

### Syntax

You would be forgiven for thinking that you can do pretty much anything that Javascript allows you to do, but there are limitations in what you can do inside of interpolation you need to be aware of.

1. Expressions cannot be chained using `;` or `,`
2. You cannot use primitives such as `Boolean`, `String`, `instanceOf`, `typeof` and so on
3. Quite a few of the operators introduced in ES2015 and beyond including nullish coalescing and optional chaining
4. You can only use the pipe separator `|` when using value converters, but not as a bitwise operator

## Binding to properties

Property binding in Aurelia allows you to set values on elements such as text inputs, showing/hiding content or waiting for a promise to resolve. Most of Aurelia's core template binding features leverage `.bind` prefixed with the property binding attribute.

Most native DOM properties can be bound. From the `src` attribute on images to HTML and Textcontent of a DIV, Aurelia will not stand in your way if it's a native property.

For example, if you wanted to bind to the `src` attribute on an image, this is what it would look like:

```markup
<img src.bind="myImageSource">
```

In our above example `myImageSource` refers to a class property in our view model. If you wanted to bind to other properties on our image such as alt, it would look like this.

```markup
<img src.bind="myImageSource" alt.bind="altValue">
```

The code examples look pretty much identical, right? We use `.bind` to bind onto those native DOM properties.

#### Binding to the textcontent property

```html
<div textcontent.bind="myContent"></div>
```

**Binding to the innerhtml property**

```html
<div innerhtml.bind="myContent"></div>
```

## Toggling native boolean properties

Some HTML elements have native boolean properties you can bind to, a good example of this is disabled on form elements (buttons and inputs) allowing you to programmatically disable and enable a form element using our new friend `.bind` and the property name.

```markup
<button type="submit" disabled.bind="btnDisabled">Submit</button>
```

Inside of our view model, we would define this variable and give it a default boolean value. For this example, we will make it `true` to disable the button.&#x20;

```typescript
export class MyViewModel {
  btnDisabled = true;
}
```

There are quite a few useful native boolean properties you can leverage Aurelia's binding system to work with including; `checked`, `readonly` and `required`.

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

## Binding to the class attribute

The class binding allows you to bind one or more classes to an element and its native `class` attribute.

### Binding to a single class

Adding or removing a single class value from an element can be done using the `.class` binding. By prefixing the `.class` binding with the name of the class you want to conditionally display, for example, `selected.class="myBool"` you can add a selected class to an element. The value you pass into this binding is a boolean value (either true or false), if it is `true` the class will be added, otherwise, it will be removed.

```
<p selected.class="isSelected">I am selected (I think)</p>
```

Inside of your view model, you would specify `isSelected` as a property and depending on the value, the class would be added or removed.&#x20;

Here is a working example of a boolean value being toggled using `.class` bindings.

{% embed url="https://stackblitz.com/edit/aurelia-conditional-class?embed=1&file=my-app.html&hideExplorer=1&hideNavigation=1&view=preview" %}

### Binding to multiple classes

Unlike singular class binding, you cannot use the `.class` binding syntax to conditionally bind multiple CSS classes. However, there is a multitude of different ways in which this can be achieved.

| Syntax                    | Input Type | Example                    |
| ------------------------- | ---------- | -------------------------- |
| `class.bind="someString"` | `string`   | `'col-md-4 bg-${bgColor}'` |
| `class="${someString}"`   | `string`   | `col-md-4 ${someString}`   |

Once you have your CSS imported and ready to use in your components, there might be instances where you want to dynamically bind to the style attribute on an element (think setting dynamic widths or backgrounds).

## Binding to the style attribute

### Binding to a single style

You can dynamically add a CSS style value to an element using the `.style` binding in Aurelia.

```html
<p background.style="bg">My background is blue</p>
```

Inside of your view model, you would specify `bg` as a string value on your class.&#x20;

Here is a working example of a style binding setting the background colour to blue:

{% embed url="https://stackblitz.com/edit/aurelia-conditional-style?embed=1&file=my-app.html&hideExplorer=1&hideNavigation=1&view=preview" %}

### Binding to multiple styles

To bind to one or more CSS style properties you can either use a string containing your style values (including dynamic values) or an object containing styles.

#### Style binding using strings

This is what a style string looks like, notice the interpolation here? It almost resembles just a plain native style attribute, with exception of the interpolation for certain values. Notice how you can also mix normal styles with interpolation as well?

{% code title="my-app.ts" %}
```typescript
export class MyApp {
  private backgroundColor = 'black';
  private textColor = '#FFF';
}
```
{% endcode %}

{% code title="my-app.html" %}
```markup
<p style="color: ${textColor}; font-weight: bold; background: ${backgroundColor};">Hello there</p>

```
{% endcode %}

You can also bind a string from your view model to the `style` property instead of inline string assignment by using `style.bind="myString"` where `myString` is a string of styles inside of your view model.

#### Style binding using objects

Styles can be passed into an element by binding to the styles property and using `.bind` to pass in an object of style properties. We can rewrite the above example to use style objects.

{% code title="my-app.ts" %}
```typescript
export class MyApp {
  private styleObject = {
    background: 'black',
    color: '#FFF'
  };
}
```
{% endcode %}

{% code title="my-app.html" %}
```markup
<p style.bind="styleObject">Hello there</p>

```
{% endcode %}

From a styling perspective, both examples above do the same thing. However, we are passing in an object and binding it to the `style` property instead of a string.
