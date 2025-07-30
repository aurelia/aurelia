---
description: >-
  Learn how to work with collections of data like arrays and maps. The
  repeat.for functionality allows you to loop over collections of data and work
  with their contents similar to a Javascript for loop.
---

# List Rendering

The `repeat.for` binding iterates over collections to render lists of data. It works with arrays, sets, maps, and ranges, creating a template instance for each item.

## The `repeat.for` Binding

At its core, `repeat.for` acts like a template-based `for...of` loop. It iterates over a collection and creates a new rendering context for each item. For example:

```html
<ul>
  <li repeat.for="item of items">
    ${item.name}
  </li>
</ul>
```

This snippet tells Aurelia to:
- Loop over each element in the `items` collection.
- Assign the current element to a local variable named `item`.
- Render the element (here, displaying `item.name`) for each iteration.

**JavaScript Analogy:**

```js
for (let item of items) {
  console.log(item.name);
}
```

## Keyed Iteration for Efficient DOM Updates

When working with dynamic collections, you can specify a unique key for each item to optimize DOM updates. Aurelia uses keys to:
- Track which items have been added, removed, or reordered
- Only update modified elements instead of recreating all DOM nodes
- Preserve DOM state (like focus or form input values) when items move

### Key Syntax

```html
<!-- Using a property as the key -->
<ul>
  <li repeat.for="item of items; key.bind: item.id">
    ${item.name}
  </li>
</ul>

<!-- Using a literal property name -->
<ul>
  <li repeat.for="item of items; key: id">
    ${item.name}
  </li>
</ul>
```

Use unique, stable identifiers as keys. Avoid array indices if the collection order can change.

## Contextual Properties

Inside a `repeat.for` block, these contextual properties are available:

- `$index` - Zero-based index of the current item
- `$first` - True for the first item
- `$last` - True for the last item  
- `$even` / `$odd` - True for even/odd indices
- `$length` - Total number of items
- `$parent` - Reference to the parent binding context

### Example Usage

```html
<ul>
  <li repeat.for="item of items">
    Index: ${$index} — Name: ${item.name} <br>
    Is first? ${$first} | Is last? ${$last} <br>
    Even? ${$even} | Odd? ${$odd} <br>
    Total items: ${$length}
  </li>
</ul>
```

Access parent context in nested repeats:

```html
<div repeat.for="category of categories">
  <div repeat.for="item of category.items">
    Category ${$parent.$index}, Item ${$index}: ${item.name}
  </div>
</div>
```

## Working with Arrays

Arrays are the most common data source for repeats. Here’s an example component and its template:

**Component (my-component.ts):**

```typescript
export class MyComponent {
  items = [
    { name: 'John' },
    { name: 'Bill' }
  ];
}
```

**Template (my-component.html):**

```html
<ul>
  <li repeat.for="item of items">
    ${item.name}
  </li>
</ul>
```

Aurelia tracks array changes when you use methods like `push`, `pop`, or `splice`. Direct index assignments won't trigger updates.

## Generating Ranges

`repeat.for` can generate a sequence of numbers by specifying a number:

```html
<p repeat.for="i of 5">
  Item ${i}
</p>
```

This creates 5 paragraphs with `i` ranging from 0 to 4.

## Iterating Sets

Sets are handled much like arrays. The syntax remains the same, though the underlying collection is a `Set`.

**Component (repeater-template.ts):**

```typescript
export class RepeaterTemplate {
  friends: Set<string> = new Set(['Alice', 'Bob', 'Carol', 'Dana']);
}
```

**Template (repeater-template.html):**

```html
<template>
  <p repeat.for="friend of friends">
    Hello, ${friend}!
  </p>
</template>
```

## Iterating Maps

Maps offer a powerful way to iterate key-value pairs. Aurelia lets you deconstruct the map entry directly in the template.

**Component (repeater-template.ts):**

```typescript
export class RepeaterTemplate {
  friends = new Map([
    ['Hello', { name: 'Alice' }],
    ['Hola', { name: 'Bob' }],
    ['Ni Hao', { name: 'Carol' }],
    ['Molo', { name: 'Dana' }]
  ]);
}
```

**Template (repeater-template.html):**

```html
<p repeat.for="[greeting, friend] of friends">
  ${greeting}, ${friend.name}!
</p>
```

Here, `[greeting, friend]` splits each map entry so you can access both the key (greeting) and value (friend).

## Iterating Objects via Value Converters

Objects aren’t directly iterable in Aurelia. To iterate over an object’s properties, convert it into an iterable format using a value converter.

### Creating a Keys Value Converter

```typescript
// resources/value-converters/keys.ts
export class KeysValueConverter {
  toView(obj: object): string[] {
    return Reflect.ownKeys(obj) as string[];
  }
}
```

### Using the Converter in a Template

```html
<import from="resources/value-converters/keys"></import>

<p repeat.for="key of friends | keys">
  ${key}, ${friends[key].name}!
</p>
```

The `keys` converter transforms the object into an array of its keys, making it iterable by `repeat.for`.

## Custom Collection Handling with Repeat Handlers

Aurelia's repeat system is extensible. You can create custom repeat handlers for non-standard collections by implementing the `IRepeatableHandler` interface.

### Custom Handler Example

```typescript
import { IRepeatableHandler } from 'aurelia';

class ArrayLikeHandler implements IRepeatableHandler {
  handles(value: unknown): boolean {
    return typeof value === 'object' && value !== null && 'length' in value;
  }

  iterate(value: ArrayLike<unknown>, func: (item: unknown, index: number, collection: ArrayLike<unknown>) => void): void {
    for (let i = 0; i < value.length; i++) {
      func(value[i], i, value);
    }
  }
}
```

Register your handler during application configuration:

```typescript
import { Registration } from 'aurelia';

Aurelia.register(
  Registration.singleton(IRepeatableHandler, ArrayLikeHandler)
).app(MyApp).start();
```

## Summary

The `repeat.for` binding supports arrays, sets, maps, ranges, and custom collections. Use keyed iteration for optimal performance, and leverage contextual properties like `$index`, `$first`, and `$parent` when needed.
