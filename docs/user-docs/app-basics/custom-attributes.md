---
description: Using built-in custom attributes and building your own.
---

# Custom Attributes

## Built-Ins

Aurelia provides a number of custom attributes out-of-the-box. Let's take a look at each of them below.

### Blur

We can use one-way data binding, from view to view model, to communicate whether an element is no longer "focused". This is different from the normal focus model of the web, which only supports "focusable" elements \(element with `tabindex` attribute, form fields such as `<input>`, `<select>` etc..., `<button>`, `<anchor>` with `href` attribute\). The Blur attribute considers any interaction inside an element as a focus-maintaining action, which will not trigger blur event. It also makes it possible to link elements together to determine the focus-state of a group of elements \(think of a form submission and its confirmation dialog\).

If a view model property is bound to `blur`, the property will be set to `false` when the element loses focus.

Example of reflecting the focus of a form via a property `detailFormFocused`:

```markup
<form blur.bind='detailFormFocused'>
  <label>Name: <input value.bind='name' /></label>
  <label>Author: <input value.bind='author' /></label>
</form>
```

Here, we use the `detailFormFocused` value to determine further actions.

### Focus

We can also use two-way data binding to communicate whether or not an element has focus:

{% code title="Binding Focus" %}
```markup
<input focus.bind="hasFocus">
${hasFocus}
```
{% endcode %}

When we click the input field, we see "true" printed. When we click elsewhere, it changes to "false".

### With

Aurelia provides a special attribute, `with`, that can be used to declare certain parts of our markup to reference properties in a child object of the view-model.

{% tabs %}
{% tab title="my-app.html" %}
```markup
<p with.bind="first">
  <input type="text" value.bind="message">
</p>
<p with.bind="second">
  <input type="text" value.bind="message">
</p>
```
{% endtab %}

{% tab title="my-app.js" %}
```javascript
export class MyApp {
  constructor() {
    this.first = {
      message : 'Hello'
    };
    this.second = {
      message : 'Goodbye'
    }
  }
}
```
{% endtab %}
{% endtabs %}

Using `with` is basically shorthand for "I'm working with properties of this object", which lets you reuse code as necessary. If you are familiar with `with` keyword of JavaScript, you should be able to see some familiarities here too.

### 

## 

