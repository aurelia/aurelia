---
description: The basics of templating in Aurelia.
---

# Template Syntax

Aurelia uses an intuitive HTML-based template syntax which is spec compliant. By leveraging a reactive binding approach without the overhead of a Virtual DOM, Aurelia allows you to write expressive and fast reactive user interfaces.

### Interpolation

#### Text

Using Aurelia's interpolation syntax \(a dollar sign followed by enclosed curly braces\) `${}` you can display text in your views:

```text
<p>My name is: ${name}</p>
```

This syntax is borrowed from the Template Strings syntax you might already be familiar with in Javascript. The interpolation will be replaced with the value corresponding to the variable `name` defined on the view-model. When `name` changes, the value will be updated in the UI.

You can also specify one-time interpolations using the `oneTime` binding behavior which will instruct Aurelia to display the value once and not watch this value for any further changes.

```text
<p>My name is: ${name & oneTime}</p>
```

#### HTML

For safety reasons, standard interpolation will only display values as text. This means if you want to display HTML, `${}` will not work. If you want to display HTML in your views, you can behind to the `innerhtml` property on an element to set the HTML \(just like you would in Javascript\).

```text
<p>This is raw HTML: <span innerhtml.bind="myHtml"></span></p>
```

The contents of the span will be replaced with the value of the `myHtml` variable defined within your view-model. This value will be interpreted as plain HTML, so any Aurelia specific bindings will be ignored.

#### Attributes

Native HTML attributes can easily be bound, or you can use interpolation inside of those too. A common scenario might be disabling a button inside of a form:

```text
<button disabled.bind="buttonDisabled">My Button</button>
```

If the value of `buttonDisabled` is truthy, the button will be disabled. If the value of `buttonDisabled` is falsy, the button will be enabled.

You can also bind to other attributes like `id`:

```text
<div id.bind="myId">Unique Element</div>
```

If you want to use interpolation, this will also work:

```text
<div id="${myId}">Unique Element</div>
```

#### Interpolation Expressions

While we have only shown you how to display values, interpolation supports a heap of other cool things including basic math and ternary expressions:

```text
<p>${myNumber * 5}</p>
```

A ternary:

```text
<p>${isTrue ? 'True' : 'False'}</p>
```

How about we call a function:

```text
<p>${myFunctionReturnsSomething()}</p>
```

### Events

You can bind to a whole variety of native Javascript events, depending on the element you are binding to. Unlike standard bindings in Aurelia which are denoted using `.bind`, binding to events works a little differently \(but still uses a decimal to denote a binding\).

There are three different ways you can bind to events; delegate, trigger and capture. In most instances, you will use either delegate or trigger, with capture being reserved for cases where the prior event bindings do not work, capture is all but guaranteed to work.

Keep in mind that `delegate` will only work for events that bubble \(as per the spec\). For a full list of events that can bubble, please see [this reference link](https://en.m.wikipedia.org/wiki/DOM_events#Events). If the event bubbles, then `delegate` can be used. Mdn is also a great resource for events as well, which you can find [here](https://developer.mozilla.org/en-US/docs/Web/Events).

Two of the most common events that do not bubble and, therefore do not work with `delegate` are `focus` and `blur`. There are others, but they are not commonly used when binding inside of a view.

#### Click

A common scenario is capturing a click on a button or link, you have a couple of different options and you should choose the one that works best for your needs.

```text
<button type="button" click.trigger"clickCallback()">Click Me!</button>
```

Using `.trigger` will attach a native event listener to the button, it's the equiavelent of writing `addEventListener` which is what Aurelia does under the hood for you anyway. In many cases, using `trigger` is recommended as it does not delegate and therefore, can lead to fewer issues when dealing with delegated events.

However, if you are working with a lot of elements, say a list of items and each of those can be clicked, using `.delegate` might be a better option. The syntax is mostly the same.

```text
<button type="button" click.delegate"clickCallback()">Click Me!</button>
```

What Aurelia will do here is attach an event listener to the nearest common parent. Say you have an unordered list of items and you have `click.delegate` used inside of it, Aurelia would know to attach an event listener to the `ul` element and listen for click events as they bubble up.

#### Change and Input

These two events are commonly used when dealing with form elements; `<input>`, `<select>` and `<textarea>` especially. There are differences between the `change` and `input` events, which is often a source of confusion for developers not knowing which one they should use. Like the `click` event, both `change` and `input` support using `delegate` as well as `trigger`.

The `change` event fires when a form element has finished changing. This means that the change event will not be fired as the user types into a text input, which can be confusing if you're not aware of this. A text input will only fire a `change` event once it loses focus.

```text
<input type="text" change.trigger="changeCallback()">
```

If you want to call a function as the user types or performs other actions inside of your form elements, you will want to use `input`. The `input` event is fired every time the value is modified by the user, even if the user pastes text into the input or deletes the value.

```text
<input type="text" input.trigger="changeCallback()">
```

You can read about the change event [here](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event) and the input event [here](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event).

