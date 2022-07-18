# Repeats and list rendering

## `repeat.for`

We can use `repeat.for` to render lists of items based on an array, number range, sets, maps, and objects.

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

{% hint style="info" %}
Aurelia will not be able to observe changes to arrays using the `array[index] = value` syntax. To ensure that Aurelia can observe the changes on your array, make use of the Array methods: `Array.prototype.push` , `Array.prototype.pop` , and `Array.prototype.splice` .
{% endhint }

### Range Syntax:

```html
<li repeat.for="i of 10">${10 - i}</li>
<li>Blast off!</li>
```

Note that the range will start at 0 with a length of 10, so our countdown really does start at 10 and end at 1 before blast off.

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

One thing to notice in the example above is the dereference operator in `[greeting, friend]` - which breaks apart the map's key-value pair into `greeting` , the key, and `friend` , the value. Note that because all of our values are objects with the name property set, we can get our friend's name with `${friend.name}` , just as if we were getting it from JavaScript!

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

To iterate keys, we introduce a concept of a [Value Convertor](./value-converters.md). We take the object in our view model, friends, and run it through our keys value converter. Aurelia looks for a registered class named KeysValueConverter and tries to call its toView() method with our friends object. That method returns an array of keys- which we can iterate. In a pinch, we can use this to iterate over Objects.

```ts
// resources/value-convertors/keys.ts
export class KeysValueConverter {

  toView(obj): string[] {
    return Reflect.ownKeys(obj);
  }

}
```

