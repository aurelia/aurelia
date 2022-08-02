---
description: A guide on working with the Aurelia State plugin.
---

# State

This guide aims to help you become familiar with the Aurelia State plugin, a means of managing state in your Aurelia applications.

## When should you use state management?

Before we delve too deeply into Aurelia State and how it can help manage state in your Aurelia applications, we should discuss when to use state management and when not to.

* When you need to reuse data in other parts of your application — State management shines when it comes to helping keep your data organized for cross-application reuse.
* When dealing with complex data structures — Ephermal state is great for simple use cases, but when working with complex data structures \(think multi-step forms or deeply structured data\), state management can help keep it consistent.

{% hint style="info" %}
Think about the state plugin as an event aggregator, but customized for state management.
{% endhint %}

## Aurelia State guides

### Installing Aurelia State

To install the Aurelia State plugin, open up a Command Prompt/Terminal and install it:

```bash
npm i @aurelia/state
```

### Setup the initial state

When registering the Aurelia State plugin, you need to pass in the initial state of your application. This is an object which defines the data structure of your application.

Create a new file in the `src` directory called `initialstate.ts` with your state object inside:

```typescript
export const initialState = {
  keywords: '',
  items: []
};
```

As you can see, it's just a plain old Javascript object. In your application, your properties would be called something different, but you can see we have a mixture of empty values as well as some defaults.

This state will be stored in the global state container for bindings to use in the templates.

### Setup the action handlers

The initial state above aren't meant to be mutated directly. In order to produce a state change, an mutation request should be dispatched instead. An action handler is a function that is supposed to combine the current state of the state container and the action parameters of the function call to produce a new state:

```js
const actionHandler = (state, action, ...parameters) => newState
```

An example of a action handler that produce a new state with updated keyword on a `keyword` action:

```ts
export function keywordsHandler(currentState, action, newKeyword) {
  return action === 'newKeywords'
    ? { ...currentState, keywords: newKeyword }
    : currentState
}
```

Create a new file in the `src` directory called `action-handlers.ts` with the above code.

### Configuration

To use the Aurelia State plugin in Aurelia, it needs to be imported and registered. Inside of `main.ts` the plugin can be registered as follows:

```typescript
import Aurelia from 'aurelia';
import { StateDefaultConfiguration } from '@aurelia/state';

import { initialState } from './initialstate';
import { keywordsHandler } from './action-handlers';

Aurelia
  .register(
    StateDefaultConfiguration.init(
      initialState,
      keywordsHandler
    )
  )
  .app(MyApp)
  .start();

```

The above imports the `StateDefaultConfiguration` object from the plugin and then called `init` which then passes the initial state object for your application.


{% hint style="info" %}
If you are familiar with Redux, then you'll find this plugin familiar. The most obvious difference will be around the action handler (similar to reducer in Redux) function signature.
{% endhint %}

## Template binding

### With `.state` and `.dispatch` commands

The Aurelia State Plugin provides `state` and `dispatch` binding commands that simplify binding with the global state. Example usages:

```html
// bind value property of the input to `keywords` property on the global state
<input value.state="keywords">

// dispatch an action object `{ type: 'clearKeywords' }` to request state mutation
<button click.dispatch="{ type: 'clearKeywords' }">Clear keywords</button>

// bind value property of the input to `keywords` property on the global state
// and dispatch an action with type `newKeywords` on input event
<input value.state="keywords" input.dispatch="{ type: 'newKeywords', params: [$event.target.value] }">
```

### With `& state` binding behavior

In places where it's not possible to use `.state` binding command, the global state can be connected via `& state` binding behavior, like the following example:
```html
<p>Found ${items.length & state} results for keyword: "${keyword & state}"</p>
<div repeat.for="item of items & state">
  ${item.name}
</div>
```

### Accessing view model

Note: by default, bindings created from `.state` and `.dispatch` commands will only allow you to access the properties on the global state. If it's desirable to access the property of the view model containing those bindings, use `$parent` like the following example:

```html
// access the property `prefix` on the view model, and `keywords` property on the global state
<input value.state="$parent.prefix + keywords">
```

## View model binding

### With `@fromState` decorator

Sometimes it's also desirable to connect a view model property to the global state. The Aurelia State Plugin supports this via the `@fromState` decorator.
An example usage is as follow:

```ts
export class AutoSuggest {
  @fromState(state => state.keywords)
  keywords: string;
}
```
With the above, whenever the state change, it will ensure `keywords` property of the view model stay in sync with the `keywords` property on the global state.

## Authoring action handlers

As mentioned at the start of this guide, action handlers are the way to handle mutation of the global state. They are expected to be returning a new state instead of mutating existing state. Even though normal mutation works, it may break future integration with devtool.

Action handlers can be either synchronous or asyncchronous. An application may have one or more action handlers, and if one action handler is asynchronous, a promise will be returned for the `dispatch` call.

An action handler should return the existing state (first parameters) if the action type is not of its interest.

