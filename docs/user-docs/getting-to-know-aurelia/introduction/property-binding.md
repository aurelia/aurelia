# Property binding

Property binding in Aurelia allows you to set values on elements such as text inputs, showing/hiding content or waiting for a promise to resolve. Most of Aurelia's core template binding features leverage `.bind` prefixed with the property binding attribute.

## Binding to properties

Most native DOM properties can be found. From the `src` attribute images to HTML and Textcontent of a DIV, Aurelia will not stand in your way.

For example, if you wanted to bind to the `src` attribute on an image, this is what it would look like:

```markup
<img src.bind="myImageSource">
```

In our above example `myImageSource` refers to a class property in our view model. If you wanted to bind to other properties on our image such as alt, it would look like this.

```markup
<img src.bind="myImageSource" alt.bind="altValue">
```

The code examples look pretty much identical, right? We use `.bind` to bind onto those native DOM properties.

## Toggling native boolean properties

Some HTML elements have native boolean properties you can bind to, a good example of this is disabled on form elements \(buttons and inputs\) allowing you to programmatically disable and enable a form element using our new friend `.bind` and the property name.

```markup
<button type="submit" disabled.bind="btnDisabled">Submit</button>
```

Inside of our view model, we would define this variable and give it a default boolean value. For this example, we will make it `true` to disable the button. 

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

