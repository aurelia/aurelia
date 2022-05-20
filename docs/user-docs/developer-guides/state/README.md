---
description: A guide on working with the Aurelia State plugin.
---

# State

This guide aims to help you become familiar with the Aurelia State plugin, a means of managing state in your Aurelia applications.

## When should you use state management?

Before we delve too deeply into Aurelia State and how it can help manage state in your Aurelia applications, we should discuss when to use state management and when not to.

* When you need to reuse data in other parts of your application — State management shines when it comes to helping keep your data organized for cross-application reuse.
* When dealing with complex data structures — Ephermal state is great for simple use cases, but when working with complex data structures \(think multi-step forms or deeply structured data\), state management can help keep it consistent.

{% hint style="success" %}
Think about the state plugin as an event aggregator, but customized for state management.
{% endhint %}

## Aurelia State guides

### Installing Aurelia State

To install the Aurelia State plugin, open up a Command Prompt/Terminal and install it:

```bash
npm i @aurelia/state
```

## Setup the initial state

When registering the Aurelia State plugin, you need to pass in the initial state of your application. This is an object which defines the data structure of your application.

Create a new file in the `src` directory called `initialstate.ts` with your state object inside:

```typescript
export const initialState = {
  name: '',
  age: '',
  pets: [],
  siteEnabled: true,
};
```

As you can see, it's just a plain old Javascript object. In your application, your properties would be called something different, but you can see we have a mixture of empty values as well as some defaults.

This state will be stored in the global state container for bindings to use in the templates.

## Setup the reducers

The initial state above aren't meant to be mutated directly. In order to produce a state change, an mutation request should be dispatched instead. A reducer is a function that is supposed to combine the current state of the state container and the action parameters of the function call to produce a new state:

```js
const reducer = (state, action, ...parameters) => newState
```

An example of a reducer that produce a new state with updated keyword on a `keyword` action:

```ts
export function keywordReducer(currentState, action, newKeyword) {
  return action === 'keyword'
    ? { ...currentState, keyword: newKeyword }
    : currentState
}
```

Create a new file in the `src` directory called `reducers.ts` with the above code.

## Configuration

To use the Aurelia State plugin in Aurelia, it needs to be imported and registered. Inside of `main.ts` the plugin can be registered as follows:

```typescript
import Aurelia from 'aurelia';
import { StateDefaultConfiguration } from '@aurelia/state';

import { initialState } from './initialstate';
import { keywordAction } from './reducers';

Aurelia
  .register(
    StateDefaultConfiguration.init(initialState),
    keywordReducer
  )
  .app(MyApp)
  .start();

```

The above imports the `StateDefaultConfiguration` object from the plugin and then called `init` which then passes the initial state object for your application.


{% hint style="success" %}
If you are familiar with Redux, then you'll find this plugin familiar. The most obvious difference will be around the reducer function signature.
{% endhint %}