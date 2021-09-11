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

However, you can also destructured assignment expression.


```markup
<p repeat.for="[k,v] of map">key:${k} | value: ${v}</p>
```

### Destructured assignment declaration

The last example in the previous section is not something special for map.
In fact, you can use the destructured declaration for any kind of iterable collection.

```markup
<p repeat.for="{name, age} of personArray">${name} is ${age} years old</p>
```

You can also initialize any `undefined` or missing property in the input.

```markup
<p repeat.for="{name, age = 42} of personArray">${name} is ${age} years old</p>
```

You can even alias your destructured properties.

```markup
<p repeat.for="{name:n, age:a=42} of personArray">${n} is ${a} years old</p>
```

#### Limitation

The destructured assignment supports wide range of complex expressions.
However, the limitation of this is that the destructured inputs are not observed; i.e. mutations of any destructured property will not trigger change in the view.

Taking the following template as example, if we change the `personArray[0].name = 'foo'` post `attach`, the change won't be reflected on the view.

```markup
<p repeat.for="{name, age} of personArray">${name} is ${age} years old</p>
```

In that sense you can think the following JavaScript analogous to the example above; that is if you change the `personArray[i].name` post assignment, that change won't be propagated to the `name`;

```javascript
const {name, age} = personArray[i];
```

Note that this does not affect if the iterable collection is changed.
For the example above if the `personArray` is reassigned, the changes will be reflected as expected.

However, note that if you don't destructure an object, then the changes made in the object will be propagated to view.
Consider the following example.

```markup
<p repeat.for="[k,p] of personMap">${p.name} is ${p.age} years old</p>
```

If in the example above, we set the `personMap.get('a').name = 'foo'` post `attach`, the changes will be reflected on the view.

