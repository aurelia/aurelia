---
description: >-
  Learn about the various methods for conditionally rendering content in Aurelia 2, with detailed explanations and examples.
---

# Conditional Rendering in Aurelia 2

Conditional rendering allows you to dynamically show or hide parts of your view based on your application's state. Aurelia 2 provides three primary directives for conditional rendering, each suited for different scenarios.

## Quick Reference

| Directive | Use Case | DOM Behavior | Performance |
|-----------|----------|--------------|-------------|
| `if.bind` | Simple true/false conditions | Adds/removes elements | Best for infrequent changes |
| `show.bind` | Toggle visibility | Hides/shows elements | Best for frequent changes |
| `switch.bind` | Multiple conditions | Adds/removes elements | Best for enum-like values |

## Using `if.bind`

The `if.bind` directive conditionally adds or removes elements from the DOM based on a boolean expression. When the expression is `false`, Aurelia completely removes the element and its descendants, cleaning up resources, events, and custom elements.

### Basic Usage

```html
<div if.bind="isLoading">Loading...</div>
<div if.bind="user.isAuthenticated">Welcome back, ${user.name}!</div>
```

### If/Else Structures

Use `else` immediately after an `if.bind` element to create branching logic:

```html
<div if.bind="user.isAuthenticated">
  Welcome back, ${user.name}!
</div>
<div else>
  Please log in to continue.
</div>
```

### Caching Behavior

By default, `if.bind` caches views and view models for performance. Disable caching when you need fresh instances:

```html
<custom-element if="value.bind: canShow; cache: false"></custom-element>
```

{% hint style="warning" %}
**When to Use:** Use `if.bind` when elements change infrequently and you want to completely remove them from the DOM to save memory and improve performance.
{% endhint %}

## Using `show.bind`

The `show.bind` directive toggles element visibility without removing them from the DOM. This is equivalent to setting `display: none` in CSS.

### Basic Usage

```html
<div show.bind="isDataLoaded">Data loaded successfully!</div>
<div show.bind="!isLoading">Content is ready</div>
```

### `hide.bind` (inverse of `show.bind`)

`hide` is an alias of `show` with inverted logic:

```html
<div hide.bind="isHidden">Hidden when true</div>
```

This is equivalent to:

```html
<div show.bind="!isHidden">Hidden when true</div>
```

### When to Use show.bind vs if.bind

```html
<!-- Use show.bind for frequent toggles -->
<div show.bind="isExpanded">
  <expensive-component></expensive-component>
</div>

<!-- Use if.bind for infrequent changes -->
<admin-panel if.bind="user.isAdmin"></admin-panel>
```

{% hint style="info" %}
**When to Use:** Use `show.bind` when you need to frequently toggle visibility and want to preserve element state, bindings, and avoid re-initialization costs.
{% endhint %}

## Using `switch.bind`

The `switch.bind` directive handles multiple conditions elegantly, similar to a JavaScript switch statement. It's ideal for enum values or when you have several mutually exclusive conditions.

### Basic Usage

```typescript
// Status.ts
enum OrderStatus {
  Received   = 'received',
  Processing = 'processing',
  Dispatched = 'dispatched',
  Delivered  = 'delivered'
}
```

```html
<!-- order-status.html -->
<template switch.bind="orderStatus">
  <span case="received">Order received</span>
  <span case="processing">Processing your order</span>
  <span case="dispatched">On the way</span>
  <span case="delivered">Delivered</span>
  <span default-case>Unknown status</span>
</template>
```

### Grouping Cases

Handle multiple values with a single case:

```html
<template switch.bind="orderStatus">
  <span case.bind="['received', 'processing']">
    Order is being processed
  </span>
  <span case="dispatched">On the way</span>
  <span case="delivered">Delivered</span>
</template>
```

### Fall-Through Behavior

Enable fall-through to show multiple cases:

```html
<template switch.bind="orderStatus">
  <span case="received" fall-through="true">Order received</span>
  <span case="processing">Processing your order</span>
</template>
```

{% hint style="info" %}
Fall-through is `false` by default. Set `fall-through="true"` or `fall-through.bind="true"` to enable it.
{% endhint %}

## Advanced Techniques

### Dynamic Switch Expressions

Use computed expressions with `switch.bind`:

```html
<template repeat.for="num of numbers">
  <template switch.bind="true">
    <span case.bind="num % 15 === 0">FizzBuzz</span>
    <span case.bind="num % 3 === 0">Fizz</span>
    <span case.bind="num % 5 === 0">Buzz</span>
    <span default-case>${num}</span>
  </template>
</template>
```

### Conditional Slot Projection

Combine `switch.bind` with slots for dynamic content projection:

```html
<template as-custom-element="status-card">
  <au-slot name="content"></au-slot>
</template>

<status-card>
  <template au-slot="content" switch.bind="status">
    <div case="loading">Loading...</div>
    <div case="error">Something went wrong</div>
    <div case="success">Operation completed</div>
  </template>
</status-card>
```

### Nested Switches

Handle complex conditional logic with nested switches:

```html
<template switch.bind="userRole">
  <div case="admin">
    <template switch.bind="adminSection">
      <admin-users case="users"></admin-users>
      <admin-settings case="settings"></admin-settings>
      <admin-dashboard default-case></admin-dashboard>
    </template>
  </div>
  <user-dashboard case="user"></user-dashboard>
  <guest-welcome default-case></guest-welcome>
</template>
```

## Performance Guidelines

### Choosing the Right Directive

- **Frequent toggles**: Use `show.bind` to avoid DOM manipulation overhead
- **Infrequent changes**: Use `if.bind` to remove elements and save memory
- **Multiple conditions**: Use `switch.bind` for cleaner, more maintainable code

### Optimization Tips

```html
<!-- Good: Group related conditions -->
<template switch.bind="appState">
  <loading-screen case="loading"></loading-screen>
  <error-screen case="error"></error-screen>
  <main-content case="ready"></main-content>
</template>

<!-- Avoid: Multiple separate if statements -->
<loading-screen if.bind="appState === 'loading'"></loading-screen>
<error-screen if.bind="appState === 'error'"></error-screen>
<main-content if.bind="appState === 'ready'"></main-content>
```

## Important Restrictions

### Case Usage Rules

The `case` attribute must be a direct child of `switch.bind`:

```html
<!-- ✅ Correct -->
<template switch.bind="status">
  <span case="active">Active</span>
</template>

<!-- ❌ Incorrect: case not direct child -->
<template switch.bind="status">
  <div if.bind="someCondition">
    <span case="active">Active</span>
  </div>
</template>
```

### Default Case Placement

Place `default-case` as the last option for best practices:

```html
<template switch.bind="status">
  <span case="received">Received</span>
  <span case="processing">Processing</span>
  <span default-case>Unknown</span> <!-- Last -->
</template>
```
