---
description: Watching data
---

# Introduction

Aurelia provides a way to author your components with reactive programming model with the `@watch` decorator. Decorating a class itself, or a method inside it with the `@watch` decorator and the corresponding method will be called whenever the watched value changes.

{% hint style="info" %}
**Intended usages**

- The `@watch` decorator can only be used on custom element and custom attribute view models.
- Corresponding watchers of `@watch` decorator will be created once, and bound after `beforeBind`, and before `afterBind` lifecycles. This means mutation during `beforeBind`/`beforeUnbind` won't be reacted to, as watchers haven't started or have stopped.

{% endhint %}

# APIs

| Name | Type | Description |
|-|-|-|
| expressionOrPropertyAccessFn | string \| IPropertyAccessFn<T> | Watch expression specifier |
| changeHandlerOrCallback | string \| IWatcherCallback<T> | The callback that will be invoked when the value evaluated from watch expression has changed. If a name is given, it will be used to resolve the callback `ONCE`. This callback will be called with 3 parameters: (1st) new value from the watched expression. (2nd) old value from the watched expression (3rd) the watched instance. And the context of the function call will be the instance, same with the 3rd parameter. |

# Basics

The `@watch` decorator can be used in 2 fashions: using a computed function, or an expression.

An example of computed function usage with `@watch` is:

```typescript
@customElement('post-office')
class PostOffice {
  packages = [];

  @watch(post => post.packages.length)
  log(newCount, oldCount) {
    if (newCount > oldCount) {
      // new packages came
    } else {
      // packages delivered
    }
  }
}
```

In this example, the `log` method of `PostOffice` will be called whenever there' new packages added to, or existing `packages` removed from the `packages` array.

An example of expression usage with `@watch` is:

```typescript
@customElement('post-office')
class PostOffice {
  packages = [];

  @watch('packages.length')
  log(newCount, oldCount) {
    if (newCount > oldCount) {
      // new packages came
    } else {
      // packages delivered
    }
  }
}
```

In this example, the `log` method will be also invoked similarly. The only difference is the first parameter of `@watch` decorator: an expression (`packages.length`) instead of a computed function.

# Usage examples


{% hint style="info" %}
Decorating on a class, string as watch expression, with arrow function as callback
{% endhint %}

```ts
@watch('counter', (newValue, oldValue, app) => app.log(newValue))
class App {

  counter = 0;

  log(whatToLog) {
    console.log(whatToLog);
  }
}
```


{% hint style="info" %}
Decorating on a class, string as watch expression, with method name as callback
{% endhint %}

> ❗❗❗❗ method name will be used to resolve the function `ONCE`, which means changing method after the instance has been created will not be recognised.

```ts
@watch('counter', 'log')
class App {

  counter = 0;

  log(whatToLog) {
    console.log(whatToLog);
  }
}
```

{% hint style="info" %}
Decorating on a class, string as watch expression, with normal function as callback
{% endhint %}

```ts
@watch('counter', function(newValue, oldValue, app) {
  app.log(newValue);
  // or use this, it will point to the instance of this class
  this.log(newValue);
})
class App {

  counter = 0;

  log(whatToLog) {
    console.log(whatToLog);
  }
}
```

{% hint style="info" %}
Decorating on a class, normal function as watch expression, with arrow function as callback
{% endhint %}

```ts
@watch(function (app) { return app.counter }, (newValue, oldValue, app) => app.log(newValue))
class App {

  counter = 0;

  log(whatToLog) {
    console.log(whatToLog);
  }
}
```


{% hint style="info" %}
Decorating on a class, arrow function as watch expression, with arrow function as callback
{% endhint %}

```ts
@watch(app => app.counter, (newValue, oldValue, app) => app.log(newValue))
class App {

  counter = 0;

  log(whatToLog) {
    console.log(whatToLog);
  }
}
```


{% hint style="info" %}
Decorating on a method, string as watch expression
{% endhint %}

```ts
class App {

  counter = 0;

  @watch('counter')
  log(whatToLog) {
    console.log(whatToLog);
  }
}
```


{% hint style="info" %}
Decorating on a method, normal function as watch expression
{% endhint %}

```ts
class App {

  counter = 0;

  @watch(function(app) { return app.counter })
  log(whatToLog) {
    console.log(whatToLog);
  }
}
```


{% hint style="info" %}
Decorating on a method, arrow function as watch expression
{% endhint %}

```ts
class App {

  counter = 0;

  @watch(app => app.counter)
  log(whatToLog) {
    console.log(whatToLog);
  }
}
```
