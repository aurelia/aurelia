# Class and style binding

Class and style bindings in Aurelia allow you to bind to CSS properties and add one or more classes to your HTML elements inside of your views.

## Binding to the class attribute

The class binding allows you to bind one or more classes to an element and its native `class` attribute.

### Binding to a single class

Adding or removing a single class value from an element can be done using the `.class` binding. By prefixing the `.class` binding with the name of the class you want to conditionally display, for example, `selected.class="myBool"` you can add a selected class to an element. The value you pass into this binding is a boolean value \(either true or false\), if it is `true` the class will be added, otherwise, it will be removed.

```text
<p selected.class="isSelected">I am selected (I think)</p>
```

Inside of your view model, you would specify `isSelected` as a property and depending on the value, the class would be added or removed. 

Here is a working example of a boolean value being toggled using `.class` bindings.

{% embed url="https://stackblitz.com/edit/aurelia-conditional-class?embed=1&file=my-app.html&hideExplorer=1&hideNavigation=1&view=preview" %}

### Binding to multiple classes

Unlike singular class binding, you cannot use the `.class` binding syntax to conditionally bind multiple CSS classes. However, there is a multitude of different ways in which this can be achieved.

| Syntax | Input Type | Example |
| :--- | :--- | :--- |
| `class.bind="someString"` | `string` | `'col-md-4 bg-${bgColor}'` |
| `class="${someString}"` | `string` | `col-md-4 ${someString}` |

## Binding to the style attribute

Dynamically set CSS styles on elements in your view templates.

### Binding to a single style

You can dynamically add a CSS style value to an element using the `.style` binding in Aurelia.

```text
<p background.style="bg">My background is blue</p>
```

Inside of your view model, you would specify `bg` as a string value on your class. 

Here is a working example of a style binding setting the background colour to blue:

{% embed url="https://stackblitz.com/edit/aurelia-conditional-style?embed=1&file=my-app.html&hideExplorer=1&hideNavigation=1&view=preview" %}

### Binding to multiple styles

To bind to one or more CSS style properties you can either use a string containing your style values \(including dynamic values\) or an object containing styles.

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

