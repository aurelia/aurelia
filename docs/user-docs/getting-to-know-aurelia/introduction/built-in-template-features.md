# Built-in template features

This topic demonstrates how to work with Aurelia's built-in template commands which allow you to conditionally show and hide content, loop over collections of content, conditional rendering using switch/case syntax in your views and a trove of other built-in template features.

## Adding or removing an element using if.bind

You can add or remove an element by specifying an `if.bind` on an element and passing in a true or false value.

When `if.bind` is passed `false` Aurelia will remove the element all of its children from the view. When an element is removed, if it is a custom element or has any events associated with it, they will be cleaned up, thus freeing up memory and other resources they were using.

In the following example, we are passing a value called `isLoading` which is populated whenever something is loading from the server. We will use it to show a loading message in our view.

```markup
<div if.bind="isLoading">Loading...</div>
```

When `isLoading` is a truthy value, the element will be displayed and added to the DOM. When `isLoading` is falsy, the element will be removed from the DOM, disposing of any events or child components inside of it.

## Showing or hiding an element using show.bind

You can conditionally show or hide an element by specifying a `show.bind` and passing in a true or false value.

When `show.bind` is passed `false` the element will be hidden, but unlike `if.bind` it will not be removed from the DOM. Any resources, events or bindings will remain. It's the equivalent of `display: none;` in CSS, the element is hidden, but not removed.

In the following example, we are passing a value called `isLoading` which is populated whenever something is loading from the server. We will use it to show a loading message in our view.

```markup
<div show.bind="isLoading">Loading...</div>
```

When `isLoading` is a truthy value, the element will be visible. When `isLoading` is falsy, the element will be hidden, but remain in the view.

## Conditionally add or remove elements using switch.bind

In Javascript we have the ability to use `switch/case` statements which act as neater `if` statements. We can use `switch.bind` to achieve the same thing within our templates.

```markup
<p switch.bind="selectedAction">
  <span case="mask">You are more protected from aerosol particles, and others are protected from you.</span>
  <span case="sanitizer">You are making sure viruses won't be spreaded easily.</span>
  <span case="wash">You are helping eliminate the virus.</span>
  <span case="all">You are protecting yourself and people around you. You rock!</span>
  <span default-case>Unknown.</span>
</p>
```

The `switch.bind` controller will watch the bound value, which in our case is `selectedAction` and when it changes, match it against our case values. It is important to note that this will add and remove elements from the DOM like the `if.bind` does.

## Using promises in templates with promise.bind

When working with promises in Aurelia, previously in version 1 you had to resolve them in your view model and then pass the values to your view templates. It worked, but it meant you had to write code to handle those promise requests. In Aurelia 2 we can work with promises directly inside of our templates.

The `promise.bind` template controller allows you to use `then`, `pending` and `catch` in your views removing unnecessary boilerplate.

In the following example, notice how we have a parent `div` with the `promise.bind` binding and then a method called `fetchAdvice`? Followed by other attributes inside `then.from-view` and `catch.from-view` which handle both the resolved value as well as any errors.

Ignore the `i` variable being incremented, this is only there to make Aurelia fire off a call to our `fetchAdvice` method as it sees the parameter value has changed.

{% tabs %}
{% tab title="my-app.html" %}
```markup
<let i.bind="0"></let>

<div promise.bind="fetchAdvice(i)">
  <span pending>Fetching advice...</span>
  <span then.from-view="data">
    Advice id: ${data.slip.id}<br>
    ${data.slip.advice}
    <button click.trigger="i = i+1">try again</button>
  </span>
  <span catch.from-view="err">
    Cannot get an addvice, error: ${err}
    <button click.trigger="i = i+1">try again</button>
  </span>
</div>
```
{% endtab %}

{% tab title="my-app.ts" %}
```typescript
export class MyApp {
  fetchAdvice() {
    return fetch("https://api.adviceslip.com/advice")
      .then(r => r.ok ? r.json() : (() => { throw new Error('Unable to fetch NASA APOD data') }))
  }
}

```
{% endtab %}
{% endtabs %}

## Looping over collections with repeat.for

{% hint style="success" %}
To see live examples of `repeat.for` being used, you can consult the examples page for `repeat.for` [over here](../../reference/examples/binding-and-templating/looping-with-repeat.for.md).
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

