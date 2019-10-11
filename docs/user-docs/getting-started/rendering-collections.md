---
description: Display data stored in various types of JavaScript collections.
---

# Rendering Collections

In most applications, your model is not only composed of objects, but also of various types of collections. Aurelia provides a robust way to handle collection data through its built-in `repeat` attribute. Repeaters can be used on any element, including custom elements and template elements too!

{% hint style="success" %}
**Here's what you'll learn...**

* Rendering JavaScript Arrays.
* Rendering JavaScript Sets.
* Rendering JavaScript Maps.
* Working with number ranges and Object keys.
* Special, contextual properties available in loops.
{% endhint %}

## Arrays

Aurelia is able to render elements for each item in an array. Let's look at a basic example:

{% code-tabs %}
{% code-tabs-item title="my-app.html" %}
```markup
<h1>My Friends</h1>
<p repeat.for="friend of friends">Hello, ${friend}!</p>
```
{% endcode-tabs-item %}

{% code-tabs-item title="my-app.js" %}
```javascript
export class MyApp { 
  constructor() { 
    this.friends = [ 'Alice', 'Bob', 'Carol', 'Dana' ]; 
  } 
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

This template allows us to list out our friends and greet them one by one, rather than attempting to greet all 7 billion inhabitants of the world at once 🤣 Notice that `for="friend of friends"` bears a strong resemblance to the JavaScript equivalent `for(let friend of friends)`. By design, Aurelia matches JavaScript syntax in its templates as much as possible, while still maintaining compatibility with the HTML standard.

What if we need to repeat elements, but don't want an artificial container element around them? As mentioned above, we can use the template element as our repeater so that a container is not needed.

{% code-tabs %}
{% code-tabs-item title="my-app.html" %}
```markup
<h1>My Friends</h1>
<template repeat.for="friend of friends">
  <p>Hello, ${friend}!</p>
</template>
```
{% endcode-tabs-item %}
{% endcode-tabs %}

{% hint style="warning" %}
**Important**

If the template is the first element in your view, you must wrap the entire view in a `<template>` element as well so Aurelia can clearly differentiate between the view itself and its template content.
{% endhint %}

### Observation Details

Aurelia will observe your array for changes and update the DOM efficiently. However, it will not be able to observe changes that you make to arrays using the `array[index] = value` syntax. To ensure that Aurelia can adequately observe changes to your array, prefer to make use of the Array methods: `Array.prototype.push`, `Array.prototype.pop` and `Array.prototype.splice`. 

Additionally, two-way binding that changes the value at an index \(rather than the property of a value at an index\) requires a special syntax due to the nature of the `for-of` loop construct in JavaScript itself. Do not use `repeat.for="item of dataArray"` if you intend to update arrays by index; doing so will result in one-way binding only - values typed into an input will not be bound back. Instead use the following syntax:

{% code-tabs %}
{% code-tabs-item title="my-app.html" %}
```markup
<div repeat.for="i of dataArray.length">
  <input type="text" value.bind="$parent.dataArray[i]">
</div>
```
{% endcode-tabs-item %}
{% endcode-tabs %}

## Ranges

The previous example showed iterating based on array length. This is a specific example of Aurelia's more general ability to iterate over ranges. Here's an example using numeric ranges only.

{% code-tabs %}
{% code-tabs-item title="my-app.html" %}
```markup
<p repeat.for="i of 10">${10-i}</p>
<p>Blast Off!<p>
```
{% endcode-tabs-item %}
{% endcode-tabs %}

Note that the range will start at 0 with a length of 10, so our countdown really does start at 10 and end at 1 before blast off.

## Sets

Aurelia's repeater isn't limited to simple arrays and ranges. It can also work with a JavaScript `Set`. Here's a simple example showing how that works.

{% code-tabs %}
{% code-tabs-item title="my-app.html" %}
```markup
<p repeat.for="friend of friends">Hello, ${friend}!</p>
```
{% endcode-tabs-item %}

{% code-tabs-item title="my-app.js" %}
```javascript
export class MyApp {
  constructor() {
    this.friends = new Set();
    this.friends.add('Alice');
    this.friends.add('Bob');
    this.friends.add('Carol');
    this.friends.add('Dana');
  }
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

## Maps

One of the more useful iterables is the `Map`, because you can decompose the key and value into two variables directly in the repeater. Although you can repeat over objects in a straight forward way, maps can be two-way bound much more easily than objects, so you should try to use maps where possible.

{% code-tabs %}
{% code-tabs-item title="my-app.html" %}
```markup
<p repeat.for="[greeting, friend] of friends">
  ${greeting}, ${friend.name}!
</p>
```
{% endcode-tabs-item %}

{% code-tabs-item title="my-app.js" %}
```javascript
export class MyApp {
  constructor() {
    this.friends = new Map();
    this.friends.set('Hello', { name : 'Alice' });
    this.friends.set('Hola', { name : 'Bob' });
    this.friends.set('Ni Hao', { name : 'Carol' });
    this.friends.set('Molo', { name : 'Dana' });
  }
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

One thing to notice in the example above is the dereference operator in `[greeting, friend]` - which breaks apart the map's key-value pair into `greeting`, the key, and `friend`, the value. Note that because all of our values are objects with the `name` property set, we can get our friend's name with `${friend.name}`, just like in standard JavaScript!

## Object Keys

Let's see if we accomplish the same thing as we did with `Map`, but using a traditional JavaScript object as an associative array in our view-model.

{% code-tabs %}
{% code-tabs-item title="my-app.html" %}
```markup
<p repeat.for="greeting of friends | keys">
  ${greeting}, ${friends[greeting].name}!
</p>
```
{% endcode-tabs-item %}

{% code-tabs-item title="my-app.js" %}
```javascript
export class MyApp {
  constructor() {
    this.friends = {
      'Hello': { name : 'Alice' },
      'Hola': { name : 'Bob' },
      'Ni Hao': { name : 'Carol' },
      'Molo': { name : 'Dana' }
    };
  }
}

export class KeysValueConverter {
  toView(obj) {
    return Reflect.ownKeys(obj);
  }
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

In order to achieve this with plain objects, we had to introduce something called a "value converter". The binding system takes the `friends` value and pipes it through the `keys` value converter. Aurelia calls the converter's `toView()` method with our `friends` object, which returns an array of object keys that we can iterate through. In a pinch, we can use this to iterate over the object.

A common question pops up here: Why can't we just dereference the object into `[key, value]` like we can with a `Map`? The short answer is that JavaScript objects aren't iterable in the same way that Arrays, Maps, and Sets are. So in order to iterate over JavaScript objects, we have to transform them into something that is iterable. The way you approach it will change based on what exactly you want to do with that object.

{% hint style="info" %}
**Value Converters**

Value Converters are a powerful part of Aurelia's binding language that you can plug into to transform data to and from the view. You can learn more about building your own value converters as well as leveraging built-in converters in [Transforming Data with Value Converters](../app-basics/transforming-data-with-value-converters.md).
{% endhint %}

## Contextual Properties

Aurelia's binding engine makes several special properties available to you in your binding expressions. Some properties are available everywhere, while others are only available in a particular context. Below is a brief summary of the available contextual properties within repeats.

* `$index` - In a repeat template, the index of the item in the collection.
* `$first` - In a repeat template, is `true` if the item is the first item in the array.
* `$last` - In a repeat template, is `true` if the item is the last item in the array.
* `$even` - In a repeat template, is `true` if the item has an even numbered index.
* `$odd` - In a repeat template, is `true` if the item has an odd numbered index.
* `$length` - In a repeat template, this indicates the length of the collection.
* `$parent` - Explicitly accesses the outer scope from within a `repeat` template. You may need this when a property on the current scope masks a property on the outer scope. Note that this property is chainable, e.g. `$parent.$parent.foo` is supported.

