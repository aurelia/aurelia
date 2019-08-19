# Rendering Collections

In most applications, your model is not only composed of objects, but also of various types of collections. Aurelia provides a robust way to handle collection data through its built-in `repeat` attribute. Repeaters can be used on any element, including custom elements and template elements too!

> Here's what you'll learn...
> * Rendering JavaScript Arrays.
> * Rendering JavaScript Sets.
> * Rendering JavaScript Maps.
> * Working with number ranges and Object keys.
> * Special properties available in loops.

## Arrays

Aurelia is able to repeat elements for each item in an array. Let's look at a basic example:

```JavaScript repeater-template.js
export class RepeaterTemplate {
  constructor() {
    this.friends = [
      'Alice',
      'Bob',
      'Carol',
      'Dana'
    ];
  }
}
```

```HTML repeater-template.html
<h1>My Friends</h1>
<p repeat.for="friend of friends">Hello, ${friend}!</p>
```

This template allows us to list out our friends and greet them one by one, rather than attempting to greet all 7 billion
inhabitants of the world at once. Notice that `for="friend of friends"` bears a strong resemblance to the JavaScript equivalent `for(let friend of friends)`. Aurelia matches JavaScript syntax in its templates as much as possible, while still maintaining compatibility with the HTML standard.

As mentioned above, we can also use the template element as our repeater so that a "container" is not needed.

```HTML repeater-template.html
<h1>My Friends</h1>
<template repeat.for="friend of friends">
  Hello, ${friend}!
</template>
```

> Warning
> If the remplate is the first element in our view, we have to wrap our entire view in a `<template>` element as well so Aurelia can clearly differentiate from the view itself and its content.

Aurelia will observe your array for changes and update the DOM efficiently. However, it will not be able to observe changes to arrays using the `array[index] = value` syntax. To ensure that Aurelia can observe the changes on your array, make use of the Array methods: `Array.prototype.push`, `Array.prototype.pop` and `Array.prototype.splice`. Additionally, two-way binding that changes the value at an index (rather than the property of a value at an index) requires a special syntax due to the nature of the `for-of` loop in JavaScript. Do not use `repeat.for="item of dataArray"` if you intend to update arrays by index; doing so will result in one-way binding only - values typed into an input will not be bound back. Instead use the following syntax:

```HTML repeater-template-input.html
<div repeat.for="i of dataArray.length">
  <input type="text" value.bind="$parent.dataArray[i]">
</div>
```

### Range

We can also iterate over a numeric range:

```HTML repeater-template.html
<p repeat.for="i of 10">${10-i}</p>
<p>Blast off!</p>
```

Note that the range will start at 0 with a length of 10, so our countdown really does start at 10 and end at 1 before blast off.

## Sets

We can also use an ES2015 Set in the same way as an Array:

```JavaScript repeater-template.js
export class RepeaterTemplate {
  constructor() {
    this.friends = new Set();
    this.friends.add('Alice');
    this.friends.add('Bob');
    this.friends.add('Carol');
    this.friends.add('Dana');
  }
}
```

```HTML repeater-template.html
<p repeat.for="friend of friends">Hello, ${friend}!</p>
```

## Maps

One of the more useful iterables is the Map, because you can decompose the key and value into two variables directly in the repeater. Although you can repeat over objects in a straight forward way, Maps can be two-way bound much more easily than Objects, so you should try to use Maps where possible.

```JavaScript repeater-template.js
export class RepeaterTemplate {
  constructor() {
    this.friends = new Map();
    this.friends.set('Hello', { name : 'Alice' });
    this.friends.set('Hola', { name : 'Bob' });
    this.friends.set('Ni Hao', { name : 'Carol' });
    this.friends.set('Molo', { name : 'Dana' });
  }
}
```

```HTML repeater-template.html
<p repeat.for="[greeting, friend] of friends">${greeting}, ${friend.name}!</p>
```

One thing to notice in the example above is the dereference operator in `[greeting, friend]` - which breaks apart the map's key-value pair into `greeting`, the key, and `friend`, the value. Note that because all of our values are objects with the `name` property set, we can get our friend's name with `\${friend.name}`, just like in standard JavaScript!

## Object Keys

Let's do the same thing, except with a traditional JavaScript object in our view-model:

```JavaScript repeater-template.js
export class RepeaterTemplate {
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

```HTML repeater-template.html
<p repeat.for="greeting of friends | keys">${greeting}, ${friends[greeting].name}!</p>
```

We just introduced something called a "value converter". Basically, we take the object in our view model, `friends`, and run it through our `keys` value converter. Aurelia looks for a class named `KeysValueConverter` and tries to call its `toView()` method with our `friends` object. That method returns an array of keys, which we can iterate. In a pinch, we can use this to iterate over Objects.

A common question pops up here: Why can't we just dereference the object into `[key, value]` like we did with Maps? The short answer is that JavaScript objects aren't iterable in the same way that Arrays, Maps, and Sets are. So in order to iterate over JavaScript objects, we have to transform them into something that is iterable. The way you approach it will change based on what exactly you want to do with that object.

## Contextual Properties

The binding system makes several special properties available for binding in templates.

### General

* `$this` - The binding context (the view-model).

### Event

* `$event` - The DOM Event in `delegate`, `trigger`, and `capture` bindings.

### Repeater

* `$index` - In a repeat template, the index of the item in the collection.
* `$first` - In a repeat template, is true if the item is the first item in the array.
* `$last` - In a repeat template, is true if the item is the last item in the array.
* `$even` - In a repeat template, is true if the item has an even numbered index.
* `$odd` - In a repeat template, is true if the item has an odd numbered index.
* `$parent` - Explicitly accesses the outer scope from within a `repeat` or `compose` template. You may need this when a property on the current scope masks a property on the outer scope. Chainable, eg. `$parent.$parent.foo` is supported.
