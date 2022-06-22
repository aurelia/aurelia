# Attributes transferring

## Introduction

Attribute transferring is a way to relay the binding(s) on a custom element to it's child element(s).

As an application grows, the components inside it also grow. Something that starts simple like the following component

```typescript
export class FormInput {
  @bindable label
  @bindable value
}
```

with the template

```markup
<label>${label}
  <input value.bind="value">
</label>
```

can quickly grow out of hand with a number of needs for configuration: aria, type, min, max, pattern, tooltip, validation etc...

After a while, the `FormInput` component above will become more and more like a relayer to transfer the bindings from outside, to the elements inside it. This often results in the increase of the number of `@bindable`. This is completely fine except that it's quite some boilerplate code that is not always desirable:

```typescript
export class FormInput {
  @bindable label
  @bindable value
  @bindable type
  @bindable tooltip
  @bindable arias
  @bindable etc
}
```

And the usage of such element may look like this

```markup
<form-input
  label.bind="label"
  value.bind="message"
  tooltip.bind="Did you know Aurelia syntax comes from an idea of an Angular community member? We greatly appreciate Angular and its community for this."
  validation.bind="...">
```

to be repeated like this inside:

```markup
<label>${label}
  <input value.bind tooltip.bind validation.bind min.bind max.bind>
</label>
```

To juggle all the relevant pieces for such relaying task isn't difficult, but somewhat tedious. With attribute transferring, which is roughly close to object spreading in JavaScript, the above template should be as simple as:

```markup
<label>${label}
  <input ...$attrs>
</label>
```

, which reads like this: for some bindings on `<form-input>`, change the targets of those bindings to the `<input>` element inside it.

## Usage

To transfer attributes & bindings from a custom element, there are two steps:

* Set `capture` to `true` on a custom element via `@customElement` decorator:

```typescript
@customElement({
  ...,
  capture: true
})
```

Or use the `capture` decorator from `aurelia` package:
```typescript
import { capture } from 'aurelia';

@capture
export class MyCustomElement {
  ...
}

// either form is valid
@capture()
export class MyCustomElement {
  ...
}
```

As the name suggests, this is to signal the template compiler that all the bindings & attributes, with some exceptions, should be captured for future usages.

* Spread the captured attributes onto an element:

```markup
<input ...$attrs>
```

In case you want to spread all attributes while explicitely overriding inidividual ones, make sure these come after the spread operator

```markup
<input value.bind="..." ...$attrs> spread wins
<input ...$attrs value.bind="..."> explicit wins
```

So as a safe practice, keep attribute spreading left-most in order to avoid potentially undesired behaviors.

{% hint style="warning" %}
It's recommended that this feature should not be overused in multi level capturing & transferring. This is often known as prop-drilling in React, and could have bad effect on overall & long term maintainability of a project. It's probably healthy to limit the max level of transferring to 2.
{% endhint %}

## Usage with conventions

Aurelia conventions enables the setting of `capture` metadata from the template via `<capture>` tag, like the following example:
```markup
<capture>

<input ...$attrs>
```

## How it works

### What attributes are captured

Everything except template controller and custom element bindables are captured. For the following example:

View model:

```typescript
export class FormInput {
  @bindable label
}
```

Usage:

```markup
<form-input if.bind="needsComment" label.bind="label" value.bind="extraComment" class="form-control" style="background: var(--theme-purple)" tooltip="Hello, ${tooltip}">
```

What are captured:

* `value.bind="extraComment"`
* `class="form-control"`
* `style="background: var(--theme-purple)"`
*   `tooltip="Hello, ${tooltip}"`

    What are not captured:
* `if.bind="needsComment"` (`if` is a template controller)
* `label.bind="label"` (`label` is a bindable property)

### How will attributes be applied in ...$attrs

Attributes that are spread onto an element will be compiled as if it was declared on that element.

This means `.bind` command will work as expected when it's transferred from some element onto some element that uses `.two-way` for `.bind`.

It also means that spreading onto a custom element will also work: if a captured attribute is targeting a bindable property of the applied custom element. An example:

```markup
app.html
<input-field value.bind="message">

input-field.html
<my-input ...$attrs>
```

if `value` is a bindable property of `my-input`, the end result will be a binding that connect the `message` property of the corresponding `app.html` view model with `<my-input>` view model `value` property. Binding mode is also preserved like normal attributes.
