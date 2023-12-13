# Template Promises

Aurelia 2 enhances the handling of promises within templates. Unlike Aurelia 1, where promises had to be resolved in the view model before passing their values to templates, Aurelia 2 allows direct interaction with promises in templates. This is achieved through the `promise.bind` template controller, which supports `then`, `pending`, and `catch` states, reducing the need for boilerplate code.

The `promise.bind` template controller allows you to use `then`, `pending` and `catch` in your view, removing unnecessary boilerplate.

## Basic Example

The promise binding simplifies working with asynchronous data. It allows attributes to bind to various states of a promise: pending, resolved, and rejected.

```html
<div promise.bind="promise1">
 <template pending>The promise is not yet settled.</template>
 <template then.from-view="data">The promise is resolved with ${data}.</template>
 <template catch.from-view="err">This promise is rejected with ${err.message}.</template>
</div>

<div promise.bind="promise2">
 <template pending>The promise is not yet settled.</template>
 <template then>The promise is resolved.</template>
 <template catch>This promise is rejected.</template>
</div>
```

## Promise Binding Using Functions

The following example demonstrates a method fetchAdvice bound to the `promise.bind` attribute. It uses `then.from-view` and `catch.from-view` to handle resolved data and errors.

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
    Cannot get advice, error: ${err}
    <button click.trigger="i = i+1">try again</button>
  </span>
</div>
```
{% endtab %}

{% tab title="my-app.ts" %}
```typescript
export class MyApp {
  fetchAdvice() {
    return fetch(
        "https://api.adviceslip.com/advice",
        {
          // This is not directly related to promise template controller.
          // This is simply to ensure that the example demonstrates the
          // change in data in every browser, without any confusion.
          cache: 'no-store'
        }
      )
      .then(r => r.ok
        ? r.json()
        : (() => { throw new Error('Unable to fetch NASA APOD data') })
      )
  }
}
```
{% endtab %}
{% endtabs %}

{% hint style="info" %}
The `i` variable triggers a method call in the template, as Aurelia considers method calls pure and re-invokes them only if their parameters change.
{% endhint %}

This example can also be seen in action below.

{% embed url="https://stackblitz.com/edit/au2-promise-binding-using-functions?ctl=1&embed=1&file=src/my-app.ts" %}

## Promise Bind Scope

The `promise` template controller operates within its own scope, preventing accidental pollution of the parent scope or view model.

```html
<div promise.bind="promise">
 <foo-bar then.from-view="data" foo-data.bind="data"></foo-bar>
 <fizz-buzz catch.from-view="err" fizz-err.bind="err"></fizz-buzz>
</div>
```

In this example, `data` and `err` are scoped within the promise controller. To access these values in the view model, use `$parent.data` or `$parent.err`.

## Nested Promise Bindings

Aurelia 2 supports nested promise bindings, allowing you to handle promises returned by other promises.

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

## Promise Bindings with [repeat.for](repeats-and-list-rendering.md)

When using `promise.bind` within a `repeat.for`, it's recommended to use a `let` binding to create a scoped context.

```HTML
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
import { valueConverter } from '@aurelia/runtime-html';

@valueConverter('promisify')
class Promisify {
  public toView(value: unknown, resolve: boolean = true): Promise<unknown> {
    return resolve ? Promise.resolve(value) : Promise.reject(new Error(String(value)));
  }
}
```

The above example shows usage involving `repeat.for` chained with a `promisify` value converter. Depending on the second boolean value, the value converter converts a simple value to a resolving or rejecting promise. The value converter in itself is not that important for this discussion. It is used to construct a `repeat.for`, `promise` combination easily.

The important thing to note here is the usage of `let` binding that forces the creation of two properties, namely `data` and `err`, in the overriding context, which gets higher precedence while binding.

Without these properties in the overriding context, the properties get created in the binding context, which eventually gets overwritten with the second iteration of the repeat. In short, with `let` binding in place, the output looks as follows.

```html
<span>42</span>
<span>foo-bar</span>
<span>forty-two</span>
<span>fizz-bazz</span>
```
