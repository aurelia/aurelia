---
description: Using built-in custom attributes and building your own.
---

# Custom Attributes

## Built-Ins

Aurelia provides a number of custom attributes out-of-the-box. Let's take a look at each of them below.

### Blur

We can also use one-way data binding, from view to view model, to communicate whether an element is no longer "focused". This is different with normal focus model of the web, which only supports "focusable" element \(element with `tabindex` attribute, form fields such as `<input>` & `<select>` etc..., `<button>`, `<anchor>` with `href` attribute\). Blur attribute consider any interaction inside an element as focus-maintaining action, which will not trigger blur event. It also gives ability to link elements together to determine focus-state of a group of element \(think of a form submission and its confirmation dialog\).

Example of reflecting the focus of a form via a property `detailFormFocused`:

```markup
<form blur.bind='detailFormFocused'>
  <label>Name: <input value.bind='name' /></label>
  <label>Author: <input value.bind='author' /></label>
</form>
```

Then we can use `detailFormFocused` value to determine further actions.

### Focus

We can also use two-way data binding to communicate whether or not an element has focus:

{% code-tabs %}
{% code-tabs-item title="Binding Focus" %}
```markup
<input focus.bind="hasFocus">
${hasFocus}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

When we click the input field, we see "true" printed. When we click elsewhere, it changes to "false".

### With

Aurelia provides a special attribute, `with`, that can be used to declare certain parts of our markup to reference properties in a child object of the view-model.

{% code-tabs %}
{% code-tabs-item title="my-app.html" %}
```markup
<p with.bind="first">
  <input type="text" value.bind="message">
</p>
<p with.bind="second">
  <input type="text" value.bind="message">
</p>
```
{% endcode-tabs-item %}

{% code-tabs-item title="my-app.js" %}
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
{% endcode-tabs-item %}
{% endcode-tabs %}

Using `with` is basically shorthand for "I'm working with properties of this object", which lets you reuse code as necessary. If you are familiar with `with` keyword of JavaScript, you should be able to see some familiarities here too.

### 

## 

