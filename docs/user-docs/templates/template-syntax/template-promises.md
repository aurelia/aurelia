# Template Promises (`promise.bind`)

Aurelia 2 significantly simplifies the handling of Promises directly within your templates. Unlike previous versions where promise resolution typically occurred in the view model, Aurelia 2 empowers you to manage asynchronous operations directly in the view.

This is accomplished through the `promise.bind` template controller. It intelligently manages the different states of a Promise: `pending`, `resolved` (`then`), and `rejected` (`catch`). This approach reduces boilerplate code and makes asynchronous data handling in templates more declarative and intuitive.

## Basic Usage

The `promise.bind` attribute allows you to bind a Promise to a template, rendering different content based on the Promise's current state.

```html
<div promise.bind="myPromise">
  <template pending>Loading data...</template>
  <template then="data">Data loaded: ${data}</template>
  <template catch="error">Error: ${error.message}</template>
</div>
```

In this example:

- **`promise.bind="myPromise"`**:  Binds the `div` to the Promise named `myPromise` in your view model.
- **`<template pending>`**:  Content rendered while `myPromise` is in the *pending* state (still resolving).
- **`<template then="data">`**: Content rendered when `myPromise` *resolves* successfully. The resolved value is available as `data` within this template.
- **`<template catch="error">`**: Content rendered if `myPromise` *rejects*. The rejection reason (typically an Error object) is available as `error`.

### Simple Example with Different Promise States

Let's illustrate with a view model that manages different promise scenarios:

{% tabs %}
{% tab title="my-app.html" %}
```html
<div>
  <h3>Promise Example 1</h3>
  <div promise.bind="promise1">
    <template pending>Promise 1: Loading...</template>
    <template then="data">Promise 1: Resolved with: ${data}</template>
    <template catch="err">Promise 1: Rejected with error: ${err.message}</template>
  </div>
</div>

<div>
  <h3>Promise Example 2 (No data in 'then' state)</h3>
  <div promise.bind="promise2">
    <template pending>Promise 2: Waiting...</template>
    <template then>Promise 2: Successfully Resolved!</template>
    <template catch>Promise 2: An error occurred!</template>
  </div>
</div>
```
{% endtab %}

{% tab title="my-app.ts" %}
```typescript
export class MyApp {
  promise1: Promise<string>;
  promise2: Promise<void>;

  constructor() {
    this.promise1 = this.createDelayedPromise('Promise 1 Data', 2000, true); // Resolves after 2 seconds
    this.promise2 = this.createDelayedPromise(undefined, 3000, false); // Rejects after 3 seconds
  }

  createDelayedPromise(data: any, delay: number, shouldResolve: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldResolve) {
          resolve(data);
        } else {
          reject(new Error('Promise rejected after delay'));
        }
      }, delay);
    });
  }
}
```
{% endtab %}
{% endtabs %}

In this example, `promise1` is set to resolve after 2 seconds, and `promise2` is set to reject after 3 seconds. The template dynamically updates to reflect each promise's state. Notice in `promise2`'s `then` template, we don't specify a variable, indicating we only care about the resolved state, not the resolved value itself.

## Promise Binding with Functions and Parameters

You can directly bind a function call to `promise.bind`. Aurelia is smart enough to re-invoke the function only when its parameters change, treating function calls in templates as pure operations.

The following example fetches a random advice slip from an API each time a button is clicked:

{% tabs %}
{% tab title="my-app.html" %}
```html
<let adviceIndex.bind="0"></let>

<div promise.bind="fetchAdvice(adviceIndex)">
  <span pending>Fetching advice...</span>
  <span then="adviceData">
    Advice ID: ${adviceData.slip.id}<br>
    "${adviceData.slip.advice}"
    <button click.trigger="adviceIndex = adviceIndex + 1">Get New Advice</button>
  </span>
  <span catch="fetchError">
    Failed to get advice. Error: ${fetchError}
    <button click.trigger="adviceIndex = adviceIndex + 1">Try Again</button>
  </span>
</div>
```
{% endtab %}

{% tab title="my-app.ts" %}
```typescript
export class MyApp {
  adviceIndex = 0; // Initialize adviceIndex

  fetchAdvice(index: number): Promise<any> {
    // 'index' parameter ensures function re-execution on parameter change
    console.log(`Fetching advice, attempt: ${index}`);
    return fetch("https://api.adviceslip.com/advice", {
      cache: 'no-store' // Prevents caching for example clarity
    })
    .then(response => response.ok
      ? response.json()
      : Promise.reject(new Error(`HTTP error! status: ${response.status}`))
    )
    .catch(error => {
      console.error("Fetch error:", error);
      throw error; // Re-throw to be caught by the promise template
    });
  }
}
```
{% endtab %}
{% endtabs %}

**Key Points:**

- **`adviceIndex`**: This variable, initialized with `let adviceIndex.bind="0"`, acts as a parameter to `fetchAdvice`. Incrementing `adviceIndex` via the button click triggers Aurelia to re-evaluate `fetchAdvice(adviceIndex)`.
- **Function Re-execution**: Aurelia re-executes `fetchAdvice` only when `adviceIndex` changes, ensuring efficient handling of function-based promises.
- **Error Handling**: The `.catch` template gracefully handles fetch errors, providing user-friendly feedback and a "Try Again" button.

{% embed url="https://stackblitz.com/edit/au2-promise-binding-using-functions-improved?ctl=1&embed=1&file=src/my-app.ts" %}

## Isolated Promise Binding Scope

The `promise.bind` template controller creates its own isolated scope. This is crucial to prevent naming conflicts and unintended modification of the parent view model or scope.

```html
<div promise.bind="userPromise">
  <template then="userData">
    <user-profile user-data.bind="userData"></user-profile>
    <p>User ID within promise scope: ${userData.id}</p>
    <!-- Accessing parent scope (if needed, though generally discouraged) -->
    <!-- <p>Some parent property: ${$parent.someProperty}</p> -->
  </template>
  <template catch="userError">
    <error-display error-message.bind="userError.message"></error-display>
  </template>
</div>
```

In this example:

- **`userData` and `userError`**: These variables are scoped *only* within the `promise.bind` context. They do not pollute the parent view model scope.
- **Component Communication**: To pass data to child components (like `<user-profile>`), use property binding (e.g., `user-data.bind="userData"`).
- **Parent Scope Access (Discouraged)**: While you *can* access the parent scope using `$parent`, it's generally better to manage data flow through explicit bindings and avoid relying on parent scope access for maintainability.

## Nested Promise Bindings

Aurelia 2 supports nesting `promise.bind` controllers to handle scenarios where one asynchronous operation depends on the result of another.

```html
<div promise.bind="initialFetchPromise">
  <template pending>Fetching initial data...</template>
  <template then="initialResponse" promise.bind="initialResponse.json()">
    <template then="jsonData">
      Data received and deserialized: ${jsonData.name}
    </template>
    <template catch="jsonError">
      Error deserializing JSON: ${jsonError.message}
    </template>
  </template>
  <template catch="fetchError">
    Error fetching initial data: ${fetchError.message}
  </template>
</div>
```

**Flow of Execution:**

1. **`initialFetchPromise`**: The outer `promise.bind` starts with `initialFetchPromise`.
2. **Pending State**: While `initialFetchPromise` is pending, "Fetching initial data..." is displayed.
3. **First `then` (Response)**: When `initialFetchPromise` resolves, the resolved value (`initialResponse`) becomes available in the `then` template.
4. **Nested `promise.bind` (JSON Deserialization)**: Inside the first `then` template, a *nested* `promise.bind` is used: `promise.bind="initialResponse.json()"`. This starts a *new* promise based on deserializing the `initialResponse`.
5. **Nested `then` (JSON Data)**: When `initialResponse.json()` resolves, the parsed JSON data (`jsonData`) is available in *this* `then` template. "Data received and deserialized: ${jsonData.name}" is displayed.
6. **Nested `catch` (JSON Error)**: If `initialResponse.json()` fails (e.g., invalid JSON), the nested `catch` template handles the error.
7. **Outer `catch` (Fetch Error)**: If `initialFetchPromise` initially rejects, the outer `catch` template handles the initial fetch error.

## Promise Bindings in `repeat.for` Loops

When using `promise.bind` within a `repeat.for` loop, it's crucial to manage scope correctly, especially if you need to access data from each promise iteration. Using `let` bindings within the `<template promise.bind="...">` is highly recommended to create proper scoping for each iteration.

```html
<let promiseItems.bind="[[42, true], ['error-string', false], ['success-string', true]]"></let>
<ul>
  <template repeat.for="item of promiseItems">
    <li>
      <template promise.bind="createPromise(item[0], item[1])">
        <let itemData.bind="null"></let> <let itemError.bind="null"></let>
        <span pending>Processing item...</span>
        <span then="itemData">Item processed successfully: ${itemData}</span>
        <span catch="itemError">Item processing failed: ${itemError.message}</span>
      </template>
    </li>
  </template>
</ul>
```

```typescript
export class MyApp {
  promiseItems: any[][]; // Defined in HTML using <let>

  createPromise(value: any, shouldResolve: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldResolve) {
          resolve(value);
        } else {
          reject(new Error(`Promise rejected for value: ${value}`));
        }
      }, 1000); // Simulate async processing
    });
  }
}
```

**Importance of `<let>` Bindings:**

- **Scoped Context**: The lines `<let itemData.bind="null"></let>` and `<let itemError.bind="null"></let>` inside the `promise.bind` template are *essential*. They create `itemData` and `itemError` properties in the *overriding context* of each `promise.bind` iteration.
- **Preventing Overwriting**: Without these `let` bindings, `itemData` and `itemError` would be created in the *binding context*, which is shared across all iterations of the `repeat.for` loop. This would lead to data from later iterations overwriting data from earlier ones, resulting in incorrect or unpredictable behavior.
- **Correct Output**: With `let` bindings, each iteration of the `repeat.for` loop gets its own isolated scope for `itemData` and `itemError`, ensuring correct rendering for each promise in the list.
