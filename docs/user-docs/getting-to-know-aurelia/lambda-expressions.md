---
description: Remove boilerplate from your applications with template lambda expressions.
---

# Lambda Expressions

In Aurelia applications, you might eventually encounter a situation where you need to filter an array using `repeat.for` or other situations where a lambda can make your application closer to conventional Javascript.

Aurelia templates support a subset of Arrow Function syntax, allowing you to remove boilerplate and create concise applications where value converters or functions defined in your view models might have been previously used.

### Array methods with repeat.for

Most likely, one of the most common scenarios will be calling Array methods on an array you're looping over using `repeat.for`.&#x20;

Previously, to filter some array items in a repeater, you might have written something like this using a value converter:

```html
<div repeat.for="i of list | specialFilterBy">
```

While there is nothing wrong with value converters, and in some situations, they might be preferable (especially for testing), you can achieve the same thing without writing any additional code like this:

```html
<div repeat.for="i of list.filter(item => isGood(item))">
```

We are calling a callback function called `isGood` defined inside of our template to determine if the item is filtered or not.

#### Filter and Sort

{% code overflow="wrap" %}
```html
<div repeat.for="item of items.filter(x => x.selected).sort((a, b) => a.pos - b.pos)">
  ${item.name}
</div>
```
{% endcode %}

Observation-wise, Aurelia knows to only observe `selected` property of every item in `items`, as well as `pos` property of every **selected item**. This means changing the value of `selected` property of any item will result in the re-evaluation of the above expression. Changing the value of `pos` property of any **selected item** will also trigger the re-evaluation. Aurelia will also subscribe to the mutation of the array `items` to refresh this binding.

{% hint style="info" %}
**Methods on array that will create an array subscription**

* map
* filter
* includes
* indexOf
* lastIndexOf
* findIndex
* find
* flat
* flatMap
* join
* reduce
* reduceRight
* slice
* some

Methods that trigger self mutation like `sort`/`splice`/`push`/`pop`/`shift`/`unshift`/`reverse` will not result in a subsription it's unclear when and how to refresh the binding.

For sorting, it is recommended that we create a new array with `slice` before sorting: `items.slice(0).sort(...)` since `sort()` mutates the existing array and could sometimes make the outcome confusing to follow.
{% endhint %}

Like we might have inside of a value converter, you can see we use two Javascript functions `filter` and `sort` — Aurelia's lamba expression support means we can chain these functions without needing to write any code in a view-model or value converter.

### Event Callbacks

With arrow functions, we can express the following:

```html
<my-input change.call="updateValue($event)">
<my-button click.trigger="handleClick">
```

As the following:

```html
<my-input change.bind="v => updateValue(v)">
<my-button click.trigger="e => handleClick(e)">
```

As a result `.call` is being deprecated in Aurelia as the lambda expression syntax allows us to handle this in a more JavaScript way.

### Interpolation Expressions

Not only are lambda functions supported in a `repeat.for` but we can also use them in interpolation expressions.

### Map

Say you have an array of keywords for an item, and you wanted to display those as a comma-separated list. Previously, you would have used a value converter or function in your view-model to achieve this task. Now, you can do it from within your templates.

```html
${keywords.map(x => x.name).join(', ')})
```

### Reduce

Another task might be to take an array of items (say products in a cart) and then calculate the total. Once again, we might have used a value converter or computed getter for this task previously, but now we can use `reduce` in our template.

```html
<p>Total: ${items.reduce((sum, product) => sum + product.price, 0)}</p>
```

### Valid Uses

While a broad syntax for lambda expressions is supported, here is a list of valid uses.

```html
() => 42
```

```html
(a) => a
```

```html
(...a) => a[0]
```

```html
a => a
```

```html
(a, b) => `${a}${b}`
```

```html
(a, ...rest) => `${a}${rest.join('')}`
```

```
a => b => a + b
```

### Invalid Uses

The following uses of lambda expressions are not supported in Aurelia templates.

```
() => {} // no function body
```

```
(a = 42) => a // no default parameters
```

```
([a]) => a // no destructuring parameters
```

```
({a}) => a // no destructuring parameters
```
