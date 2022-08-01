# Attribute and property bindings

Attribute binding in Aurelia allows you to bind to any native HTML attribute in your templates. Binding to HTML attributes in Aurelia allows you to modify classes, style properties, attribute states and more.

The basic syntax for most attributes being bound is:

```html
<div attribute-name.bind="value"></div>
```

You can bind basically every attribute from this list [here](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes). Some examples of what you are able to bind to can be found below with code examples.

### Binding Keywords:

- `one-time`: flows data one direction, from the view-model to the view, once.
- `to-view` / `one-way`: flows data one direction, from the view-model to the view.
- `from-view`: flows data one direction, from the view to the view-model.
- `two-way`: flows data both ways, from view-model to view and from view to view-model.
- `bind`: automatically chooses the binding mode. Uses `two-way` binding for form controls and `to-view `binding for almost everything else.

```html
  <input type="text" value.bind="firstName">
  <input type="text" value.two-way="lastName">
  <input type="text" value.from-view="middleName">

  <a class="external-link" href.bind="profile.blogUrl">Blog</a>
  <a class="external-link" href.to-view="profile.twitterUrl">Twitter</a>
  <a class="external-link" href.one-time="profile.linkedInUrl">LinkedIn</a>
  ```

The first input uses the `bind` command which will automatically create `two-way` bindings for input value attribute bindings. The second and third input uses the `two-way` / ``from-view`` commands which explicitly set the binding modes. For the first and second inputs, their value will be updated whenever the bound view-model `firstName` / `lastName` properties are updated, and the those properties will also be updated whenever the inputs change. For the third input, changes in the bound view-model `middleName` property will not update the input value, however, changes in the input will update the view-model. The first anchor element uses the `bind` command which will automatically create a `to-view` binding for anchor href attributes. The other two anchor elements use the `to-view` and `one-time` commands to explicitly set the binding's mode.

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

## Binding to the class attribute

The class binding allows you to bind one or more classes to an element and its native `class` attribute.

### Binding to a single class

Adding or removing a single class value from an element can be done using the `.class` binding. By prefixing the `.class` binding with the name of the class you want to conditionally display, for example, `selected.class="myBool"` you can add a selected class to an element. The value you pass into this binding is a boolean value (either true or false), if it is `true` the class will be added, otherwise, it will be removed.

```html
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
