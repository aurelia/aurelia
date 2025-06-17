---
description: A guide on working with the Aurelia State plugin.
---

# State

This guide aims to help you become familiar with the Aurelia State plugin, a means of managing the state in your Aurelia applications.

## When should you use state management?

Before we delve too deeply into Aurelia State and how it can help manage state in your Aurelia applications, we should discuss when to use state management and when not to.

* When you need to reuse data in other parts of your application — State management shines when it comes to helping keep your data organized for cross-application reuse.
* When dealing with complex data structures — Ephermal state is great for simple use cases. Still, when working with complex data structures (think multi-step forms or deeply structured data), state management can help keep it consistent.

{% hint style="info" %}
Think about the state plugin as an event aggregator but customized for state management.
{% endhint %}

## Aurelia State guides

### Installing Aurelia State

To install the Aurelia State plugin, open up a Command Prompt/Terminal and install it:

```bash
npm i @aurelia/state
```

### Setup the initial state

When registering the Aurelia State plugin, you must pass in your application's initial state. This is an object which defines the data structure of your application.

Create a new file in the `src` directory called `initialstate.ts` with your state object inside:

```typescript
export const initialState = {
  keywords: '',
  items: []
};
```

As you can see, it's just a plain old Javascript object. In your application, your properties would be called something different, but you can see we have a mixture of empty values and some defaults.

This state will be stored in the global state container for bindings to use in the templates.

### Setup the action handlers

The initial state above isn't meant to be mutated directly. In order to produce a state change, a mutation request should be dispatched instead. An action handler is a function that is supposed to combine the current state of the state container and the action parameters of the function call to produce a new state:

```js
const actionHandler = (state, action) => newState
```

An example of an action handler that produces a new state with the updated keyword on a `keyword` action:

```ts
export function keywordsHandler(currentState, action) {
  return action.type === 'newKeywords'
    ? { ...currentState, keywords: action.value }
    : currentState
}
```

Create a new file in the `src` directory called `action-handlers.ts` with the above code.

### Configuration

To use the Aurelia State plugin in Aurelia, it needs to be imported and registered. Inside `main.ts`, the plugin can be registered as follows:

```typescript
import Aurelia from 'aurelia';
import { StateDefaultConfiguration } from '@aurelia/state';

import { initialState } from './initialstate';
import { keywordsHandler } from './action-handlers';

Aurelia
  .register(
    StateDefaultConfiguration.init(
      initialState,
      [keywordsHandler]
    )
  )
  .app(MyApp)
  .start();
```

The above imports the `StateDefaultConfiguration` object from the plugin and then calls `init`, passing the initial state object and action handlers for your application.

For advanced use cases, you can also provide middleware as a third parameter:

```typescript
import { loggingMiddleware } from './middleware';

Aurelia
  .register(
    StateDefaultConfiguration.init(
      initialState,
      [keywordsHandler],
      [loggingMiddleware] // Optional middleware array
    )
  )
  .app(MyApp)
  .start();
```

{% hint style="info" %}
If you are familiar with Redux, you'll find this plugin familiar. The most obvious difference will be around the action handler (similar to reducer in Redux) function signature.
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
<input value.state="keywords" input.dispatch="{ type: 'newKeywords', value: $event.target.value }">
```

### With `& state` binding behavior

In places where it's not possible to use the `.state` binding command, the global state can be connected via `& state` binding behavior, like the following example:

```HTML
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

Sometimes, it's also desirable to connect a view model property to the global state. The Aurelia State Plugin supports this via the `@fromState` decorator. An example usage is as follows:

```ts
export class AutoSuggest {
  @fromState(state => state.keywords)
  keywords: string;
}
```

With the above, whenever the state changes, it will ensure the `keywords` property of the view model stays in sync with the `keywords` property on the global state.

### Memoizing derived state

Expensive computations in `@fromState` selectors will run on every state change by default. To avoid unnecessary work, the `createSelector` helper allows you to memoize derived values so they are recomputed only when their dependencies actually change.

```ts
import { fromState, createSelector } from '@aurelia/state';

interface State { items: number[]; }

const selectTotal = createSelector(
  (s: State) => s.items,
  items => items.reduce((a, b) => a + b, 0)
);

export class Summary {
  @fromState(selectTotal)
  total!: number;
}
```

In the example above, the `selectTotal` function executes only when `items` changes by reference. Other state updates won't trigger a recalculation, keeping the component performant and giving derived logic a clear place to live.

When you only need to read a value from state or perform a cheap calculation, passing a simple function directly to `@fromState` is usually adequate. The decorated property will update on every state change, which keeps things straightforward.

`createSelector` shines when deriving data is expensive or shared across multiple components. Because the selector remembers its last inputs, recalculation happens only when those inputs change by reference. This reduces wasted work and centralizes complex logic.

Here is another example using multiple selectors:

```ts
interface State { items: string[]; search: string; }

const selectFiltered = createSelector(
  (s: State) => s.items,
  (s: State) => s.search,
  (items, term) => items.filter(i => i.includes(term))
);

export class Results {
  @fromState(selectFiltered)
  results!: string[];
}
```

In contrast, writing the filter inline like `@fromState(s => s.items.filter(i => i.includes(s.search)))` would rerun on every single state update, even when neither `items` nor `search` changed.

## Authoring action handlers

As mentioned at the start of this guide, action handlers are the way to handle mutation of the global state. They are expected to return to a new state instead of mutating it. Even though normal mutation works, it may break future integration with devtool.

Action handlers can be either synchronous or asynchronous. An application may have one or more action handlers, and if one action handler is asynchronous, a promise will be returned for the `dispatch` call.

An action handler should return the existing state (first parameters) if the action is unnecessary.

## Middleware

Middleware provides a powerful way to intercept and process actions before they reach your action handlers. This is particularly useful for cross-cutting concerns such as logging, validation, authentication, error handling, and performance monitoring.

### What is middleware?

Middleware functions are executed in sequence before actions are processed by action handlers. Each middleware function receives the current state, the action being dispatched, and a `next` function to continue the middleware chain. Middleware can:

- Log actions for debugging and auditing
- Validate actions before processing
- Transform or modify actions
- Handle authentication and authorization
- Implement caching strategies
- Monitor performance
- Handle errors gracefully

### Creating middleware

A middleware function has the following signature:

```ts
type Middleware<TState, TAction> = (
  state: TState,
  action: TAction,
  next: () => TState | Promise<TState>
) => TState | Promise<TState>;
```

Here's a simple logging middleware example:

```ts
export const loggingMiddleware = (state, action, next) => {
  console.log('Action dispatched:', action);
  const newState = next();
  console.log('New state:', newState);
  return newState;
};
```

### Registering middleware

Middleware is registered during the state plugin configuration by passing an array of middleware functions to the `init` method:

```typescript
import Aurelia from 'aurelia';
import { StateDefaultConfiguration } from '@aurelia/state';

import { initialState } from './initialstate';
import { keywordsHandler } from './action-handlers';
import { loggingMiddleware, validationMiddleware } from './middleware';

Aurelia
  .register(
    StateDefaultConfiguration.init(
      initialState,
      [keywordsHandler],
      [loggingMiddleware, validationMiddleware] // Middleware array
    )
  )
  .app(MyApp)
  .start();
```

### Middleware execution order

Middleware functions are executed in the order they are registered. Each middleware must call `next()` to continue the chain, or the execution will stop at that middleware.

```ts
// First middleware
const firstMiddleware = (state, action, next) => {
  console.log('First middleware - before');
  const result = next();
  console.log('First middleware - after');
  return result;
};

// Second middleware
const secondMiddleware = (state, action, next) => {
  console.log('Second middleware - before');
  const result = next();
  console.log('Second middleware - after');
  return result;
};

// Output order:
// First middleware - before
// Second middleware - before  
// [Action handlers execute]
// Second middleware - after
// First middleware - after
```

### Asynchronous middleware

Middleware functions can be asynchronous and work seamlessly with both synchronous and asynchronous action handlers:

```ts
export const asyncLoggingMiddleware = async (state, action, next) => {
  console.log('Action started:', action.type);
  const startTime = Date.now();
  
  try {
    const newState = await next();
    const duration = Date.now() - startTime;
    console.log(`Action completed in ${duration}ms`);
    return newState;
  } catch (error) {
    console.error('Action failed:', error);
    throw error;
  }
};
```

### Common middleware patterns

#### 1. Validation middleware

```ts
export const validationMiddleware = (state, action, next) => {
  // Validate action structure
  if (!action.type) {
    throw new Error('Action must have a type property');
  }
  
  // Validate specific action types
  if (action.type === 'updateUser' && !action.payload?.id) {
    throw new Error('updateUser action must include user id');
  }
  
  return next();
};
```

#### 2. Authentication middleware

```ts
export const authMiddleware = (state, action, next) => {
  const protectedActions = ['deleteUser', 'updateSettings', 'createPost'];
  
  if (protectedActions.includes(action.type) && !state.user?.isAuthenticated) {
    throw new Error('Authentication required for this action');
  }
  
  return next();
};
```

#### 3. Caching middleware

```ts
const cache = new Map();

export const cachingMiddleware = (state, action, next) => {
  // Only cache read operations
  if (!action.type.startsWith('fetch')) {
    return next();
  }
  
  const cacheKey = JSON.stringify(action);
  
  if (cache.has(cacheKey)) {
    console.log('Cache hit for:', action.type);
    return cache.get(cacheKey);
  }
  
  const result = next();
  cache.set(cacheKey, result);
  console.log('Cache miss for:', action.type);
  
  return result;
};
```

#### 4. Error handling middleware

```ts
export const errorHandlingMiddleware = (state, action, next) => {
  try {
    return next();
  } catch (error) {
    console.error('Action failed:', action.type, error);
    
    // You could dispatch an error action here
    // or modify state to include error information
    return {
      ...state,
      error: {
        message: error.message,
        action: action.type,
        timestamp: new Date().toISOString()
      }
    };
  }
};
```

#### 5. Performance monitoring middleware

```ts
export const performanceMiddleware = (state, action, next) => {
  const startTime = performance.now();
  
  const result = next();
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  if (duration > 100) { // Log slow actions
    console.warn(`Slow action detected: ${action.type} took ${duration.toFixed(2)}ms`);
  }
  
  return result;
};
```

### Conditional middleware execution

Middleware can conditionally execute based on action types or state conditions:

```ts
export const conditionalMiddleware = (state, action, next) => {
  // Only process specific action types
  if (action.type === 'sensitiveOperation') {
    console.log('Processing sensitive operation');
    // Additional validation or logging here
  }
  
  // Always continue the chain
  return next();
};
```

### Middleware with dependency injection

Middleware can use Aurelia's dependency injection system:

```ts
import { ILogger } from 'aurelia';

export const createLoggingMiddleware = (logger: ILogger) => {
  return (state, action, next) => {
    logger.info('Action dispatched', action);
    const result = next();
    logger.info('State updated', { action: action.type });
    return result;
  };
};

// In your configuration:
const logger = container.get(ILogger);
const loggingMiddleware = createLoggingMiddleware(logger);
```

### Best practices for middleware

1. **Keep middleware focused**: Each middleware should have a single responsibility
2. **Always call next()**: Unless you intentionally want to stop the chain
3. **Handle errors appropriately**: Use try-catch blocks for robust error handling
4. **Consider performance**: Avoid heavy computations in frequently executed middleware
5. **Use TypeScript**: Leverage type safety for better development experience
6. **Order matters**: Register middleware in the correct execution order
7. **Test thoroughly**: Write tests for both synchronous and asynchronous scenarios

### Debugging middleware

When troubleshooting middleware issues, you can add debug middleware to log the middleware chain execution:

```ts
export const debugMiddleware = (state, action, next) => {
  console.group(`Middleware Debug: ${action.type}`);
  console.log('Current state:', state);
  console.log('Action:', action);
  
  try {
    const result = next();
    console.log('Result state:', result);
    console.groupEnd();
    return result;
  } catch (error) {
    console.error('Middleware error:', error);
    console.groupEnd();
    throw error;
  }
};
```

## Example of type declaration for application stores

Applications can enforce strict typings with view model-based `dispatch` calls via the 2nd type parameter of the store.

For example, if the store only accepts two types of actions, that has the following type:

```ts
export type EditAction = { type: 'edit'; value: string }
export type ClearAction = { type: 'clear' }
```

Then the store can be declared like this:
```ts
import { resolve } from 'aurelia';
import { IStore } from '@aurelia/state';

class MyEl {
  store: IStore<{}, EditAction | ClearAction> = resolve(IStore);

  onSomeUserAction() {
    this.store.dispatch({ type: 'edit', value: 'hi' }); // good
    this.store.dispatch({ type: 'edit' }); // error 💥
    this.store.dispatch({ type: 'clear' }); // good
  }
}
```
