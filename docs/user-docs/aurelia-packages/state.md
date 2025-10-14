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
      keywordsHandler
    )
  )
  .app(MyApp)
  .start();
```

The above imports the `StateDefaultConfiguration` object from the plugin and then calls `init`, passing the initial state object and action handlers for your application.

For advanced use cases with middleware, the second parameter can be an options object:

```typescript
import { MiddlewarePlacement } from '@aurelia/state';
import { loggingMiddleware } from './middleware';

Aurelia
  .register(
    StateDefaultConfiguration.init(
      initialState,
      {
        middlewares: [
          { middleware: loggingMiddleware, placement: MiddlewarePlacement.Before }
        ]
      },
      keywordsHandler
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

### Promise and Observable Support

The `.state` binding command supports asynchronous data through Promises and RxJS-style observables:

#### Promise Support

```typescript
// State with promise-returning function
const initialState = {
  loadUserData: () => fetch('/api/user').then(r => r.json())
};
```

```html
<!-- Promise values are resolved and bound automatically -->
<input value.state="loadUserData().name">
```

#### Observable Support

The plugin also supports RxJS-style observables:

```typescript
// State with observable-returning function
const initialState = {
  realtimeData: () => ({
    subscribe(callback) {
      const interval = setInterval(() => {
        callback(new Date().toISOString());
      }, 1000);
      
      // Return cleanup function
      return () => clearInterval(interval);
    }
  })
};
```

```html
<!-- Observable values update automatically -->
<div>Current time: ${realtimeData()}</div>
```

**Key Features:**
- Promises are resolved once and the resolved value is bound
- Observables continuously update the bound value
- Cleanup functions are called when components are destroyed
- Works with both `.state` command and `& state` binding behavior

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

Expensive computations in `@fromState` selectors will run on every state change by default. To avoid unnecessary work, the `createStateMemoizer` helper allows you to memoize derived values so they are recomputed only when their dependencies actually change.

```ts
import { fromState, createStateMemoizer } from '@aurelia/state';

interface State { items: number[]; }

const selectTotal = createStateMemoizer(
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

`createStateMemoizer` shines when deriving data is expensive or shared across multiple components. Because the selector remembers its last inputs, recalculation happens only when those inputs change by reference. This reduces wasted work and centralizes complex logic.

Here is another example using multiple selectors:

```ts
interface State { items: string[]; search: string; }

const selectFiltered = createStateMemoizer(
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

Middleware provides a way to intercept and process actions before or after they reach your action handlers. This is particularly useful for cross-cutting concerns such as logging, validation, authentication, error handling, and performance monitoring.

### What is middleware?

Middleware functions are executed before or after actions are processed by action handlers. Middleware can be either synchronous **or asynchronous**.  When a middleware returns a `Promise`, the store will *await* it and use the resolved value (if any) before continuing the dispatch pipeline. This makes it possible to perform tasks such as API calls, logging to remote endpoints, reading from IndexedDB, etc. without blocking the UI thread.

Middleware can:

- Log actions for debugging and auditing
- Validate actions before processing
- Transform or modify actions
- Handle authentication and authorization
- Monitor performance
- Process state after action handlers complete

### Creating middleware

A middleware function has the following signature:

```ts
type IStateMiddleware<TState = any, TSettings = any> = (
  state: TState,
  action: unknown,
  settings?: TSettings
) => TState | undefined | false | void | Promise<TState | undefined | false | void>;
```

Here's a simple logging middleware example:

```ts
export const loggingMiddleware = (state, action, settings) => {
  console.log('Action dispatched:', action);
  console.log('Current state:', state);
  return state; // Return the state unchanged
};
```

And an example of an asynchronous middleware:

```ts
export const asyncLoggingMiddleware = async (state, action, settings) => {
  await api.log(action);
  return state; // Return the state unchanged
};
```

### Middleware return values

Middleware can return different values to control execution:

- **Return state object**: Continue execution with the returned state
- **Return `undefined` or `void`**: Continue with the current state unchanged
- **Return `false`**: Block the action from proceeding further

```ts
export const validationMiddleware = (state, action) => {
  if (!action.type) {
    console.error('Action must have a type');
    return false; // Block invalid actions
  }
  return state; // Continue with valid actions
};
```

### Registering middleware

Middleware is registered during state plugin configuration using the `MiddlewarePlacement` enum to specify when the middleware should run:

```typescript
import Aurelia from 'aurelia';
import { StateDefaultConfiguration, MiddlewarePlacement } from '@aurelia/state';

import { initialState } from './initialstate';
import { keywordsHandler } from './action-handlers';
import { loggingMiddleware, validationMiddleware } from './middleware';

Aurelia
  .register(
    StateDefaultConfiguration.init(
      initialState,
      {
        middlewares: [
          { middleware: loggingMiddleware, placement: MiddlewarePlacement.Before },
          { middleware: validationMiddleware, placement: MiddlewarePlacement.Before }
        ]
      },
      keywordsHandler
    )
  )
  .app(MyApp)
  .start();
```

### Middleware placement

Use `MiddlewarePlacement` to control when middleware executes:

- **`MiddlewarePlacement.Before`**: Runs before action handlers
- **`MiddlewarePlacement.After`**: Runs after action handlers

```typescript
// Before middleware - good for validation, logging incoming actions
{ middleware: validationMiddleware, placement: MiddlewarePlacement.Before }

// After middleware - good for logging final state, cleanup
{ middleware: stateLoggerMiddleware, placement: MiddlewarePlacement.After }
```

### Middleware execution order

Middleware functions are executed in the order they are registered within their placement group:

```ts
const firstMiddleware = (state, action) => {
  console.log('First middleware');
  return state;
};

const secondMiddleware = (state, action) => {
  console.log('Second middleware');
  return state;
};

// Registration order determines execution order
middlewares: [
  { middleware: firstMiddleware, placement: MiddlewarePlacement.Before },
  { middleware: secondMiddleware, placement: MiddlewarePlacement.Before }
]

// Output:
// First middleware
// Second middleware
// [Action handlers execute]
```

### Common middleware patterns

#### 1. Validation middleware

```ts
export const validationMiddleware = (state, action) => {
  // Validate action structure
  if (!action.type) {
    console.error('Action must have a type property');
    return false; // Block invalid action
  }

  // Validate specific action types
  if (action.type === 'updateUser' && !action.payload?.id) {
    console.error('updateUser action must include user id');
    return false;
  }

  return state; // Continue with valid action
};
```

#### 2. Authentication middleware

```ts
export const authMiddleware = (state, action) => {
  const protectedActions = ['deleteUser', 'updateSettings', 'createPost'];

  if (protectedActions.includes(action.type) && !state.user?.isAuthenticated) {
    console.error('Authentication required for this action');
    return false; // Block unauthorized action
  }

  return state;
};
```

#### 3. Action transformation middleware

```ts
export const transformMiddleware = (state, action) => {
  // Add timestamp to all actions
  const enhancedAction = {
    ...action,
    timestamp: Date.now()
  };

  // Note: This modifies the action object for subsequent middleware/handlers
  Object.assign(action, enhancedAction);

  return state;
};
```

#### 4. Error handling middleware

```ts
export const errorHandlingMiddleware = (state, action) => {
  try {
    // Validate action payload
    if (action.type === 'complexOperation' && !isValidPayload(action.payload)) {
      throw new Error('Invalid payload for complexOperation');
    }

    return state;
  } catch (error) {
    console.error('Middleware error:', action.type, error);

    // Return modified state with error information
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
export const performanceMiddleware = (state, action) => {
  // Log slow action types (this is a simple example)
  const slowActions = ['heavyComputation', 'dataProcessing'];

  if (slowActions.includes(action.type)) {
    console.time(`Action: ${action.type}`);
    // Note: In a real scenario, you'd need after middleware to log completion
  }

  return state;
};

// Corresponding after middleware
export const performanceAfterMiddleware = (state, action) => {
  const slowActions = ['heavyComputation', 'dataProcessing'];

  if (slowActions.includes(action.type)) {
    console.timeEnd(`Action: ${action.type}`);
  }

  return state;
};
```

### Middleware with settings

Middleware can accept custom settings through the third parameter:

```ts
export const loggingMiddleware = (state, action, settings) => {
  const { logLevel = 'info', prefix = '[STATE]' } = settings || {};

  if (logLevel === 'debug') {
    console.debug(`${prefix} Action:`, action);
    console.debug(`${prefix} State:`, state);
  } else {
    console.log(`${prefix} ${action.type}`);
  }

  return state;
};

// Register with settings
middlewares: [
  {
    middleware: loggingMiddleware,
    placement: MiddlewarePlacement.Before,
    settings: { logLevel: 'debug', prefix: '[APP]' }
  }
]
```

### Middleware factory pattern

For more advanced scenarios, you can create factory functions that return middleware:

```ts
export const createLoggingMiddleware = (actionTypeFilter) => (state, action, settings) => {
  const { logLevel = 'info', prefix = '[STATE]' } = settings || {};

  if (!actionTypeFilter || action.type === actionTypeFilter) {
    if (logLevel === 'debug') {
      console.debug(`${prefix} Action:`, action);
      console.debug(`${prefix} State:`, state);
    } else {
      console.log(`${prefix} ${action.type}`);
    }
  }

  return state;
};

// Register factory-created middleware
middlewares: [
  {
    middleware: createLoggingMiddleware('updateUser'),
    placement: MiddlewarePlacement.Before,
    settings: { logLevel: 'debug', prefix: '[APP]' }
  }
]
```

### Runtime middleware management

You can add and remove middleware at runtime using the store instance:

```ts
import { resolve } from 'aurelia';
import { IStore, MiddlewarePlacement } from '@aurelia/state';

export class MyComponent {
  private store: IStore = resolve(IStore);

  addDebugMiddleware() {
    const debugMiddleware = (state, action) => {
      console.log('Debug:', action.type);
      return state;
    };

    this.store.registerMiddleware(debugMiddleware, MiddlewarePlacement.Before);
  }

  removeDebugMiddleware() {
    // Note: You need to keep a reference to the middleware function
    this.store.unregisterMiddleware(this.debugMiddleware);
  }
}
```

### Best practices for middleware

1. **Keep middleware focused**: Each middleware should have a single responsibility
2. **Handle errors gracefully**: Use try-catch blocks and return appropriate values
3. **Consider performance**: Avoid heavy computations in frequently executed middleware
4. **Use TypeScript**: Leverage type safety for better development experience
5. **Order matters**: Register middleware in the correct execution order for your use case
6. **Return appropriate values**: Use `false` to block actions, return state to continue
7. **Test thoroughly**: Write unit tests for your middleware functions
8. **Consider async cost**: Async middleware is supported but will delay the completion of `dispatch` until the `Promise` settles.  Keep any network / long-running work minimal or move it off the critical path when possible.

### Debugging middleware

When troubleshooting middleware issues, you can add debug middleware to trace execution:

```ts
export const debugMiddleware = (state, action) => {
  console.group(`Middleware Debug: ${action.type}`);
  console.log('Current state:', state);
  console.log('Action:', action);
  console.groupEnd();

  return state;
};
```

### Runtime middleware management

You can add and remove middleware at runtime using the store instance:

```ts
import { resolve } from 'aurelia';
import { IStore } from '@aurelia/state';

export class MyComponent {
  private store: IStore = resolve(IStore);
  private debugMiddleware: (state: any, action: any) => any;

  addDebugMiddleware() {
    this.debugMiddleware = (state, action) => {
      console.log('Debug:', action.type);
      return state;
    };

    this.store.registerMiddleware(this.debugMiddleware, 'before');
  }

  removeDebugMiddleware() {
    // Note: You need to keep a reference to the middleware function
    this.store.unregisterMiddleware(this.debugMiddleware);
  }
}
```

## Redux DevTools Integration

The Aurelia State plugin includes built-in support for Redux DevTools, providing powerful debugging capabilities for state management:

### Automatic DevTools Connection

DevTools integration is enabled automatically when the Redux DevTools extension is installed:

```typescript
import { StateDefaultConfiguration } from '@aurelia/state';

// DevTools will automatically connect if extension is available
Aurelia
  .register(StateDefaultConfiguration.init(initialState, actionHandlers))
  .app(MyApp)
  .start();
```

### DevTools Configuration Options

For advanced DevTools configuration, you can provide options:

```typescript
import { StateDefaultConfiguration } from '@aurelia/state';

const devToolsOptions = {
  name: 'My Aurelia App',
  maxAge: 50,
  latency: 500,
  disable: process.env.NODE_ENV === 'production'
};

Aurelia
  .register(
    StateDefaultConfiguration.init(
      initialState,
      {
        devToolsOptions,
        middlewares: [/* your middleware */]
      },
      actionHandlers
    )
  )
  .app(MyApp)
  .start();
```

### DevTools Features Available

- **Time Travel Debugging**: Navigate through state changes
- **Action Inspection**: View dispatched actions and their payloads
- **State Inspection**: Deep inspection of state at any point in time
- **Action Filtering**: Filter actions by type or content
- **State Export/Import**: Save and load state snapshots

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
