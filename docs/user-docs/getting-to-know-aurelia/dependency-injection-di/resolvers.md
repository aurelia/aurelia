# Resolvers

## Getting started

Internally, the DI Container figures out how to locate each dependency using a Resolver. Which resolver is used depends on if or how the dependency was registered. (See below for [registration information](resolvers.md#registering-services)) However, you can specify a special resolver when you declare your dependencies.&#x20;

For example, perhaps your application has an Inspector composed of Panel instances. You may want to inject the panels into the inspector. However, there isn't just one Panel; multiple different types of panels implement the Panel interface. In this case, you'd want to use the `all` resolver. Here's what that would look like with a plain class:

```typescript
import { all } from 'aurelia';

export class Inspector {
  static inject = [all(Panel)];
  constructor(private panels: Panel[]) { }
}
```

And with a decorator...

```typescript
import { all } from 'aurelia';

@inject(all(Panel))
export class Inspector {
  constructor(private panels: Panel[]) { }
}
```

In another scenario, you might depend on a service that is expensive to create, which isn't always required, depending on what the user is doing with the app. In this case, you may want to resolve the dependency when it's needed lazily. For this, use the `lazy` resolver:

```typescript
import { lazy } from 'aurelia';

export class MyClass {
  static inject = [lazy(ExpensiveToCreateService)];
  constructor(private getExpensiveService: () => ExpensiveToCreateService) {}
}
```

And with a decorator...

```typescript
import { lazy } from 'aurelia';

@inject(lazy(ExpensiveToCreateService))
export class MyClass {
  constructor(private getExpensiveService: () => ExpensiveToCreateService) {}
}
```

In this case, the lazy resolver will inject a function that you can call on demand to get an instance of the `ExpensiveToCreateService`.

{% hint style="info" %}
The core DI container does not enable circular dependencies. To get around this issue, in situations where you might have a circular reference, you can use a `lazy` resolver.
{% endhint %}

{% hint style="warning" %}
In each of the resolvers above, the "key" we are providing in the `inject` property/decorator is different in type than the constructor parameter. As a result, we cannot use compiler-generated decorator metadata to provide the dependency information automatically. In the case of `lazy`, the compiler will see the type as `Function` while with `all` it will see it as `Array`. Neither provides enough information for the DI container to figure out what to do.
{% endhint %}

## Custom resolvers

You can create your own resolver by implementing the `IResolver` interface. Here's what that looks like:

```typescript
export interface IResolver<T = any> {
  $isResolver: true;
  resolve(handler: IContainer, requestor: IContainer): T;
  getFactory?(container: IContainer): IFactory<T> | null;
}
```

As you can see, you only need to implement one method, which uses the container (either the original requesting container or the one that the request bubbled up to, if they aren't the same) to return the instance. Here's a simplified version of the `all` built-in function:

```typescript
function all(key) {
  return {
    resolve(handler: IContainer, requestor: IContainer) {
      return requestor.getAll(key);
    }
  }
}
```

And here's a simplified version of `lazy`:

```typescript
function lazy(key) {
  return {
    resolve(handler: IContainer, requestor: IContainer) {
      let lazyInstance = null;

      return () => {
        if (lazyInstance === null) {
          lazyInstance = requestor.get(key);
        }

        return lazyInstance;
      };
    }
  }
}
```

> Note You can additionally implement `getFactory` to return a factory capable of creating instances of what this resolver will resolve. This is implemented by the standard internal resolver so that it's always possible to get the factory for singleton/transient registrations.
