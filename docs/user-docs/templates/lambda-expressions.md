---
description: Master lambda expressions in Aurelia templates to write cleaner, more expressive code. Learn the supported syntax, array operations, event handling, and performance considerations with real examples from the framework's test suite.
---

# Lambda Expressions in Aurelia Templates

Lambda expressions in Aurelia templates allow you to use arrow function syntax directly in your HTML bindings. This feature enables inline data transformations, filtering, and event handling without requiring additional methods in your view models.

## Table of Contents

- [What Are Lambda Expressions?](#what-are-lambda-expressions)
- [Basic Syntax](#basic-syntax)  
- [Supported Patterns](#supported-patterns)
- [Restrictions and Limitations](#restrictions-and-limitations)
- [Array Operations](#array-operations)
- [Event Handling](#event-handling)
- [Text Interpolation](#text-interpolation)
- [Advanced Use Cases](#advanced-use-cases)
- [Performance and Best Practices](#performance-and-best-practices)
- [Common Pitfalls](#common-pitfalls)

## What Are Lambda Expressions?

Lambda expressions are arrow functions that you can write directly in Aurelia template bindings. They provide a way to perform inline data transformations, filtering, and calculations without defining separate methods in your view model.

**Key Benefits:**
- **Inline Logic:** Write simple functions directly in templates
- **Reduced Boilerplate:** Avoid creating view model methods for simple operations  
- **Better Locality:** Keep related logic close to where it's used
- **Reactive Updates:** Automatically re-evaluate when dependencies change

## Basic Syntax

Aurelia supports these arrow function patterns:

```html
<!-- No parameters -->
${(() => 42)()}

<!-- Single parameter (parentheses optional) -->
${items.map(item => item.name)}
${items.map((item) => item.name)}

<!-- Multiple parameters -->
${items.reduce((sum, item) => sum + item.price, 0)}

<!-- Rest parameters -->
${((...args) => args[0] + args[1] + args[2])(1, 2, 3)}

<!-- Nested arrow functions -->
${((a => b => a + b)(1))(2)}
```

**Real Template Usage:**
```html
<div repeat.for="item of items.filter(item => item.isActive)">
  ${item.name}
</div>
```

## Supported Patterns

Lambda expressions work in multiple binding contexts:

```html
<!-- Text interpolation -->
${items.filter(item => item.active).length}

<!-- Repeat bindings -->
<div repeat.for="user of users.sort((a, b) => a.name.localeCompare(b.name))">
  ${user.name}
</div>

<!-- Event bindings -->
<button click.trigger="() => doSomething()">Click</button>

<!-- Attribute bindings -->
<div my-attr.bind="value => transform(value)"></div>

<!-- With binding behaviors and value converters -->
<div repeat.for="item of items.filter(i => i.active) & debounce:500">
  ${item.name}
</div>
<div repeat.for="item of items.sort((a, b) => a - b) | take:10">
  ${item.name}
</div>
```

## Restrictions and Limitations

Aurelia's lambda expressions support only **expression bodies**. The following JavaScript arrow function features are **not supported**:

```html
<!-- ❌ Block bodies with curly braces -->
${items.filter(item => { return item.active; })}

<!-- ❌ Default parameters -->
${items.map((item = {}) => item.name)}

<!-- ❌ Destructuring parameters -->
${items.map(([first]) => first)}
${items.map(({name}) => name)}
```

**Error Messages:**
When you attempt to use unsupported features, you'll receive these specific error codes:
- Block bodies: `AUR0178: "arrow function with function body is not supported"`
- Default parameters: `AUR0174: "arrow function with default parameters is not supported"`  
- Destructuring: `AUR0175: "arrow function with destructuring parameters is not supported"`

## Array Operations

Lambda expressions work with all standard JavaScript array methods. Aurelia automatically observes array changes and property access within lambda expressions.

### Basic Array Operations

Lambda expressions work with all standard JavaScript array methods:

```html
<!-- Filtering -->
<div repeat.for="item of items.filter(item => item.isVisible)">
  ${item.name}
</div>

<!-- Sorting numbers -->
<div repeat.for="num of numbers.sort((a, b) => a - b)">
  ${num}
</div>

<!-- Mapping and joining -->
${items.map(item => item.name.toUpperCase()).join(', ')}

<!-- Array search methods -->
${items.find(item => item.id === selectedId)?.name}
${items.findIndex(item => item.active)}
${items.indexOf(targetValue)}
${items.lastIndexOf(targetValue)}
${items.includes(searchValue)}

<!-- Array access -->
${items.at(-1)} <!-- Last item -->

<!-- Aggregation -->
${cartItems.reduce((total, item) => total + item.price, 0)}
${cartItems.reduceRight((acc, item) => acc + item.value)}

<!-- Array tests -->
${items.every(item => item.valid)}
${items.some(item => item.hasError)}

<!-- Array transformation -->
${nested.flat()}
${items.flatMap(item => item.tags)}
${items.slice(0, 5)}
```

### Chaining Operations

Combine multiple array methods for complex transformations:

```html
<div repeat.for="product of products
  .filter(p => p.inStock && p.category === currentCategory)
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 10)">
  ${product.name} - ${product.rating}⭐
</div>
```

### Reactive Property Access

Aurelia automatically tracks property access in lambda expressions:

```html
<!-- Changes to item.visible will trigger re-evaluation -->
<div repeat.for="item of items.filter(item => item.visible)">
  ${item.name}
</div>
```

## Event Handling

Lambda expressions work with all Aurelia event bindings:

```html
<!-- Simple event handlers -->
<button click.trigger="() => count++">Increment</button>

<!-- Passing event data -->
<input input.trigger="event => search(event.target.value)">

<!-- Multiple parameters -->
<button click.trigger="event => deleteItem(event, item.id)">Delete</button>
```

**Custom Attributes with Lambdas:**
```html
<!-- Pass functions to custom attributes -->
<div validate.bind="value => value.length > 3">
  <input value.bind="inputValue">
</div>
```

## Text Interpolation

Use lambda expressions in text interpolation for inline calculations:

```html
<!-- Array transformations -->
<p>Tags: ${tags.map(tag => tag.toUpperCase()).join(', ')}</p>

<!-- Calculations -->
<p>Total: $${items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</p>

<!-- Conditional text -->
<p>Status: ${items.every(item => item.completed) ? 'All Done!' : 'In Progress'}</p>

<!-- String operations -->
<p>Names: ${users.map(u => u.name).join(' and ')}</p>
```

### Accessing Template Context

Lambda expressions can access `$this` and `$parent` for scope navigation, maintaining proper binding context:

```html
<!-- Access view model properties -->
${items.filter(item => item.userId === $this.currentUserId).length}

<!-- Access parent scope in nested contexts -->
<div with.bind="childData">
  ${items.find(item => item.id === $parent.selectedId)?.name}
</div>

<!-- Complex scope navigation -->
<div with.bind="{level: 1}">
  <div with.bind="{level: 2}">
    <div with.bind="{level: 3}">
      <!-- Access different scope levels -->
      ${(level => `Current: ${level}, Parent: ${$parent.level}, Root: ${$parent.$parent.level}`)($this.level)}
    </div>
  </div>
</div>
```

**Scope Access Patterns:**
- **`$this`**: References the current binding context (view model)
- **`$parent`**: References the parent binding context
- **`$parent.$parent`**: Chain to access higher-level scopes
- **Maintains reactivity**: Changes to referenced properties trigger updates

## Advanced Use Cases

### Nested Array Processing

Process complex nested data structures with proper scope handling:

```html
<!-- Flatten nested hierarchies -->
<div repeat.for="item of items.flatMap(x => 
  [x].concat(x.children.flatMap(y => [y].concat(y.children))))">
  ${item.name}
</div>

<!-- Access parent variables in nested operations -->
<div repeat.for="item of items.flatMap(x => 
  x.children.flatMap(y => ([x, y].concat(y.children))))">
  ${item.name}
</div>

<!-- Complex hierarchical flattening with metadata -->
<div repeat.for="item of categories.flatMap(category => 
  category.products
    .filter(p => p.active)
    .map(product => ({ ...product, categoryName: category.name })))">
  ${item.name} (${item.categoryName})
</div>
```

**Nested Processing Benefits:**
- **Maintains lexical scope**: Outer variables accessible in inner functions
- **Reactive updates**: Changes to nested properties trigger re-evaluation
- **Performance optimized**: Aurelia observes the right level of nesting

### Dynamic Search and Filtering

Create responsive search interfaces:

```html
<input value.bind="searchQuery" placeholder="Search products...">
<input value.bind="minPrice" type="number" placeholder="Min price">
<input value.bind="maxPrice" type="number" placeholder="Max price">

<div repeat.for="product of products
  .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  .filter(p => p.price >= (minPrice || 0))
  .filter(p => p.price <= (maxPrice || 999999))
  .sort((a, b) => b.rating - a.rating)">
  ${product.name} - $${product.price} (${product.rating}⭐)
</div>
```

### Immediate Invoked Arrow Functions (IIFE)

Execute functions immediately within templates using arrow function IIFE patterns:

```html
<!-- Simple IIFE -->
${(a => a)(42)}

<!-- Nested arrow functions -->
${(a => b => a + b)(1)(2)}

<!-- Rest parameters -->
${((...args) => args[0] + args[1] + args[2])(1, 2, 3)}

<!-- Complex object creation with property access -->
${(((e) => ({ a: e.value }))({ value: 'test' })).a}

<!-- Multi-step calculations -->
${((price, tax) => (price * (1 + tax)).toFixed(2))(100, 0.08)}
```

**IIFE Use Cases:**
- **Calculations**: Perform complex math without cluttering view model
- **Data transformation**: Transform values inline with specific logic
- **Scoped operations**: Execute multi-step operations in template context

## Performance and Best Practices

### Automatic Property Observation

Aurelia automatically observes properties accessed within lambda expressions:

```html
<!-- Will update when item.status or item.priority changes -->
<div repeat.for="item of items.filter(item => 
  item.status === 'active' && item.priority > 3)">
  ${item.name}
</div>
```

### Array Mutation Handling

Aurelia observes array mutations for most methods:

```html
<!-- These will automatically update when arrays change -->
${items.map(item => item.name)}           <!-- ✅ Observes array changes -->
${items.filter(item => item.active)}      <!-- ✅ Observes array changes -->
${items.reduce((sum, item) => sum + item.price, 0)}  <!-- ✅ Observes array changes -->
```

**Sorting Considerations:**
```html
<!-- ✅ Works perfectly for text interpolation -->
${items.sort((a, b) => a - b)}

<!-- ⚠️ Use slice() first for repeat.for to avoid mutation issues -->
<div repeat.for="item of items.slice().sort((a, b) => a.order - b.order)">
  ${item.name}
</div>

<!-- ⚠️ Direct sort in repeat.for can cause issues due to array mutation -->
<!-- This pattern is skipped in framework tests due to flush queue complications -->
<div repeat.for="item of items.sort((a, b) => a.order - b.order)">
  ${item.name} <!-- Can cause problems when items array is mutated -->
</div>
```

**Why slice() before sort()?**
- `sort()` mutates the original array, triggering multiple change notifications
- `slice()` creates a copy, preventing mutation conflicts with the repeater
- Ensures stable rendering when the source array changes

### Performance Guidelines

- **Keep expressions simple:** Complex logic should move to view model methods
- **Avoid deep nesting:** Limit chained operations for readability  
- **Use specific property access:** Reference specific properties for optimal observation
- **Profile when needed:** Monitor performance in large lists with complex transformations

## Common Pitfalls

### Mutation vs. Immutable Operations

```html
<!-- ❌ Problematic: sort mutates original array -->
<div repeat.for="item of items.sort((a, b) => a.name.localeCompare(b.name))">

<!-- ✅ Better: use slice() to avoid mutation -->
<div repeat.for="item of items.slice().sort((a, b) => a.name.localeCompare(b.name))">
```

### Expression Complexity

```html
<!-- ❌ Too complex for templates -->
${items.filter(item => {
  const category = categories.find(c => c.id === item.categoryId);
  return category && category.active && item.stock > 0;
})}

<!-- ✅ Move complex logic to view model -->
${getAvailableItems(items, categories)}
```

### Debugging Tips

- **Isolate expressions:** Test lambda expressions in browser console first
- **Use intermediate variables:** Break complex chains into steps in your view model
- **Check property names:** Ensure referenced properties exist and are observable
- **Verify data structure:** Confirm arrays and objects have expected shape
- **Parser state corruption:** If experiencing strange errors, check for syntax issues in other expressions that might corrupt the parser state

### Framework Implementation Notes

**AST Structure:**
- Lambda expressions compile to `ArrowFunction` AST nodes
- Support `rest` parameters via boolean flag
- Body must be an expression (`IsAssign` type)
- Parameters are stored as `BindingIdentifier[]`

**Error Codes:**
- `AUR0173`: Invalid arrow parameter list
- `AUR0174`: Default parameters not supported  
- `AUR0175`: Destructuring parameters not supported
- `AUR0176`: Rest parameter must be last
- `AUR0178`: Function body (block statements) not supported

## Summary

Lambda expressions in Aurelia templates provide a powerful way to write inline logic without cluttering your view models. They excel at array transformations, simple calculations, and event handling. Remember to:

- Use only **expression bodies** (no curly braces)
- Leverage **automatic property observation** for reactive updates
- Keep expressions **simple and readable**
- Move complex logic to **view model methods** when needed
- Use `slice()` before mutating operations like `sort()` for safety

With these guidelines, lambda expressions can significantly improve your template code's clarity and maintainability.
