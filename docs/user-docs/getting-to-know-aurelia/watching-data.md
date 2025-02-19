---
description: >-
  Watching data for changes, including support for expressions where you want to
  watch for changes to one or more dependencies and react accordingly.
---

# Watching data

## Introduction

The `@watch` decorator lets you respond to changes in your view model properties or computed expressions. It is intended for use on custom element and attribute view models. Once a watcher is created, it binds after the `binding` lifecycle and unbinds before `unbinding`—meaning mutations during `binding` or after `unbinding` will not trigger the watcher.

---

## Basic Usage with @watch

There are two primary ways to use `@watch`:

1. **Class-level Decoration:** Attach the decorator to a class with an expression and a callback.
2. **Method-level Decoration:** Attach the decorator to a method; the method itself acts as the callback when the watched value changes.

**Syntax:**

```typescript
import { watch } from '@aurelia/runtime-html';

// On class:
@watch(expressionOrPropertyAccessFn, changeHandlerOrCallback)
class MyClass {}

// On method:
class MyClass {
  @watch(expressionOrPropertyAccessFn)
  someMethod() {}
}
```

### API Parameters

| Name                         | Type                          | Description                                                                                                                                                                                                                                                                                    |
| ---------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `expressionOrPropertyAccessFn` | `string` or `IPropertyAccessFn` | Specifies the value to watch. When a string is provided, it is used as an expression (similar to Aurelia templating). When a function is provided, it acts as a computed getter that returns the value to observe.                                                                          |
| `changeHandlerOrCallback`      | `string` or `IWatcherCallback`  | Optional. The callback invoked when the watched value changes. If a string is provided, it is used to resolve a method name (resolved only once, so subsequent changes to the method are not tracked). If a function is provided, it is called with three parameters: new value, old value, and the instance. |

---

## Reacting to Property Changes

The simplest use case is to watch a single property. For example, to react whenever the `name` property changes:

```typescript
import { watch } from '@aurelia/runtime-html';

class NameComponent {
  name = '';

  @watch('name')
  nameChange(newName, oldName) {
    console.log('New name:', newName);
    console.log('Old name:', oldName);
  }
}
```

You can also observe expressions on arrays. For instance, watching the length of an array:

```typescript
import { watch } from '@aurelia/runtime-html';

class PostOffice {
  packages = [];

  @watch('packages.length')
  log(newCount, oldCount) {
    if (newCount > oldCount) {
      // New packages arrived.
    } else {
      // Packages were delivered.
    }
  }
}
```

---

## Using Computed Functions

Sometimes you need to monitor changes in multiple properties. In these cases, you can provide a computed getter function to the `@watch` decorator. The function should return the value you want to observe and can also register dependencies manually if needed.

**Example – Watching Array Length with a Computed Getter:**

```typescript
import { watch } from '@aurelia/runtime-html';

class PostOffice {
  packages = [];

  @watch(post => post.packages.length)
  log(newCount, oldCount) {
    if (newCount > oldCount) {
      // New packages arrived.
    } else {
      // Packages were delivered.
    }
  }
}
```

In this example, the callback receives the new and old computed values every time the dependency (`packages.length`) changes. The view model (`post`) is also passed as a parameter so you can access other properties if needed.

---

## Usage Examples

Below are several examples illustrating different ways to use the `@watch` decorator.

### 1. Class-level, String Expression, Arrow Function Callback

```typescript
import { watch } from '@aurelia/runtime-html';

@watch('counter', (newValue, oldValue, app) => app.log(newValue))
class App {
  counter = 0;

  log(whatToLog) {
    console.log(whatToLog);
  }
}
```

### 2. Class-level, String Expression, Method Name as Callback

> **Warning:** The method is resolved only once. Changes to the method after instance creation are not detected.

```typescript
import { watch } from '@aurelia/runtime-html';

@watch('counter', 'log')
class App {
  counter = 0;

  log(whatToLog) {
    console.log(whatToLog);
  }
}
```

### 3. Class-level, String Expression, Normal Function Callback

```typescript
import { watch } from '@aurelia/runtime-html';

@watch('counter', function(newValue, oldValue, app) {
  // 'this' points to the instance of the class
  this.log(newValue);
})
class App {
  counter = 0;

  log(whatToLog) {
    console.log(whatToLog);
  }
}
```

### 4. Class-level, Normal Function as Watch Expression, Arrow Function Callback

```typescript
import { watch } from '@aurelia/runtime-html';

@watch(function(app) { return app.counter }, (newValue, oldValue, app) => app.log(newValue))
class App {
  counter = 0;

  log(whatToLog) {
    console.log(whatToLog);
  }
}
```

### 5. Class-level, Arrow Function as Watch Expression, Arrow Function Callback

```typescript
import { watch } from '@aurelia/runtime-html';

@watch(app => app.counter, (newValue, oldValue, app) => app.log(newValue))
class App {
  counter = 0;

  log(whatToLog) {
    console.log(whatToLog);
  }
}
```

### 6. Method-level, String Expression

```typescript
import { watch } from '@aurelia/runtime-html';

class App {
  counter = 0;

  @watch('counter')
  log(whatToLog) {
    console.log(whatToLog);
  }
}
```

### 7. Method-level, Normal Function as Watch Expression

```typescript
import { watch } from '@aurelia/runtime-html';

class App {
  counter = 0;

  @watch(function(app) { return app.counter })
  log(whatToLog) {
    console.log(whatToLog);
  }
}
```

### 8. Method-level, Arrow Function as Watch Expression

```typescript
import { watch } from '@aurelia/runtime-html';

class App {
  counter = 0;

  @watch(app => app.counter)
  log(whatToLog) {
    console.log(whatToLog);
  }
}
```

---

## Watch Reactivity & Lifecycle

Watchers created via the `@watch` decorator activate and deactivate in sync with component lifecycles:

- **During `binding`:** Watchers are not active. Mutations here won’t trigger callbacks.

  ```typescript
  import { watch } from '@aurelia/runtime-html';

  class PostOffice {
    packages = [];

    @watch(post => post.packages.length)
    log(newCount, oldCount) {
      console.log(`packages changes: ${oldCount} -> ${newCount}`);
    }

    binding() {
      this.packages.push({ id: 1, name: 'xmas toy', delivered: false });
    }
  }
  ```
  *No log output during `binding`.*

- **During `bound`:** Watchers are active. Changes will trigger the callback.

  ```typescript
  import { watch } from '@aurelia/runtime-html';

  class PostOffice {
    packages = [];

    @watch(post => post.packages.length)
    log(newCount, oldCount) {
      console.log(`packages changes: ${oldCount} -> ${newCount}`);
    }

    bound() {
      this.packages.push({ id: 1, name: 'xmas toy', delivered: false });
    }
  }
  ```
  *Logs: `packages changes: 0 -> 1`.*

- **During `detaching`:** Watchers are still active and will respond to changes.

  ```typescript
  import { watch } from '@aurelia/runtime-html';

  class PostOffice {
    packages = [];

    @watch(post => post.packages.length)
    log(newCount, oldCount) {
      console.log(`packages changes: ${oldCount} -> ${newCount}`);
    }

    detaching() {
      this.packages.push({ id: 1, name: 'xmas toy', delivered: false });
    }
  }
  ```
  *Logs: `packages changes: 0 -> 1`.*

- **During `unbinding`:** Watchers have been deactivated; changes are ignored.

  ```typescript
  import { watch } from '@aurelia/runtime-html';

  class PostOffice {
    packages = [];

    @watch(post => post.packages.length)
    log(newCount, oldCount) {
      console.log(`packages changes: ${oldCount} -> ${newCount}`);
    }

    unbinding() {
      this.packages.push({ id: 1, name: 'xmas toy', delivered: false });
    }
  }
  ```
  *No log output during `unbinding`.*

> **Info:** Lifecycles between `binding` and `unbinding` (such as `attaching`, `attached`, and `detaching`) behave normally with respect to watchers.

---

## How It Works

When you apply `@watch()`, a watcher is created to monitor the specified expression:

- **String or Symbol Expressions:** Interpreted like Aurelia template expressions.
- **Function Expressions (Computed Getters):** The function is called to obtain a value and register its dependencies. Two mechanisms exist:
  - **With Native Proxy Support:** Proxies intercept property reads, including collection method calls (e.g., `.map()`), to automatically track dependencies.
  - **Without Native Proxy Support:** You receive a second parameter—the watcher instance—to manually register dependencies.

### The IWatcher Interface

In environments without native proxies, the computed getter receives a watcher with the following interface:

```typescript
interface IWatcher {
  observeProperty(obj: object, key: string | number | symbol): void;
  observeCollection(collection: Array<any> | Map<any, any> | Set<any>): void;
}
```

**Example:**

```typescript
import { watch } from '@aurelia/runtime-html';

class Contact {
  firstName = 'Chorris';
  lastName = 'Nuck';

  @watch((contact, watcher) => {
    // Manually observe dependencies.
    watcher.observeProperty(contact, 'firstName');
    watcher.observeProperty(contact, 'lastName');
    return `${contact.firstName} ${contact.lastName}`;
  })
  validateFullName(fullName) {
    if (fullName === 'Chuck Norris') {
      this.faint();
    }
  }
}
```

**Automatic Array Observation:**
> *Note:* In computed getters, common array mutation methods (`push`, `pop`, `shift`, `unshift`, `splice`, `reverse`) are not observed automatically because they don’t expose clear dependency signals.

---

## Best Practices

### 1. Avoid Mutating Dependencies in Computed Getters

Do not alter properties or collections when returning a computed value:

```typescript
// Avoid:
@watch(object => object.counter++)
someMethod() {}

// Avoid these mutations:
@watch(object => object.someArray.push(...args))
@watch(object => object.someArray.pop())
@watch(object => object.someArray.shift())
@watch(object => object.someArray.unshift())
@watch(object => object.someArray.splice(...args))
@watch(object => object.someArray.reverse())
someMethod() {}
```

### 2. Be Cautious with Object Identity

Due to proxy wrapping, a raw object and its proxied version may not be strictly equal. Always access the dependency from the first parameter to maintain proper identity checks.

```typescript
import { watch } from '@aurelia/runtime-html';

const defaultOptions = {};

class MyClass {
  options = defaultOptions;

  @watch(myClass => myClass.options === defaultOptions ? null : myClass.options)
  applyCustomOptions() {
    // ...
  }
}
```

### 3. Do Not Return Promises or Async Functions

The dependency tracking is synchronous. Returning a promise or using an async function will break the reactivity.

```typescript
import { watch } from '@aurelia/runtime-html';

class MyClass {
  // Incorrect – async functions or promises are not supported
  @watch(async myClassInstance => myClassInstance.options)
  applyCustomOptions() {}

  // Incorrect usage:
  @watch(myClassInstance => {
    Promise.resolve().then(() => {
      return myClassInstance.options;
    });
  })
  anotherMethod() {}
}
```
