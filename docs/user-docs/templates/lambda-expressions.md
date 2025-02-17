---
description: Enhance your Aurelia applications by reducing boilerplate with powerful lambda expressions. This documentation provides a comprehensive guide to using lambda expressions in Aurelia templates, including examples, best practices, and performance considerations.
---

# Lambda Expressions in Aurelia Templates

Lambda expressions in Aurelia templates offer a concise and powerful approach to incorporating JavaScript-like functionality directly within your HTML. By leveraging a subset of JavaScript's arrow function syntax, Aurelia ensures your templates remain expressive, readable, and maintainable.

## Table of Contents

- [Introduction](#introduction)
- [Benefits of Lambda Expressions](#benefits-of-lambda-expressions)
- [Basic Syntax and Valid Usage](#basic-syntax-and-valid-usage)
- [Unsupported Patterns and Restrictions](#unsupported-patterns-and-restrictions)
- [Working with Array Methods](#working-with-array-methods)
  - [Filtering with `repeat.for`](#filtering-with-repeatfor)
  - [Chaining Operations: Filter, Sort, and Map](#chaining-operations-filter-sort-and-map)
- [Event Callbacks Using Lambdas](#event-callbacks-using-lambdas)
- [Interpolation Expressions](#interpolation-expressions)
- [Advanced Examples](#advanced-examples)
- [Performance Considerations and Best Practices](#performance-considerations-and-best-practices)
- [Common Pitfalls and Debugging Tips](#common-pitfalls-and-debugging-tips)
- [Frequently Asked Questions (FAQ)](#frequently-asked-questions-faq)

## Benefits of Lambda Expressions

- **Less Boilerplate:** Embed logic inline without extra view-model methods or value converters.
- **Enhanced Readability:** Express inline operations in a way that clearly reflects the intended transformation or filtering.
- **Flexibility:** Manipulate data on the fly right where it's rendered.
- **Maintainability:** Localize small bits of logic with the markup, which in certain scenarios simplifies updates and debugging.

## Basic Syntax and Valid Usage

Lambda expressions are defined using JavaScript's arrow function syntax. Supported forms include:

```html
<!-- No parameters -->
() => 42

<!-- Single parameter with parentheses omitted -->
a => a

<!-- Single parameter with explicit parentheses -->
(a) => a

<!-- With rest parameters -->
(...args) => args[0]

<!-- Multiple parameters -->
(a, b) => `${a}${b}`

<!-- Nested lambda -->
a => b => a + b
```

### Inline Expressions in Templates

You can integrate lambda expressions directly in your template expressions for filtering, transforming, or handling events:

```html
<div repeat.for="i of items.filter(item => item.active)">
  ${i.name}
</div>
```

## Unsupported Patterns and Restrictions

Aurelia supports a limited subset of the standard JavaScript arrow function syntax. The following patterns are **not supported**:

- **Block Bodies:** Only expression bodies are permitted.
  ```js
  // Invalid: Block body is not allowed
  () => { return 42; }
  ```

- **Default Parameters:** You cannot specify default values.
  ```js
  // Invalid: Default parameter syntax is not allowed
  (a = 42) => a
  ```

- **Destructuring Parameters:** Both array and object destructuring are not supported.
  ```js
  // Invalid: Destructuring parameter
  ([a]) => a
  ({a}) => a
  ```

## Working with Array Methods

Lambda expressions shine when working with array methods, especially inside `repeat.for` bindings.

### Filtering with `repeat.for`

Instead of using value converters for filtering, you can directly use lambda expressions:

```html
<div repeat.for="item of items.filter(item => item.isVisible)">
  ${item.name}
</div>
```

### Chaining Operations: Filter, Sort, and Map

You can chain multiple array operations to transform data inline:

```html
<div repeat.for="item of items
  .filter(item => item.selected)
  .sort((a, b) => a.order - b.order)">
  ${item.name}
</div>
```

> **Note:** Aurelia observes only the properties referenced in the lambda expression. In the above example, changes to `selected` and `order` will trigger re-evaluation.

{% hint style="info" %}
**Tip:** For sorting that might mutate your original array, use a non-mutating clone:
```html
<div repeat.for="item of items.filter(item => item.active).slice(0).sort((a, b) => a.order - b.order)">
  ${item.name}
</div>
```
{% endhint %}

## Event Callbacks Using Lambdas

Lambda expressions can simplify event handlers by keeping the logic in the template:

```html
<my-input change.bind="value => updateValue(value)">
<my-button click.trigger="event => handleClick(event)">
```

This inline style helps clarify what data is being passed to your handler.

## Interpolation Expressions

Lambda functions can also be used within interpolation expressions for dynamic data calculations.

### Transforming and Joining Arrays

For instance, to render a comma-separated list from an array of keywords:

```html
<p>${keywords.map(x => x.toUpperCase()).join(', ')}</p>
```

### Aggregating with Reduce

Compute aggregate values inline, such as totals or averages:

```html
<p>Total: ${cartItems.reduce((total, item) => total + item.price, 0)}</p>
```

## Advanced Examples

Here are several advanced examples showcasing the versatility of lambda expressions:

### Multiple Array Operations Combined

Perform filtering, slicing, sorting, and mapping in one chained expression:

```html
<div repeat.for="user of users.filter(u => u.active)
                              .slice(0, 10)
                              .sort((a, b) => a.name.localeCompare(b.name))">
  ${user.name}
</div>
```

### Nested Array Transformation

Flatten nested structures and dynamically generate lists:

```html
<ul>
  <li repeat.for="category of categories">
    ${category.items.map(item => item.label).join(', ')}
  </li>
</ul>
```

### Complex Event Handling

Pass additional context to event callbacks with inline lambdas:

```html
<button click.trigger="event => deleteItem(event, item.id)">
  Delete
</button>
```

### Real-time Filtering Based on User Input

Implement a dynamic filter that updates as the user types:

```html
<input type="text" value.bind="filterText" placeholder="Filter names..." />
<div repeat.for="person of people.filter(p => p.name.includes(filterText))">
  ${person.name}
</div>
```

### Elaborate Aggregation with Reduce

Calculate averages or other complex aggregates inline:

```html
<p>
  Average Rating: ${products.reduce((sum, product, index, array) =>
                      sum + product.rating / array.length, 0).toFixed(2)}
</p>
```

## Performance Considerations and Best Practices

While lambda expressions keep your templates clean, there are a few points to consider for optimal performance:

- **Observability:** Aurelia observes only the properties directly referenced in the lambda. Be sure to include all necessary properties to trigger re-evaluation.
- **Array Mutations:** Methods that mutate the array (e.g., `sort`, `splice`) won't trigger the binding update. Prefer non-mutating techniques (e.g., using `slice` before sorting).
- **Complexity:** Keep lambda expressions simple where possible. For logic that becomes too complex or involves multiple operations, consider moving it to the view-model.
- **Debugging:** Inline expressions can be harder to debug. If you encounter issues, isolating the logic in the view-model might help identify problems.

## Common Pitfalls and Debugging Tips

- **Over-Complex Expressions:** When lambda logic is too complicated, it might hinder readability and may lead to performance bottlenecks. Refactor complex logic into a dedicated view-model method if necessary.
- **Property Dependencies:** If updates to a property do not trigger a re-evaluation, confirm that the property is correctly referenced within the lambda.
- **Mutating Methods:** Since some array methods do not automatically trigger binding updates, cloning or using non-mutating methods is recommended.
