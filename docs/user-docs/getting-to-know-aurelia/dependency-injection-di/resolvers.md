---
description: Control how dependencies are resolved in Aurelia using resolver helpers like optional, lazy, and all.
---

# Resolvers

Resolvers in Aurelia 2 are integral to the Dependency Injection (DI) system, providing various strategies for resolving dependencies. This guide will cover each resolver type, its usage, and when to use it, with detailed code examples for both the `@inject` decorator and static `inject` property methods. Additionally, we will discuss how to create custom resolvers.

## Built-in Resolvers

Aurelia 2 offers several built-in resolvers to address different dependency resolution needs. Here's how to use them with both the `@inject` decorator and static `inject` property.

### `lazy` Resolver

Use the `lazy` resolver when you want to defer the creation of a service until it's needed. This is particularly useful for expensive resources.

#### Using `@inject` Decorator

```typescript
import { lazy, inject } from '@aurelia/kernel';

@inject(lazy(MyService))
export class MyClass {
  constructor(private getMyService: () => MyService) {
    // Call getMyService() when you need an instance of MyService
  }
}
```

#### Using Static `inject` Property

```typescript
import { lazy } from '@aurelia/kernel';

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
import { all, inject } from '@aurelia/kernel';

@inject(all(MyService))
export class MyClass {
  constructor(private services: MyService[]) {
    // services is an array of MyService instances
  }
}
```

#### Using Static `inject` Property

```typescript
import { all } from '@aurelia/kernel';

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
import { optional, inject } from '@aurelia/kernel';

@inject(optional(MyService))
export class MyClass {
  constructor(private service?: MyService) {
    // service is MyService or undefined
  }
}
```

#### Using Static `inject` Property

```typescript
import { optional } from '@aurelia/kernel';

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
import { factory, inject } from '@aurelia/kernel';

@inject(factory(MyService))
export class MyClass {
  constructor(private createMyService: () => MyService) {
    // createMyService is a function to create MyService instances
  }
}
```

#### Using Static `inject` Property

```typescript
import { factory } from '@aurelia/kernel';

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
import { newInstanceForScope, inject } from '@aurelia/kernel';

@inject(newInstanceForScope(MyService))
export class MyClass {
  constructor(private service: MyService) {
    // service is a new scoped instance of MyService
  }
}
```

#### Using Static `inject` Property

```typescript
import { newInstanceForScope } from '@aurelia/kernel';

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
import { newInstanceOf, inject } from '@aurelia/kernel';

@inject(newInstanceOf(MyService))
export class MyClass {
  constructor(private service: MyService) {
    // service is a fresh instance of MyService
  }
}
```

#### Using Static `inject` Property

```typescript
import { newInstanceOf } from '@aurelia/kernel';

export class MyClass {
  static inject = [newInstanceOf(MyService)];
  constructor(private service: MyService) {
    // Similar usage as with the decorator
  }
}
```

### `last` Resolver

The last resolver is used to inject the last instance registered under a particular key. This can be useful when you need the most recently registered instance among multiple registrations of the same key.

#### Using `@inject` Decorator

```typescript
import { last, inject } from '@aurelia/kernel';

@inject(last(MyService))
export class MyClass {
  constructor(private service: MyService) {
    // service is the last registered instance of MyService
  }
}
```

#### Using Static `inject` Property

```typescript
import { last } from '@aurelia/kernel';

export class MyClass {
  static inject = [last(MyService)];
  constructor(private service: MyService) {
    // service is the last registered instance of MyService
  }
}
```

#### Example

If you have multiple instances of a service registered under the same key, `last` will ensure that you get the most recently registered instance:

```typescript
import { DI, last, Registration } from '@aurelia/kernel';

const container = DI.createContainer();
container.register(Registration.instance(MyService, new MyService('instance1')));
container.register(Registration.instance(MyService, new MyService('instance2')));
container.register(Registration.instance(MyService, new MyService('instance3')));

const latestService = container.get(last(MyService));
console.log(latestService?.name); // Logs the values from `instance3`
```

If no instances are registered under the specified key, the `last` resolver will return `undefined`:

```typescript
const container = DI.createContainer();

const maybeService = container.get(last(MyService));
console.log(maybeService); // undefined
```

### Resource-Aware Resolvers

In addition to the general-purpose resolvers above, the kernel exposes helpers that understand Aurelia's *resource* registration model (custom elements, attributes, value converters, binding behaviors, etc.). These resolvers look first in the requesting container and then optionally fall back to the root, which is essential for multi-root apps, feature modules, or shadow roots with their own DI scopes.

| Resolver | What it returns | Typical use case |
|----------|----------------|------------------|
| `resource(key)` | The matching resource from the current container, or the root if not found locally | Reuse built-in resources while still allowing feature overrides |
| `optionalResource(key)` | Same as `resource`, but returns `undefined` if the resource does not exist in either container | Optional plugin dependencies |
| `allResources(key)` | Every registration for the resource key from the current container followed by the root container | Layered component registries |
| `own(key)` | Only the registration on the requesting container (no fallback) | Prevent accidentally using a parent registration |

Because documentation now favors the `resolve()` helper, the examples below use it instead of decorators, but everything also works with `@inject`.

```typescript
import { resolve, resource, optionalResource, allResources, own } from '@aurelia/kernel';
import { CustomElement } from '@aurelia/runtime-html';

export class FeatureShell {
  // Always resolves to whatever the current component container registered
  private readonly localPanelDefinition =
    resolve(own(CustomElement.keyFrom('feature-panel')));

  // Falls back to the application root if the feature did not override the element
  private readonly sharedWidgetDefinition =
    resolve(resource(CustomElement.keyFrom('shared-widget')));

  // Optional dependency: returns undefined when neither scope registered it
  private readonly optionalToolbarDefinition =
    resolve(optionalResource(CustomElement.keyFrom('legacy-toolbar')));

  // Enumerate every registered command palette (feature + root)
  private readonly commandPaletteDefinitions =
    resolve(allResources(CustomElement.keyFrom('command-palette')));

  activate() {
    const paletteCount = this.commandPaletteDefinitions.length;
    // Use the definitions as needed...
  }
}
```

Notes:

- `CustomElement.keyFrom('name')` (and the equivalent APIs on `CustomAttribute`, `ValueConverter`, etc.) provide stable keys for the resolvers.
- Because the resolvers respect the requesting container, registering a resource in a child container automatically scopes the resolution to that container.
- Resolvers such as `own` and `optionalResource` can return `undefined`; add null checks before dereferencing the result.
- Use `own` when you deliberately want to *prevent* fallback to the root (for example, when a feature must provide its own instance to stay isolated).

## Custom Resolvers

You can create custom resolvers by implementing the `IResolver` interface. Custom resolvers give you the flexibility to implement complex resolution logic that may not be covered by the built-in resolvers.

### Example of a Custom Resolver

```typescript
import { inject } from '@aurelia/kernel';
import type { IContainer, IResolver } from '@aurelia/kernel';

class MyCustomResolver<T> implements IResolver<T> {
  public readonly $isResolver = true;

  public constructor(private readonly key: new (...args: any[]) => T) {}

  public resolve(handler: IContainer, requestor: IContainer): T {
    // Custom resolution logic here
    return new this.key();
  }
}

// Usage
@inject(new MyCustomResolver(MyService))
export class MyClass {
  public constructor(private readonly service: MyService) {
    // service is resolved using MyCustomResolver
  }
}
```

In the example above, `MyCustomResolver` is a custom resolver that creates a new instance of `MyService`. You can further customize the `resolve` method to suit your specific requirements.

By understanding and utilizing these resolvers, you can achieve a high degree of flexibility and control over the dependency injection process in your Aurelia 2 applications. The examples provided illustrate how to apply each resolver using both the `@inject` decorator and static `inject` property, giving you the tools to manage dependencies effectively in any situation.
