# Styling binding

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

