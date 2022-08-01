# Built-in template features

This topic demonstrates how to work with Aurelia's built-in template commands which allow you to conditionally show and hide content, loop over collections of content, conditional rendering using switch/case syntax in your views and a trove of other built-in template features.

{% hint style="info" %}
Even though mentioned as built-in, the features here are implemented using the extensible core APIs. They can be used as examples of how to build your own equivalent features.
{% endhint %}

## Conditionally add and remove elements using if.bind

You can add or remove an element by specifying an `if.bind` on an element and passing in a true or false value.

When `if.bind` is passed `false` Aurelia will remove the element all of its children from the view. When an element is removed, if it is a custom element or has any events associated with it, they will be cleaned up, thus freeing up memory and other resources they were using.

In the following example, we are passing a value called `isLoading` which is populated whenever something is loading from the server. We will use it to show a loading message in our view.

```markup
<div if.bind="isLoading">Loading...</div>
```

When `isLoading` is a truthy value, the element will be displayed and added to the DOM. When `isLoading` is falsy, the element will be removed from the DOM, disposing of any events or child components inside of it.

By default, the `if.bind` feature will cache the view-model/view of the element you are using `if.bind` on. Not being aware of this default behavior can lead to confusing situations where the previous state is retained, especially on custom elements.

You can opt out of caching if this becomes a problem by using verbose `if.bind` syntax.

```html
<some-element if="value.bind: showThis; cache: false"></some-element>
```

When using the verbose syntax, `value.bind` is the boolean condition that triggers your `if.bind` condition and `cache: false` is what disables the cache. Only disable the cache if it becomes a problem.

{% hint style="warning" %}
Be careful. Using if.bind takes your markup out of the flow of the page. There is causes both reflow and repaint events in the browser, which can be intensive for large applications with a lot of markup.
{% endhint %}

## Conditionally show and hide elements using show.bind

You can conditionally show or hide an element by specifying a `show.bind` and passing in a true or false value.

When `show.bind` is passed `false` the element will be hidden, but unlike `if.bind` it will not be removed from the DOM. Any resources, events or bindings will remain. It's the equivalent of `display: none;` in CSS, the element is hidden, but not removed.

In the following example, we are passing a value called `isLoading` which is populated whenever something is loading from the server. We will use it to show a loading message in our view.

```markup
<div show.bind="isLoading">Loading...</div>
```

When `isLoading` is a truthy value, the element will be visible. When `isLoading` is falsy, the element will be hidden, but remain in the view.

## Switch/case statements in templates using switch.bind

In Javascript, we have the ability to use `switch/case` statements that act as neater `if` statements. We can use `switch.bind` to achieve the same thing within our templates.

```markup
<p switch.bind="selectedAction">
  <span case="mask">You are more protected from aerosol particles, and others are protected from you.</span>
  <span case="sanitizer">You are making sure viruses won't be spread easily.</span>
  <span case="wash">You are helping eliminate the virus.</span>
  <span case="all">You are protecting yourself and the people around you. You rock!</span>
  <span default-case>Unknown.</span>
</p>
```

The `switch.bind` controller will watch the bound value, which in our case is `selectedAction` and when it changes, match it against our case values. It is important to note that this will add and remove elements from the DOM like the `if.bind` does.

In the above example, you can see that we denote the container element where we use `switch.bind` followed by `case` with the value to match on. At the end, we have `default-case` which will be displayed if the provided value does not match any of the case values.

## Working with promises in templates using promise.bind

When working with promises in Aurelia, previously in version 1 you had to resolve them in your view model and then pass the values to your view templates. It worked, but it meant you had to write code to handle those promise requests. In Aurelia 2 we can work with promises directly inside of our templates.

The `promise.bind` template controller allows you to use `then`, `pending` and `catch` in your views removing unnecessary boilerplate.

### A basic example

The promise binding is intuitive, allowing you to use attributes to bind to steps of the promise resolution process from initialization (pending, to resolve and errors).

```html
<div promise.bind="promise1">
 <template pending>The promise is not yet settled.</template>
 <template then.from-view="data">The promise is resolved with ${data}.</template>         <!-- grab the resolved value -->
 <template catch.from-view="err">This promise is rejected with ${err.message}.</template> <!-- grab the rejection reason -->
</div>

<div promise.bind="promise2">
 <template pending>The promise is not yet settled.</template>
 <template then>The promise is resolved.</template>
 <template catch>This promise is rejected.</template>
</div
```

### Promise binding using functions

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
```
export class MyApp {
  fetchAdvice() {
    return fetch("https://api.adviceslip.com/advice")
      .then(r => r.ok ? r.json() : (() => { throw new Error('Unable to fetch NASA APOD data') }))
  }
}
```
{% endtab %}
{% endtabs %}

{% hint style="info" %}
The parameter `i` passed to the method `fetchAdvice()` call in the template is for refreshing binding purposes. It is not used in the method itself. This is because method calls in Aurelia are considered pure, and will only called again if any of its parameter has changes.
{% endhint %}

### Promise bind scope

The `promise` template controller creates its own scope. This prevents accidentally polluting the parent scope or the view model where this template controller is used. Let's see an example to understand what it means.

```html
<div promise.bind="promise">
 <foo-bar then.from-view="data" foo-data.bind="data"></foo-bar>
 <fizz-buzz catch.from-view="err" fizz-err.bind="err"></fizz-buzz>
</div>
```

In the example above, we are storing the resolved value from the promise in the `data` property, and then passing the value to the `foo-bar` custom element by binding the `foo-data` property.&#x20;

This is useful when we need the data only in view for passing from one component to another custom element, as it does not pollute the underlying view model. Note that this does not make any difference in terms of data binding or change observation. However, when we do need to access the settled data inside the view model, we can use the `$parent.data` or `$parent.err` as shown in the example below.

### Nested promise bindings

If you have a promise inside of a promise (promise-ception) you can nest promise controllers in your markup.

```html
<template promise.bind="fetchPromise">
 <template pending>Fetching...</template>
 <template then.from-view="response" promise.bind="response.json()">
   <template then.from-view="data">${data}</template>
   <template catch>Deserialization error</template>
 </template>
 <template catch.from-view="err2">Cannot fetch</template>
</template>
```

### Using promise bindings inside of a [repeat.for](./repeats-and-list-rendering.md)

Due to the way the scoping and binding context resolution works, you might want to use a `let` binding when using the `promise` inside `repeat.for`.

```html
<let items.bind="[[42, true], ['foo-bar', false], ['forty-two', true], ['fizz-bazz', false]]"></let>
<template repeat.for="item of items">
  <template promise.bind="item[0] | promisify:item[1]">
    <let data.bind="null" err.bind="null"></let>
    <span then.from-view="data">${data}</span>
    <span catch.from-view="err">${err.message}</span>
  </template>
</template>
```

```typescript
import {
  valueConverter,
} from '@aurelia/runtime-html';

@valueConverter('promisify')
class Promisify {
  public toView(value: unknown, resolve: boolean = true): Promise<unknown> {
    return resolve
      ? Promise.resolve(value)
      : Promise.reject(new Error(String(value)));
  }
}
```

The above example shows usage involving `repeat.for` chained with a `promisify` value converter. The value converter converts a simple value to a resolving or rejecting promise depending on the second boolean value passed to it. The value converter in itself is not that important for this discussion. It is used to construct a `repeat.for`, `promise` combination easily.

The important thing to note here is the usage of `let` binding that forces the creation of two properties, namely `data` and `err`, in the override context which gets higher precedence while binding.&#x20;

Without these properties in the override context, the properties get created in the binding context, which eventually gets overwritten with the second iteration of the repeat. In short, with `let` binding in place, the output looks as follows.

```html
<span>42</span>
<span>foo-bar</span>
<span>forty-two</span>
<span>fizz-bazz</span>
```
