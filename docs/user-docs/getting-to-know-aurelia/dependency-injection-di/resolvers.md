# Resolvers

Resolvers in Aurelia 2 are integral to the Dependency Injection (DI) system, providing various strategies for resolving dependencies. This guide will cover each resolver type, its usage, and when to use it, with detailed code examples for both the `@inject` decorator and static `inject` property methods. Additionally, we will discuss how to create custom resolvers.

## Built-in Resolvers

Aurelia 2 offers several built-in resolvers to address different dependency resolution needs. Here's how to use them with both the `@inject` decorator and static `inject` property.

### `lazy` Resolver

Use the `lazy` resolver when you want to defer the creation of a service until it's needed. This is particularly useful for expensive resources.

#### Using `@inject` Decorator

```typescript
import { lazy, inject } from 'aurelia';

@inject(lazy(MyService))
export class MyClass {
  constructor(private getMyService: () => MyService) {
    // Call getMyService() when you need an instance of MyService
  }
}
```

#### Using Static `inject` Property

```typescript
import { lazy } from 'aurelia';

export class MyClass {
  static inject = [lazy(MyService)];
  constructor(private getMyService: () => MyService) {
    // Similar usage as with the decorator
  }
}
```

### `all` Resolver

The `all` resolver is used to inject an array of all instances registered under a particular key. This is useful when working with multiple implementations of an interface.

#### Using `@inject` Decorator

```typescript
import { all, inject } from 'aurelia';

@inject(all(MyService))
export class MyClass {
  constructor(private services: MyService[]) {
    // services is an array of MyService instances
  }
}
```

#### Using Static `inject` Property

```typescript
import { all } from 'aurelia';

export class MyClass {
  static inject = [all(MyService)];
  constructor(private services: MyService[]) {
    // Similar usage as with the decorator
  }
}
```

### `optional` Resolver

The `optional` resolver allows a service to be injected if available, or `undefined` if not. This can prevent runtime errors when a dependency is not critical.

#### Using `@inject` Decorator

```typescript
import { optional, inject } from 'aurelia';

@inject(optional(MyService))
export class MyClass {
  constructor(private service?: MyService) {
    // service is MyService or undefined
  }
}
```

#### Using Static `inject` Property

```typescript
import { optional } from 'aurelia';

export class MyClass {
  static inject = [optional(MyService)];
  constructor(private service?: MyService) {
    // Similar usage as with the decorator
  }
}
```

### `factory` Resolver

The `factory` resolver provides a function to create instances of a service, allowing for more control over the instantiation process.

#### Using `@inject` Decorator

```typescript
import { factory, inject } from 'aurelia';

@inject(factory(MyService))
export class MyClass {
  constructor(private createMyService: () => MyService) {
    // createMyService is a function to create MyService instances
  }
}
```

#### Using Static `inject` Property

```typescript
import { factory } from 'aurelia';

export class MyClass {
  static inject = [factory(MyService)];
  constructor(private createMyService: () => MyService) {
    // Similar usage as with the decorator
  }
}
```

### `newInstanceForScope` Resolver

Use `newInstanceForScope` when you need a unique instance of a service within a particular scope, such as a component or sub-container.

#### Using `@inject` Decorator

```typescript
import { newInstanceForScope, inject } from 'aurelia';

@inject(newInstanceForScope(MyService))
export class MyClass {
  constructor(private service: MyService) {
    // service is a new scoped instance of MyService
  }
}
```

#### Using Static `inject` Property

```typescript
import { newInstanceForScope } from 'aurelia';

export class MyClass {
  static inject = [newInstanceForScope(MyService)];
  constructor(private service: MyService) {
    // Similar usage as with the decorator
  }
}
```

### `newInstanceOf` Resolver

The `newInstanceOf` resolver ensures that a fresh instance of a service is created each time, regardless of other registrations.

#### Using `@inject` Decorator

```typescript
import { newInstanceOf, inject } from 'aurelia';

@inject(newInstanceOf(MyService))
export class MyClass {
  constructor(private service: MyService) {
    // service is a fresh instance of MyService
  }
}
```

#### Using Static `inject` Property

```typescript
import { newInstanceOf } from 'aurelia';

export class MyClass {
  static inject = [newInstanceOf(MyService)];
  constructor(private service: MyService) {
    // Similar usage as with the decorator
  }
}
```

## Custom Resolvers

You can create custom resolvers by implementing the `IResolver` interface. Custom resolvers give you the flexibility to implement complex resolution logic that may not be covered by the built-in resolvers.

### Example of a Custom Resolver

```typescript
import { IResolver, IContainer, inject } from 'aurelia';

class MyCustomResolver<T> implements IResolver {
  $isResolver: true;
  constructor(private key: new (...args: any[]) => T) {}

  resolve(handler: IContainer, requestor: IContainer): T {
    // Custom resolution logic here
    return new this.key();
  }
}

// Usage
@inject(new MyCustomResolver(MyService))
export class MyClass {
  constructor(private service: MyService) {
    // service is resolved using MyCustomResolver
  }
}
```

In the example above, `MyCustomResolver` is a custom resolver that creates a new instance of `MyService`. You can further customize the `resolve` method to suit your specific requirements.

By understanding and utilizing these resolvers, you can achieve a high degree of flexibility and control over the dependency injection process in your Aurelia 2 applications. The examples provided illustrate how to apply each resolver using both the `@inject` decorator and static `inject` property, giving you the tools to manage dependencies effectively in any situation.
