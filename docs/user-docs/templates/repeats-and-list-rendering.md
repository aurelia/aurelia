---
description: >-
  Learn how to work with collections of data like arrays and maps. The
  repeat.for functionality allows you to loop over collections of data and work
  with their contents similar to a Javascript for loop.
---

# List Rendering

Aurelia’s templating system offers a robust way to work with collections—be they arrays, sets, maps, or even ranges. The `repeat.for` binding provides a declarative approach to iterating over data, creating scopes for each iteration, and optimizing DOM updates. This guide explains the intricacies of list rendering in detail.

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

When working with dynamic collections, it’s crucial to minimize unnecessary DOM operations. Aurelia allows you to specify a unique key for each item in the collection. This key helps the framework:
- **Track Changes:** By comparing key values, Aurelia can identify which items have been added, removed, or reordered.
- **Optimize Updates:** Only the modified elements are updated, preserving performance.
- **Maintain State:** DOM elements (e.g., with user input or focus) retain their state even if their order changes.

### Syntax Examples

You can declare the key using either literal or binding syntax:

```html
<!-- Literal syntax -->
<ul>
  <li repeat.for="item of items; key: id">
    ${item.name}
  </li>
</ul>

<!-- Bound syntax -->
<ul>
  <li repeat.for="item of items; key.bind: item.id">
    ${item.name}
  </li>
</ul>
```

**Guidelines for Keys:**
- **Uniqueness:** Use a property that uniquely identifies each item (like an `id`).
- **Stability:** Avoid using array indices if the collection order can change.

## Contextual Properties in Repeats

Inside a `repeat.for` block, Aurelia exposes several contextual properties that give you more control over the rendering logic:

- **`$index`**: The zero-based index of the current iteration.
- **`$first`**: A boolean that is `true` on the first iteration.
- **`$last`**: A boolean that is `true` on the final iteration.
- **`$even` / `$odd`**: Flags indicating whether the current index is even or odd, which is useful for styling alternating rows.
- **`$length`**: The total number of items in the collection.
- **`$parent`**: A reference to the parent binding context. This is especially useful in nested repeaters.

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

For nested repeats, you can access the outer scope with `$parent`:

```html
<ul>
  <li repeat.for="item of items">
    Outer index: ${$parent.$index}
  </li>
</ul>
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

> **Note:** Aurelia tracks changes in arrays when you use array methods like `push`, `pop`, or `splice`. Direct assignments (e.g., `array[index] = value`) won’t trigger change detection.

## Generating Ranges

`repeat.for` isn’t limited to collections—it can also generate a sequence of numbers. For instance, to create a countdown:

```html
<p repeat.for="i of 10">
  ${10 - i}
</p>
<p>Blast Off!</p>
```

This iterates 10 times and computes `10 - i` on each pass.

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

Aurelia’s repeat system is extensible. If you need to iterate over non-standard collections (like HTMLCollections, NodeLists, or FileLists), you can create a custom repeat handler by implementing the `IRepeatableHandler` interface.

### Custom Handler Example

```typescript
import Aurelia, { Registration, IRepeatableHandler } from 'aurelia';

class ArrayLikeHandler implements IRepeatableHandler {
  static register(container) {
    Registration.singleton(IRepeatableHandler, ArrayLikeHandler).register(container);
  }

  handles(value: any): boolean {
    return 'length' in value && typeof value.length === 'number';
  }

  iterate(items: any, callback: (item: any, index: number) => void): void {
    for (let i = 0, len = items.length; i < len; i++) {
      callback(items[i], i);
    }
  }
}

Aurelia.register(
  ArrayLikeHandler,
  // other registrations
).app(MyApp).start();
```

> **Tip:** Aurelia provides a default `ArrayLikeHandler` you can import directly:
> ```typescript
> import Aurelia, { ArrayLikeHandler } from 'aurelia';
> ```

### Custom Handler Resolver

If you need to override the default order in which Aurelia selects a repeat handler, you can implement your own `IRepeatableHandlerResolver`:

```typescript
class MyRepeatableHandlerResolver {
  resolve(value: any) {
    if (typeof value?.length === 'number') {
      return {
        iterate(items, callback) {
          for (let i = 0; i < items.length; ++i) {
            callback(items[i], i, items);
          }
        }
      };
    }
    throw new Error('The repeater supports only array-like objects.');
  }
}
```

This custom resolver can redefine how different collection types are handled by the repeater.

## Summary

Aurelia 2’s list rendering capabilities are both powerful and flexible:
- **Versatile Iteration:** Work with arrays, sets, maps, ranges, and even objects (via converters).
- **Efficient Updates:** Use keyed iteration to minimize DOM changes.
- **Contextual Data:** Access properties like `$index`, `$first`, `$last`, `$even`, `$odd`, `$length`, and `$parent` for richer templates.
- **Extensibility:** Create custom handlers and resolvers to support any iterable data structure.

Mastering these features enables you to build dynamic, efficient UIs that handle complex data sets with ease.
