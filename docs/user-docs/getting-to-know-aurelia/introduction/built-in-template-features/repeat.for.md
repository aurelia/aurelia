---
description: Working with collections of data in your views.
---

# repeat.for

{% hint style="success" %}
To see live examples of `repeat.for` being used, you can consult the examples page for `repeat.for` [over here](../../../reference/examples/binding-and-templating/looping-with-repeat.for.md).
{% endhint %}

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

```text
for (let item of items) {
    console.log(item.name);
}
```

### Creating ranges with repeat.for

The `repeat.for` functionality doesn't just allow you to work with collections, it can be used to generate ranges.

In the following example, we generate a range of numbers to 10. We subtract the value from the index inside to create a reverse countdown.

```markup
<p repeat.for="i of 10">${10-i}</p>
<p>Blast Off!<p>
```

### Getting the index \(and other contextual properties\) inside of repeat.for

Aurelia's binding engine makes several special properties available to you in your binding expressions. Some properties are available everywhere, while others are only available in a particular context. Below is a brief summary of the available contextual properties within repeats.

* `$index` - In a repeat template, the index of the item in the collection.
* `$first` - In a repeat template, is `true` if the item is the first item in the array.
* `$last` - In a repeat template, is `true` if the item is the last item in the array.
* `$even` - In a repeat template, is `true` if the item has an even numbered index.
* `$odd` - In a repeat template, is `true` if the item has an odd numbered index.
* `$length` - In a repeat template, this indicates the length of the collection.
* `$parent` - Explicitly accesses the outer scope from within a `repeat` template. You may need this when a property on the current scope masks a property on the outer scope. Note that this property is chainable, e.g. `$parent.$parent.foo` is supported.

Inside of the `repeat.for` these can be accessed. In the following example we display the current index value.

```markup
<ul>
    <li repeat.for="item of items">${$index}</li>
</ul>
```

### Iterating over a set

With `repeat.for` you can iterate over a [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) using the same syntax as shown above.

```markup
<p repeat.for="i of set">${i}</p>
```

### Iterating over a map

You can also iterate over a map using the `repeat.for`.
When iterating over a map, the declaration expression contains a pair of key and value.

```markup
<p repeat.for="pair of map">key:${pair[0]} | value: ${pair[1]}</p>
```

You can also destructure the `pair`.


```markup
<p repeat.for="[k,v] of map">key:${k} | value: ${v}</p>
```
