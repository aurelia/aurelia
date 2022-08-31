# Template references and variables

Template references and variables allow you to identify and specify parts of your templates that are accessible both inside of the view itself as well as the view model.

## Template references

Using the `ref` attribute you can denote elements as variables.

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
Template references are a great way to reference elements inside of view-models for use with third-party libraries. They negate the need to query for elements using Javascript API's.
{% endhint %}

## Template variables

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

