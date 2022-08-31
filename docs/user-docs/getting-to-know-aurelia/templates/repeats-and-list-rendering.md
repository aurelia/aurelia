# Repeats and list rendering

## `repeat.for`

You can use the `repeat.for` binding to iterate over collections of data in your templates. Think of `repeat.for` as a for loop, it can iterate arrays, maps and sets.

```markup
<ul>
    <li repeat.for="item of items">${item.name}</li>
</ul>
```

Breaking this intuitive syntax down, it works like this:

* Loop over every item in the items array
* Store each iterative value in the local variable `item` on the left hand side
* For each iteration, make the current item available

If you were to write the above in Javascript form, it would look like this:

```
for (let item of items) {
    console.log(item.name);
}
```

### Index and Contextual properties inside of `repeat.for`

Aurelia's binding engine makes several special properties available to you in your binding expressions. Some properties are available everywhere, while others are only available in a particular context. Below is a brief summary of the available contextual properties within repeats.

* `$index` - In a repeat template, the index of the item in the collection.
* `$first` - In a repeat template, is `true` if the item is the first item in the array.
* `$last` - In a repeat template, is `true` if the item is the last item in the array.
* `$even` - In a repeat template, is `true` if the item has an even numbered index.
* `$odd` - In a repeat template, is `true` if the item has an odd numbered index.
* `$length` - In a repeat template, this indicates the length of the collection.
* `$parent` - Explicitly accesses the outer scope from within a `repeat` template.

You may need this when a property on the current scope masks a property on the outer scope. Note that this property is chainable, e.g. `$parent.$parent.foo` is supported.

Inside of the `repeat.for` these can be accessed. In the following example we display the current index value.

```markup
<ul>
    <li repeat.for="item of items">${$index}</li>
</ul>
```

### Array Syntax:

```ts
class MyComponent {
  items = [
    {name: 'John'},
    {name: 'Bill'},
  ]
}
```

```html
<li repeat.for="item of items">${item.name}</li>
```

Aurelia will not be able to observe changes to arrays using the \`array\[index] = value\` syntax. To ensure that Aurelia can observe the changes on your array, make use of the Array methods: \`Array.prototype.push\` , \`Array.prototype.pop\` , and \`Array.prototype.splice\` . \{% endhint }

### Ranges Syntax:

The `repeat.for` functionality doesn't just allow you to work with collections, it can be used to generate ranges.

In the following example, we generate a range of numbers to 10. We subtract the value from the index inside to create a reverse countdown.

```markup
<p repeat.for="i of 10">${10-i}</p>
<p>Blast Off!<p>
```

### Set Syntax:

```ts
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

```html
 <template>
    <p repeat.for="friend of friends">Hello, ${friend}!</p>
  </template>
```

### Map Syntax

One of the more useful iterables is the Map, because you can decompose your key and value into two variables directly in the repeater. Although you can repeat over objects straightforwardly, Maps can be two-way bound much more straightforwardly than Objects, so you should try to use Maps where possible.

```ts
export interface IFriend {
  name: string;
}

export class RepeaterTemplate {
  friends: Map<string, IFriend> = new Map();
  constructor() {
    this.friends.set('Hello',
      { name : 'Alice' });
    this.friends.set('Hola',
      { name : 'Bob' });
    this.friends.set('Ni Hao',
      { name : 'Carol' });
    this.friends.set('Molo',
      { name : 'Dana' });
  }
}
```

```html
<p repeat.for="[greeting, friend] of friends">${greeting}, ${friend.name}!</p>
```

One thing to notice in the example above is the dereference operator in `[greeting, friend]` - which breaks apart the map's key-value pair into `greeting`, the key, and `friend`, the value. Note that because all of our values are objects with the name property set, we can get our friend's name with `${friend.name}`, just as if we were getting it from JavaScript!

### Object Syntax

With objects, we can do the same thing, except with a traditional JavaScript object in our view-model:

```html
<p repeat.for="greeting of friends | keys">${greeting}, ${friends[greeting].name}!</p>
```

```ts
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

To iterate keys, we introduce a concept of a [Value Convertor](../value-converters.md). We take the object in our view model, friends, and run it through our keys value converter. Aurelia looks for a registered class named KeysValueConverter and tries to call its toView() method with our friends object. That method returns an array of keys- which we can iterate. In a pinch, we can use this to iterate over Objects.

```ts
// resources/value-convertors/keys.ts
export class KeysValueConverter {

  toView(obj): string[] {
    return Reflect.ownKeys(obj);
  }

}
```
