---
description: >-
  Learn how to work with collections of data like arrays and maps. The
  repeat.for functionality allows you to loop over collections of data and work
  with their contents similar to a Javascript for loop.
---

# List Rendering

Aurelia supports working with different types of data. Array, Set, and Map are all supported collection types that can be iterated in your templates.

## `repeat.for`

You can use the `repeat.for` binding to iterate over data collections in your templates. Think of `repeat.for` as a for loop. It can iterate arrays, maps and sets.

```html
<ul>
    <li repeat.for="item of items">${item.name}</li>
</ul>
```

**Breaking this intuitive syntax down, it works like this:**

* Loop over every item in the items array
* Store each iterative value in the local variable `item` on the left-hand side
* For each iteration, make the current item available

If you were to write the above in Javascript form, it would look like this:

```html
for (let item of items) {
    console.log(item.name);
}
```

### Keyed iteration

When working with the `repeat.for` attribute in Aurelia, the `key` attribute specifies the property that uniquely identifies each item in the collection. Aurelia uses this property to track changes in the collection and efficiently update the DOM accordingly.

To use the key attribute, add it to the repeater element and bind it to a unique property of each item in the collection. You can use either literal or expression syntax:

```html
<!-- Literal syntax -->
<ul>
  <li repeat.for="item of items; key: id">
    ${item.name}
  </li>
</ul>

<!-- Expression syntax -->
<ul>
  <li repeat.for="item of items; key.bind: item.id">
    ${item.name}
  </li>
</ul>
```

In this example, `id` is the property name Aurelia will use to uniquely identify each item in the items collection.

The key attribute serves the following purposes:

- Change Tracking: Aurelia tracks changes in the collection using the specified property. When an item is added, removed, or reordered, Aurelia compares the key property values to determine which items have changed.
- Minimal DOM Updates: Aurelia can minimize the number of DOM manipulations required when updating the rendered list by tracking changes based on the key property. It can reuse existing elements and only make necessary changes.
- Preservation of Element State: When an item's position in the collection changes, Aurelia can preserve the state of the corresponding rendered element (such as focus, scroll position, or user input) by matching the key property values.

#### Choosing the key Property
When selecting the property to use as the key, consider the following guidelines:

- The property should have unique values for each item in the collection.
- The property should be stable and not change over time for a given item.
- Avoid using the item's index as the key unless the collection is static and the order of items does not change.

Common choices for the key property include unique identifiers like ID or a combination of properties that uniquely identify an item.

The key attribute in Aurelia repeaters specifies the property that uniquely identifies each collection item. By setting the key attribute, Aurelia can track changes, update the DOM, and preserve the element state when rendering dynamic lists.

Choose a property that provides unique and stable values for each item in the collection to ensure optimal performance and avoid unwanted side effects.

### Index and Contextual properties inside of `repeat.for`

Aurelia's binding engine makes several special properties available in your binding expressions. Some properties are available everywhere, while others are only available in a particular context.

Below is a summary of the available contextual properties within repeats.

#### $index

In a repeat template, the item's index is in the collection. The index is zero-indexed, meaning the value starts from zero and increments by one for each iteration in the `repeat.for` loop. The following example `$index` will be `0` for the first iteration, then `1` and so forth.

```html
<ul>
    <li repeat.for="item of items">${$index}</li>
</ul>
```

#### $first

In a repeat template, the `$first` variable will be `true` if this is the first iteration in the `repeat.for` loop. If the iteration is not the first iteration, then this value will be `false`.

```html
<ul>
    <li repeat.for="item of items">${$first}</li>
</ul>
```

#### $last

In a repeat template the `$last` variable will be `true` if this is the last iteration in the `repeat.for` loop. This means we have reached the final item in the collection we are iterating. If the loop is continuing, this value will be `false`.

```html
<ul>
    <li repeat.for="item of items">${$last}</li>
</ul>
```

#### $even

In a repeat template the `$even` variable will be `true` if we are currently at an even-numbered index inside the `repeat.for` loop. You would use this functionality when performing conditional logic (alternate row styling on table rows and so forth).

```html
<ul>
    <li repeat.for="item of items">${$even}</li>
</ul>
```

#### $odd

In a repeat template, the `$odd` variable will be `true` if we are currently at an odd-numbered index inside the `repeat.for` loop. You would use this functionality when performing conditional logic (alternate row styling on table rows).

```html
<ul>
    <li repeat.for="item of items">${$odd}</li>
</ul>
```

#### $length

In a repeat template the `$length` variable will provide the length of the collection being iterated. This value should not change throughout iterating over the collection and represents the length of the collection akin to (Array.length).

```html
<ul>
    <li repeat.for="item of items">${$length}</li>
</ul>
```

#### $parent

Explicitly accesses the outer scope from within a `repeat.for` template. In most instances where you are dealing with the value of the collection you are iterating, the `$parent` variable will not be needed.

You may need this when a property on the current scope masks a property on the outer scope. Note that this property is chainable, e.g. `$parent.$parent.foo` is supported.

These can be accessed inside the `repeat.for`. In the following example, we display the current index value.

```html
<ul>
    <li repeat.for="item of items">${$parent.$index}</li>
</ul>
```

You would need this functionality when dealing with multiple levels of `repeat.for` aka nested repeaters. As each `repeat.for` creates its own scope, you need to use `$parent` to access the outer scope of the repeater.t

### Array Syntax

In this section, see how you can iterate an array using `repeat.for`. You will notice the syntax is the same as the examples we used above, except for a view model containing the array to show you the relationship.

{% code title="my-component.ts" %}
```typescript
class MyComponent {
  items = [
    {name: 'John'},
    {name: 'Bill'},
  ]
}
```
{% endcode %}

{% code title="my-component.html" %}
```html
<li repeat.for="item of items">${item.name}</li>
```
{% endcode %}

{% hint style="info" %}
Aurelia cannot observe changes to arrays using the `array[index] = value` syntax. To ensure that Aurelia can observe the changes on your array, use the Array methods: `Array.prototype.push`, `Array.prototype.pop`, and `Array.prototype.splice`.
{% endhint %}

### Ranges Syntax

The `repeat.for` functionality doesn't just allow you to work with collections. It can be used to generate ranges.

In the following example, we generate a range of numbers up to 10. We subtract the value from the index inside to create a reverse countdown.

```html
<p repeat.for="i of 10">${10-i}</p>
<p>Blast Off!<p>
```

### Set Syntax

The `repeat.for` functionality works with arrays (the collection type you will be using) and Javascript sets. The syntax for iterating sets is the same as for arrays, so nothing changes in the template, only the collection type you are working with.

{% code title="repeater-template.ts" %}
```typescript
export class RepeaterTemplate {
    friends: Set<string> = new Set();
    
    constructor() {
      this.friends.add('Alice');
      this.friends.add('Bob');
      this.friends.add('Carol');
      this.friends.add('Dana');
    }
}
```
{% endcode %}

{% code title="repeater-template.html" %}
```html
<template>
     <p repeat.for="friend of friends">Hello, ${friend}!</p>
</template>
```
{% endcode %}

### Map Syntax

One of the more useful iterables is the Map because you can directly decompose your key and value into two variables in the repeater. Although you can repeat over objects straightforwardly, Maps can be two-way bound easier than Objects, so you should try to use Maps where possible.

{% code title="repeater-template.ts" %}
```typescript
export class RepeaterTemplate {
    friends = new Map();
  
    constructor() {
        this.friends.set('Hello', { name: 'Alice' });
    
        this.friends.set('Hola', { name: 'Bob' });
    
        this.friends.set('Ni Hao', { name: 'Carol' });
    
        this.friends.set('Molo', { name: 'Dana' });
  }
}
```
{% endcode %}

Please take note of the syntax in our template. Unlike `repeat.for` usage for Arrays and Sets, we are decomposing the key and value (as we discussed) on the repeater itself. The syntax is still familiar but slightly different.

{% code title="repeater-template.html" %}
```html
<p repeat.for="[greeting, friend] of friends">${greeting}, ${friend.name}!</p>
```
{% endcode %}

One thing to notice in the example above is the dereference operator in `[greeting, friend]` - which breaks apart the map's key-value pair into `greeting`, the key, and `friend`, the value. Note that because all of our values are objects with the name property set, we can get our friend's name with `${friend.name}`, just as if we were getting it from JavaScript!

### Object Syntax

In Javascript, objects are not a native collection type. However, there might be situations where you want to iterate values inside of an object. Aurelia does not provide a way of doing this, so we must create a [Value Converter](value-converters.md) to transform our object into an iterable format.

{% code title="repeater-template.html" %}
```html
<p repeat.for="greeting of friends | keys">${greeting}, ${friends[greeting].name}!</p>
```
{% endcode %}

{% code title="repeater-template.ts" %}
```typescript
export class RepeaterTemplate {
  constructor() {
    this.friends = {
      'Hello':
        { name : 'Alice' },
      'Hola':
        { name : 'Bob' },
      'Ni Hao':
        { name : 'Carol' },
      'Molo':
        { name : 'Dana' }
    }
  }
}
```
{% endcode %}

#### Create a value converter

We take the object in our view model, friends, and run it through our keys value converter. Aurelia looks for a registered class named `KeysValueConverter` and tries to call its `toView()` method with our friend's object. That method returns an array of keys- which we can iterate.

```typescript
// resources/value-converters/keys.ts
export class KeysValueConverter {
  toView(obj): string[] {
    return Reflect.ownKeys(obj);
  }
}
```

Our value converter uses the Javascript `Reflect` API to get the keys of our object, returning the values in an iterable format that our `repeat.for` can understand. In our template, we import our value converter to use it.

```html
<import from="resources/value-converters/keys"></import>

<p repeat.for="greeting of friends | keys">${greeting}, ${friends[greeting].name}!</p>
```

{% hint style="info" %}
When creating utility value converters and other resources, we recommend globally registering them using Aurelia's DI. You can learn how to use Dependency Injection [here](../getting-to-know-aurelia/dependency-injection-di/).
{% endhint %}

### Custom collection handling strategy

In the previous section, we see that any object can be iterated after using a value converter to convert it into an array, or any other form that Aurelia understands how to iterate. There is another way to teach Aurelia how to iterate an object using the `IRepeatableHandler` interface.

An example of teaching Aurelia to iterate over any array like objects (HTMLCollection, NodeList, FileList etc...), is as follow:

```typescript
import Aurelia, { Registration, IRepeatableHandler } from 'aurelia';
import { MyApp } from './my-app';

class ArrayLikeHandler {
  static register(c) {
    Registration.singleton(IRepeatableHandler, ArrayLikeHandler).register(c)
  }

  handles(v) {
    return 'length' in v && v.length > 0;
  }

  iterate(items, func) {
    for (let i = 0, ii = items.length; i < ii; ++i) {
      func(items[i], i);
    }
  }
}

Aurelia
  .register(
    ArrayLikeHandler,
    ...
  )
  .app(MyApp)
  .start()
```

{% hint style="success" %}
Aurelia provide a default implementation for `ArrayLikeHandler` similar to the above code that you can import and use it like the following:

```typescript
import Aurelia, { ArrayLikeHandler } from 'aurelia';

...
```
{% endhint %}

In the above example, `ArrayLikeHandler` is registered with the key `IRepeatableHandler`, which is used by `IRepeatableHandlerResolver`.
The default implementation of `IRepeatableHandlerResolver` will search for handler by the following order:

- array
- set
- map
- number (range)
- null/undefined
- custom
- unknown (will throw an error)

If you don't want this order, you can override with your own implementation of `IRepeatableHandlerResolver`, like the following example:

```typescript
class MyRepeatableHandlerResolver {
  resolve(value) {
    if (typeof value?.length === 'number') {
      return {
        iterate(items, callback) {
          for (let i = 0; i < items.length; ++i) {
            callback(items[i], i, items);
          }
        }
      }
    }
    throw new Error('The repeater should only iterate array/array like objects');
  }
}
```
