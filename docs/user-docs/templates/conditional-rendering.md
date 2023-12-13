---
description: >-
  Learn about the various methods for conditionally rendering content in Aurelia 2, with detailed explanations and examples.
---

# Conditional Rendering in Aurelia 2

Conditional rendering in Aurelia 2 is a powerful feature that lets you create dynamic interfaces that respond to your application's state. You can conditionally include or exclude parts of your view using boolean expressions. This guide will walk you through the different techniques provided by Aurelia to manage conditional content.

## Using `if.bind`

The `if.bind` directive allows you to conditionally add or remove elements from the DOM based on the truthiness of the bound expression.

When the bound value evaluates to `false`, Aurelia removes the element and its descendants from the DOM. This process includes the destruction of custom elements, detaching of events, and cleanup of any associated resources, which is beneficial for performance and memory management.

Consider an application where you want to display a loading message while data is being fetched:

```HTML
<div if.bind="isLoading">Loading...</div>
```

The `isLoading` variable controls the presence of the div in the DOM. When it's `true`, the loading message appears; when `false`, the message is removed.

### Complementing `if.bind` with `else`

Aurelia enables `if/else` structures in the view, similar to conditional statements in JavaScript. The `else` binding must immediately follow an element with `if.bind`:

```HTML
<div if.bind="user.isAuthenticated">Welcome back, ${user.name}!</div>
<div else>Please log in.</div>
```

This snippet displays a welcome message for authenticated users and a login prompt for others.

{% hint style="important" %}
**Caching Behavior:** By default, `if.bind` caches the view and view model of the element it's applied to. While caching can improve performance by reusing elements rather than recreating them, it may lead to unexpected behavior if you're not anticipating this. If state management becomes an issue, you may disable caching with the verbose syntax:

```html
<custom-element if="value.bind: canShowElement; cache: false"></custom-element>
```

In this code, `value.bind` is the condition, and `cache: false` disables caching. Use this feature judiciously, as excessive use can impact performance.
{% endhint %}

### Performance Considerations

Be mindful that `if.bind` modifies the DOM structure, which can trigger reflow and repaint processes in the browser. For applications with extensive DOM manipulation, this may become a performance bottleneck. Optimize your usage of `if.bind` by minimizing the frequency and complexity of conditional rendering operations.

## Employing `show.bind`

The `show.bind` directive offers an alternative approach to conditional rendering. Instead of adding or removing elements from the DOM, it toggles their visibility. This is akin to applying `display: none;` in CSS—the element remains in the DOM but is not visible to the user.

```markup
<div show.bind="isDataLoaded">Data loaded successfully!</div>
```

Here, `isDataLoaded` dictates the visibility of the message. When `false`, the message is hidden; when `true`, it is shown. All bindings and events remain intact since the element is not removed from the DOM.

## Leveraging `switch.bind`

For more complex conditional rendering cases, such as when dealing with enumerated values, `switch.bind` is the ideal choice. It offers a clean, semantic way to handle multiple conditions by mimicking the `switch` statement in JavaScript.

For instance, given an enumeration of order statuses:

{% code title="Status.ts" %}
```typescript
enum Status {
  Received   = 'received',
  Processing = 'processing',
  Dispatched = 'dispatched',
  Delivered  = 'delivered',
  Unknown    = 'unknown',
}
```
{% endcode %}

Displaying a message based on the order status with `if.bind` can become unwieldy. Instead, `switch.bind` offers a concise and clear approach:

{% code title="order-status.html" %}
```html
<template switch.bind="orderStatus">
  <span case="received">Order received.</span>
  <span case="processing">Processing your order.</span>
  <span case="dispatched">On the way.</span>
  <span case="delivered">Delivered.</span>
  <span default-case>Status unknown.</span>
</template>
```
{% endcode %}

This structure allows for a straightforward mapping between the status and the corresponding message. The `default-case` acts as a catch-all for any status not explicitly handled.

### Grouping Cases

You can bind an array of values to a `case`, thus grouping multiple conditions:

```html
<template switch.bind="orderStatus">
  <span case.bind="['received', 'processing']">Order is being processed.</span>
  <span case="dispatched">On the way.</span>
  <span case="delivered">Delivered.</span>
</template>
```

This will display "Order is being processed." for both `Received` and `Processing` statuses.

### Fall-Through Behavior

The `switch` construct in Aurelia supports fall-through logic similar to JavaScript's `switch`:

```html
<template switch.bind="orderStatus">
  <span case="received" fall-through.bind="true">Order received.</span>
  <span case="processing">Order is being processed.</span>
  <!-- Other cases -->
</template>
```

When `orderStatus` is `Received`, both the "Order received." and "Order is being processed." messages will be displayed because of the `fall-through` attribute.

{% hint style="info" %}
* By default, `fallThrough` is `false`. If you want a case to fall through, you must explicitly set `fall-through.bind="true"`.
* You can use the shorthand `fall-through="true"` instead of binding, which will be interpreted as boolean values.
{% endhint %}

## Advanced Scenarios with `switch.bind`

Aurelia's `switch.bind` can accommodate various advanced use cases, making it a versatile tool for conditional rendering. Below are examples of such scenarios:

### Using `switch.bind` with Static Expressions

You can use `switch.bind` with a static expression, while the `case.bind` attributes feature more dynamic conditions:

```HTML
<template repeat.for="num of 100">
  <template switch.bind="true">
    <span case.bind="num % 3 === 0 && num % 5 === 0">FizzBuzz</span>
    <span case.bind="num % 3 === 0">Fizz</span>
    <span case.bind="num % 5 === 0">Buzz</span>
  </template>
</template>
```

This example iterates over numbers 0 to 99 and applies the FizzBuzz logic, displaying "Fizz", "Buzz", or "FizzBuzz" depending on whether the number is divisible by 3, 5, or both.

### Conditional Slot Projection with `switch.bind`

`switch.bind` can be combined with `au-slot` to project content into custom elements conditionally:

```html
<template as-custom-element="foo-bar">
  <au-slot name="s1"></au-slot>
</template>

<foo-bar>
  <template au-slot="s1" switch.bind="status">
    <span case="received">Order received.</span>
    <span case="dispatched">On the way.</span>
    <span case="processing">Processing your order.</span>
    <span case="delivered">Delivered.</span>
  </template>
</foo-bar>
```

In this case, the custom element `foo-bar` will project different messages based on the `status` value.

### Nesting `switch.bind`

`switch.bind` can be nested within itself for complex conditional logic:

```html
<template>
  <let day.bind="2"></let>
  <template switch.bind="status">
    <span case="received">Order received.</span>
    <span case="dispatched">On the way.</span>
    <span case="processing">Processing your order.</span>
    <span case="delivered" switch.bind="day">
      Expected to be delivered
      <template case.bind="1">tomorrow.</template>
      <template case.bind="2">in 2 days.</template>
      <template default-case>in a few days.</template>
    </span>
  </template>
</template>
```

This example demonstrates how you can use nested `switch.bind` statements to handle multiple levels of conditional rendering.

### Restrictions on `case` Usage

The `case` attribute must be used within the context of a `switch` and should be its direct child. The following are examples of incorrect and unsupported usages:

```html
<!-- Incorrect: `case` outside of `switch` context -->
<span case="foo"></span>

<!-- Incorrect: `case` not a direct child of `switch` -->
<template switch.bind="status">
  <template if.bind="someCondition">
    <span case="delivered">Delivered</span>
  </template>
</template>
```

These examples will either throw an error or result in unexpected behavior. If you need to support a use case like this, consider reaching out to the Aurelia team.

By exploring these advanced scenarios, you can harness the full potential of `switch.bind` to address complex conditional rendering needs in your Aurelia applications. Remember to adhere to the guidelines and limitations to ensure proper functionality and maintainability.
