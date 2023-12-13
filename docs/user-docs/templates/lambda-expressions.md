---
description: Remove boilerplate from your applications with template lambda expressions.
---

# Lambda Expressions

Lambda expressions in Aurelia templates offer a concise and powerful way to include JavaScript-like functionality directly within your HTML using a subset of Arrow Function syntax. This feature enhances the expressiveness of Aurelia's templating engine, allowing for more inline, readable, and maintainable code.

## Array methods with repeat.for

One of the most common scenarios will likely be calling Array methods on an array you're looping over using `repeat.for`.

Previously, to filter some array items in a repeater, you might have written something like this using a value converter:

```html
<div repeat.for="i of list | specialFilterBy">
```

While there is nothing wrong with value converters, and in some situations, they might be preferable (especially for testing), you can achieve the same thing without writing any additional code like this:

```HTML
<div repeat.for="i of list.filter(item => isGood(item))">
```

We are calling a callback function called `isGood` defined inside our template to determine if the item is filtered.

### Filter and Sort

{% code overflow="wrap" %}
```HTML
<div repeat.for="item of items.filter(x => x.selected).sort((a, b) => a.pos - b.pos)">
  ${item.name}
</div>
```
{% endcode %}

Observation-wise, Aurelia knows only to observe `selected` property of every item in `items`, as well as `pos` property of every **selected item**. This means changing the value of `selected` property of any item will result in the re-evaluation of the above expression. Changing the value of `pos` property of any **selected item** will also trigger the re-evaluation. Aurelia will also subscribe to the mutation of the array `items` to refresh this binding.

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

Methods that trigger self-mutation like `sort`/`splice`/`push`/`pop`/`shift`/`unshift`/`reverse` will not result in a subscription. It's unclear when and how to refresh the binding.

For sorting, it is recommended that we create a new array with `slice` before sorting: `items.slice(0).sort(...)` since `sort()` mutates the existing array and could sometimes make the outcome confusing to follow.
{% endhint %}

As we might have inside of a value converter, we use two Javascript functions, `filter` and `sort` — Aurelia's lambda expression support means we can chain these functions without needing to write any code in a view-model or value converter.

## Event Callbacks

With arrow functions, we can express the following:

```HTML
<my-input change.call="updateValue($event)">
<my-button click.trigger="handleClick">
```

As the following:

```html
<my-input change.bind="v => updateValue(v)">
<my-button click.trigger="e => handleClick(e)">
```

As a result, `.call` is being deprecated in Aurelia as the lambda expression syntax allows us to handle this in a more JavaScript way.

## Interpolation Expressions

Not only are lambda functions supported in a `repeat.for`, but we can also use them in interpolation expressions.

### Map

Say you have an array of keywords for an item, and you want to display those as a comma-separated list. Previously, you would have used a value converter or function in your view model to achieve this task. Now, you can do it from within your templates.

```html
${keywords.map(x => x.name).join(', ')})
```

### Reduce

Another task might be to take an array of items (say, products in a cart) and then calculate the total. Once again, we might have previously used a value converter or computed getter for this task, but now we can use `reduce` in our template.

```HTML
<p>Total: ${items.reduce((sum, product) => sum + product.price, 0)}</p>
```

## Valid Uses

While a broad syntax for lambda expressions is supported, here is a list of valid uses.

```html
() => 42
```

```HTML
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

## Invalid Uses

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

## Examples

Now we understand what lambda expressions are and how they can be used, here are some examples of how you might leverage them in your Aurelia applications.

### Inline Array Transformation and Display

Transform and display an array of objects inline, such as a list of names.

```html
<p>Attendees: ${attendees.map(a => a.name.toUpperCase()).join(', ')}</p>
```

### Complex Object Filtering

Use lambda expressions for complex filtering, such as filtering based on multiple object properties.

```html
<div repeat.for="person of people.filter(p => p.age > 18 && p.city === 'New York')">
  ${person.name}
</div>
```

### Event Handling with Additional Context

Handle events with additional context passed to the event handler.

```html
<button click.trigger="event => deleteItem(event, item.id)">Delete</button>
```

### Nested Array Operations

Perform operations on nested arrays, such as displaying a flattened list of sub-items.

```html
<ul>
  <li repeat.for="category of categories">
    ${category.items.flatMap(item => item.subItems).join(', ')}
  </li>
</ul>
```

### Combining Multiple Array Methods

Chain multiple array methods for data processing.

```html
<div repeat.for="user of users.filter(u => u.isActive).slice(0, 10).sort((a, b) => a.name.localeCompare(b.name))">
  ${user.name}
</div>
```

### Using Reduce for Total Calculation

Calculate the total price of items in a shopping cart.

```html
<p>Total Price: ${cartItems.reduce((total, item) => total + item.price * item.quantity, 0)}</p>
```

### Creating a Comma-Separated List

Transform an array of objects into a comma-separated list.

```html
<p>Tags: ${article.tags.map(tag => tag.name).join(', ')}</p>
```

### Calculating an Aggregate Property

Use `reduce` to calculate an aggregate property, such as the average age.

```html
<p>Average Age: ${users.reduce((total, user, index, array) => total + user.age / array.length, 0).toFixed(2)}</p>
```

### Using `includes` for Conditional Rendering

Check if an array includes a certain value and conditionally render content.

```html
<div if.bind="users.map(u => u.name).includes('John Doe')">
  John Doe is a user.
</div>
```

### Dynamic Class Assignment with `includes`

Assign a class to an element if an array includes a specific item.

```html
<div repeat.for="product of products" class="${product.tags.includes('sale') ? 'on-sale' : ''}">
  ${product.name}
</div>
```

### Finding an Item with `find`

Display details of the first item that matches a condition.

```html
<div>
  Featured Product: ${products.find(p => p.isFeatured).name}
</div>
```

### Using `find` in Event Handling

Use `find` in an event handling expression to work with a specific item.

```html
<button click.trigger="selectProduct(products.find(p => p.id === selectedProductId))">
  Select Product
</button>
```

### Nested Arrays with `flat`

Flatten a nested array and display its contents.

```html
<ul>
  <li repeat.for="item of categories.map(c => c.items).flat()">
    ${item.name}
  </li>
</ul>
```

### Displaying a Flattened List of Attributes

Use `flat` to create a flattened list of attributes from an array of objects.

```html
<p>Available Colors: ${products.map(p => p.availableColors).flat().join(', ')}</p>
```
