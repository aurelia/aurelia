# Components Revisited

## Shadow DOM and Slots

// TODO

## HTML-Only Components

// TODO

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

{% code-tabs %}
{% code-tabs-item title="my-app.html" %}
```markup
<import from="./hello-row.html">

<table>
  <tr as-element="hello-row">
</table>
```
{% endcode-tabs-item %}

{% code-tabs-item title="hello-row.html" %}
```markup
<td>Hello</td>
<td>World</td>
```
{% endcode-tabs-item %}
{% endcode-tabs %}

The `as-element` attribute tells Aurelia that we want the content of the table row to be exactly what our `hello-row` template wraps. The way different browsers render tables means this may be necessary sometimes.

