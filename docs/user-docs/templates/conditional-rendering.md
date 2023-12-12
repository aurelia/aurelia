---
description: >-
  Learn about the various methods for conditionally rendering content in Aurelia 2, with detailed explanations and examples.
---

# Conditional Rendering in Aurelia 2

Conditional rendering in Aurelia 2 is a powerful feature that lets you create dynamic interfaces that respond to your application's state. By using boolean expressions, you can conditionally include or exclude parts of your view. This guide will walk you through the different techniques provided by Aurelia to manage conditional content.

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

Here, `isDataLoaded` dictates the visibility of the message. When `false`, the message is hidden; when `true`, it is shown. Since the element is not removed from the DOM, all bindings and events remain intact.

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

### Advanced Scenarios

Aurelia's `switch` mechanism is versatile and can be used in various scenarios, such as within custom elements, with `au-slot`, and even nested within other `switch` statements. It's important to note, however, that `case` must be a direct child of `switch`, and unexpected behavior may occur if this rule is not followed.

When using `switch`, you should avoid combining it with other template controllers like `if` or `repeat.for`, as this can lead to errors or unsupported usage patterns. If you encounter a use case that isn't covered by the current implementation, consider reaching out to the Aurelia team for guidance or feature requests.

By understanding and properly utilizing `if.bind`, `show.bind`, and `switch.bind`, you can create efficient, dynamic, and maintainable views in your Aurelia applications. Remember to consider performance implications and use these tools judiciously to ensure a smooth user experience.
