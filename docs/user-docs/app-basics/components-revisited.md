# Components Revisited

## Shadow DOM and Slots

// TODO

## HTML-Only Components

In some instances, a component does not need a view-model, just the HTML aspect. Perhaps you have a component that renders a profile photo or displays a stylized heading, both of which only require basic bindable values.

The convention for HTML-only components is the filename becomes the tag name, and when you are referencing them throughout your application, you must also add the `.html` file extension.

### Without Bindable Properties

Here is a basic example that will render a heading one element with a value of `This is a HTML-only component`.

```markup
<h1>This is a HTML-only component</h1>
```

Saving this as `my-element.html` will result in a component that will be referenced using its tag `<my-element></my-element>`. To import the component in your application, use the `<import>` element.

```markup
<import from="./my-element.html"></import>

<my-element></my-element>
```

### With Bindable Properties

In many instances, you'll want a custom element which supports one or more bindable properties. These properties allow you to pass in data to the component itself. Taking the above example, let's allow the text to be changed and we will save it as `heading-one.html` instead.

```markup
<bindable name="text"></bindable>
<h1>${text}</h1>
```

To use our newly created `heading-one` component, import it and use it like this:

```markup
<import from="./heading-one.html"></import>

<heading-one text="This is my heading..."></heading-one>
```

You can even specify the binding mode for your bindables. This will make our bindable property `two-way` so it updates in both directions.

```markup
<bindable name="text" mode="two-way"></bindable>
<h1>${text}</h1>
```

## Odds and Ends

Aurelia's component system is rich with features, designed to enable you to tackle any scenario that your app demands.

### Bindable Options

// TODO

### Containerless Components

// TODO

### The `@children` Decorator

// TODO

### The `as-element` Attribute

In some cases, especially when creating table rows out of Aurelia custom elements, you may need to have a custom element masquerade as a standard HTML element. For example, if you're trying to fill table rows with data, you may need your custom element to appear as a `<tr>` row or `<td>` cell. This is where the `as-element` attribute comes in handy.

{% tabs %}
{% tab title="my-app.html" %}
```markup
<import from="./hello-row.html">

<table>
  <tr as-element="hello-row">
</table>
```
{% endtab %}

{% tab title="hello-row.html" %}
```markup
<td>Hello</td>
<td>World</td>
```
{% endtab %}
{% endtabs %}

The `as-element` attribute tells Aurelia that we want the content of the table row to be exactly what our `hello-row` template wraps. The way different browsers render tables means this may be necessary sometimes.

