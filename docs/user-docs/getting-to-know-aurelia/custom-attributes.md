---
description: Using built-in custom attributes and building your own.
---

# Custom attributes

## Default Built-Ins

Aurelia provides a number of custom attributes out-of-the-box. Let's take a look at each of them below.

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

