---
description: How to configure and use the Aurelia Store plugin.
---

# Configuration and Setup

## Installing Aurelia Store

To install the Aurelia Store plugin, open up a Command Prompt/Terminal and install it:

```bash
npm i @aurelia/store-v1
```

## Setup the initial state

When registering the Aurelia Store plugin, you need to pass in the initial state of your application. This is an object which defines the data structure of your application, it needs to be done upfront so the plugin can watch it and act accordingly when it changes.

Create a new file in the `src` directory called `initialstate.ts` with your state object inside:

```typescript
export const initialState = {
    name: '',
    age: '',
    pets: [],
    siteEnabled: true
};
```

As you can see, it's just a plain old Javascript object. In your application, your properties would be called something different, but you can see we have a mixture of empty values as well as some defaults.

## Configuration

To use the Aurelia Store plugin in Aurelia, it needs to be imported and registered. Inside of `main.ts` the plugin can be registered as follows:

```typescript
import Aurelia from 'aurelia';
import { StoreConfiguration } from '@aurelia/store-v1';

import { initialState } from './initialstate'; 

Aurelia
  .register(
    StoreConfiguration.withInitialState(initialState)
  )
  .app(MyApp)
  .start();
```

We import the `StoreConfiguration` object from the plugin and then called `withInitialState` which we then pass the state object for your application (we showed you how to do this in the previous step).
