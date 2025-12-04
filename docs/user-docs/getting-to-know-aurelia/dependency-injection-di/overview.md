---
description: Understand Aurelia's dependency injection concepts and why containers simplify application structure.
---

# Dependency Injection (DI)

Dependency Injection (DI) is a design pattern that allows for creating objects dependent on other objects (their dependencies) without creating those dependencies themselves. It's a way of achieving loose coupling between classes and their dependencies. Aurelia provides a powerful and flexible DI system that can greatly simplify the process of wiring up the various parts of your application.

This document aims to provide comprehensive guidance on using DI in Aurelia, complete with explanations and code examples to illustrate its use in real-world scenarios.

## Understanding Dependency Injection

As a system increases in complexity, it becomes increasingly important to break complex code down into groups of smaller, collaborating functions or objects. However, once we’ve broken down a problem/solution into smaller pieces, we have introduced a new problem: how do we put the pieces together?

One approach is to have the controlling function or object directly instantiate all its dependencies. This is tedious but also introduces the bigger problem of tight coupling and muddies the controller's primary responsibility by forcing upon it a secondary concern of locating and creating all dependencies. Inversion of Control (IoC) can be employed to address these issues.

Simply put, the responsibility for locating and/or instantiating collaborators is removed from the controlling function/object and delegated to a 3rd party (the control is inverted).

Typically, this means that all dependencies become parameters of the function or object constructor, making every function/object implemented this way not only decoupled but open for extension by providing different implementations of the dependencies. Providing these dependencies to the controller is called Dependency Injection (DI).

Once again, we’re back at our original problem: how do we put all these pieces together? With the control merely inverted and open for injection, we are now stuck having to manually instantiate or locate all dependencies and supply them before calling the function or creating the object…and we must do this at every function call site or every place that the object is instanced. It seems this may be a bigger maintenance problem than we started with!

Fortunately, there is a battle-tested solution to this problem. We can use a Dependency Injection Container. With a DI container, a class can declare its dependencies and allow the container to locate and provide them to the class. Because the container can locate and provide dependencies, it can also manage the lifetime of objects, enabling singleton, transient and object pooling patterns without consumers needing to be aware of this complexity.

## When to Use Which Registration Type?

Before diving into the mechanics, here's a quick guide to help you choose the right registration type:

{% hint style="info" %}
**Default behavior**: Dependencies are **singleton by default** when resolved without explicit registration. You only need `@singleton` decorator when you want to be explicit or when registering with the container.
{% endhint %}

### Use `@singleton` (or rely on the default) when:
- ✅ You need shared state across the entire application
- ✅ The service manages application-wide resources (configuration, cache, etc.)
- ✅ The service is expensive to create and should be reused
- ✅ Examples: `CartService`, `AuthService`, `ApiClient`, `ConfigService`

### Use `@transient` when:
- ✅ Each operation needs isolated state
- ✅ The service is lightweight and cheap to create
- ✅ You need to avoid shared state between operations
- ✅ Examples: `FileProcessor`, `Validator`, `FormBuilder`

### Use `Registration.instance()` when:
- ✅ You have a pre-configured object to inject (like configuration)
- ✅ You're integrating third-party libraries
- ✅ You need compile-time values available at runtime

### Use `optional()` when:
- ✅ The dependency is truly optional (app works without it)
- ✅ You want to support pluggable features
- ✅ Examples: Analytics, feature flags, debugging tools

### Use `lazy()` when:
- ✅ You need a factory function rather than an instance
- ✅ Instantiation should be delayed until actually needed
- ✅ You need to create multiple instances with different parameters

## Constructor Injection & Declaring Injectable Dependencies

Constructor injection is the most common form of DI. It involves providing the dependencies of a class through its constructor.

### Injecting into Plain Classes

In Aurelia 2, use the `resolve()` function for dependency injection. There are two recommended approaches:

#### Using Class Properties (Recommended)

The cleanest and most flexible approach is to use class properties with `resolve()`:

```typescript
import { resolve } from '@aurelia/kernel';
import { FileReader } from './file-reader';
import { ILogger } from '@aurelia/kernel';

export class FileImporter {
  private fileReader = resolve(FileReader);
  private logger = resolve(ILogger);

  async import(filePath: string) {
    this.logger.debug(`Importing file: ${filePath}`);
    const content = await this.fileReader.read(filePath);
    // Process content...
  }
}
```

{% hint style="success" %}
**Why class properties?** This pattern works seamlessly with inheritance, keeps your code clean, and makes dependencies explicit and easy to find.
{% endhint %}

#### Using Constructor Parameters

You can also use `resolve()` in constructor parameters:

```typescript
import { resolve } from '@aurelia/kernel';
import { FileReader } from './file-reader';
import { ILogger } from '@aurelia/kernel';

export class FileImporter {
  constructor(
    private fileReader = resolve(FileReader),
    private logger = resolve(ILogger)
  ) {}

  async import(filePath: string) {
    this.logger.debug(`Importing file: ${filePath}`);
    const content = await this.fileReader.read(filePath);
    // Process content...
  }
}
```

{% hint style="warning" %}
**Never use decorator syntax in constructor parameters** like `@inject()` or `@ILogger`. Always use `resolve()` instead.
{% endhint %}

<!-- #### Using Compiler Metadata

If you use TypeScript and have enabled metadata emission, you can leverage the TypeScript compiler to deduce the types to inject:

```typescript
import { inject, FileReader, Logger } from '@aurelia/kernel';

@inject()
export class FileImporter {
  constructor(private fileReader: FileReader, private logger: Logger) {
    // Constructor logic here
  }
}
```
{% hint style="info" %}
Any decorator on a class will trigger TypeScript to emit type metadata, which Aurelia's DI can use.
{% endhint %} -->

### Creating Containers

An Aurelia application typically has a single root-level DI container. To create one:

```typescript
import { DefaultResolver, DI } from '@aurelia/kernel';

const container = DI.createContainer({
  inheritParentResources: true,
  defaultResolver: DefaultResolver.transient
});
```

- `inheritParentResources` copies resource registrations from the parent container, which is useful for shadow DOM scopes or feature modules that need the same value converters and custom elements.
- `defaultResolver` changes the implicit registration strategy for unknown classes. The default singleton strategy caches one instance per container; replacing it with `DefaultResolver.transient` forces a fresh instance per resolve call. Use `DefaultResolver.none` if you want the container to throw when something tries to resolve a class that has not been registered explicitly.

Child containers can pass the same options to `createChild({...})` when they need different behavior than the root.

### Registering Services

In Aurelia, services can be registered with the container using the `register` API:

```typescript
import { DI, Registration } from '@aurelia/kernel';

const container = DI.createContainer();
container.register(
  Registration.singleton(ProfileService, ProfileService),
  Registration.instance(fetch, fakeFetch)
);
```

The `register` method allows you to associate a key with a value, which can be a singleton, transient, instance, callback, or alias.

### Deregister Services

In Aurelia, services can be deregistered from the container using the `deregister` API:

```typescript
import { DI, Registration } from '@aurelia/kernel';

const container = DI.createContainer();
container.register(
  Registration.singleton(ProfileService, ProfileService),
  Registration.instance(fetch, fakeFetch)
);

container.deregister(fetch);
```

The `deregister` method allows you to remove a service from the container.

### Resolving Services

Services are usually resolved automatically via constructor injection. However, you can also resolve them manually:

```typescript
const profileService: ProfileService = container.get(ProfileService);
```

For multiple implementations, use `getAll`:

```typescript
const panels: Panel[] = container.getAll(Panel);
```

### Using Interfaces

Since TypeScript interfaces do not exist at runtime, you can use a symbol to represent the interface:

```typescript
export const IProfileService = Symbol('IProfileService');
export interface IProfileService { /* ... */ }
```

Using `DI.createInterface()`, you can create an interface token that also strongly types the return value of `get`:

```typescript
export const IProfileService = DI.createInterface<IProfileService>();
export interface IProfileService {
    // Interface definition
}
```

#### Default Interface Implementations

`DI.createInterface()` can take a callback to provide a default implementation:

```typescript
export const ITaskQueue = DI.createInterface<ITaskQueue>(x => x.singleton(TaskQueue));
export interface ITaskQueue {
    // Interface definition
}
```

Keep in mind that default implementations become visible only after the token itself is registered with the container. Resolvers such as `optional(ITaskQueue)` or `resolve(all(ITaskQueue))` do **not** trigger the default callback until you call `container.register(ITaskQueue)` (see packages/kernel/src/di.ts for the rationale). This prevents accidental creation of optional services when nothing registered them on purpose.

### Property Injection

When inheritance is involved, constructor injection may not suffice. Property injection using the `resolve` function can be used in such cases:

```typescript
import { resolve } from '@aurelia/kernel';

abstract class FormElementBase {
  form = resolve(Element);
  formController = resolve(FormController);
}

export class MyInput extends FormElementBase {
  constructor() {
    super();
    // Additional setup
  }
}
```

### Other `resolve` Usages

`resolve` can also be used in factory functions or other setup logic, and it supports resolving tuples when you pass multiple keys at once:

```typescript
import { resolve, all } from '@aurelia/kernel';

export function useFieldListeners(field) {
  const [listeners, logger] = resolve(all(IFieldListeners), ILogger);
  // Further logic
}
```

Remember, `resolve` must be used within an active DI container context.

## Migrating from v1 to v2

For those migrating from Aurelia 1, most concepts remain the same, but it is recommended to create explicit injection tokens with `DI.createInterface` for better forward compatibility and consumer friendliness.

```typescript
import { DI } from '@aurelia/kernel';

export interface ApiClient {
  get<T>(path: string): Promise<T>;
}

// `IApiClient` is a token value returned by `DI.createInterface`, not a TS interface.
export const IApiClient = DI.createInterface<ApiClient>('IApiClient', x => x.singleton(ApiClient));
```

The `IApiClient` constant is what you register with the container and later ask for. When you call `DI.createInterface` you can optionally provide a default registration callback, as shown above, so that the token is automatically wired to a concrete implementation the first time it is requested. If you prefer to register manually you can omit the second argument and use `Registration.singleton(IApiClient, ApiClient)` instead.

## Injecting an Interface

You can inject an interface token using `resolve()`:

```typescript
import { resolve } from '@aurelia/kernel';
import type { ApiClient } from './api-client';
import { IApiClient } from './tokens';

export class MyComponent {
  private readonly api = resolve(IApiClient);

  async loadData() {
    const data = await this.api.get<User[]>('/users');
    // Use data...
  }
}
```

You can also use `resolve()` in constructor parameters:

```typescript
import { resolve } from '@aurelia/kernel';
import type { ApiClient } from './api-client';
import { IApiClient } from './tokens';

export class MyComponent {
  constructor(private readonly api = resolve(IApiClient)) {}

  async loadData() {
    const data = await this.api.get<User[]>('/users');
    // Use data...
  }
}
```

{% hint style="info" %}
When you inject via `resolve`, remember that you are resolving the **token value**. In the example above `IApiClient` refers to the token exported from your application code, not to a TypeScript-only interface declaration.
{% endhint %}

## Registration Types

You can explicitly create resolvers and decorators to control how dependencies are registered. `Registration` ships several helpers (packages/kernel/src/di.registration.ts):

| Helper | Description |
| --- | --- |
| `Registration.instance(key, value)` | Always returns the provided object. |
| `Registration.singleton(key, Type)` | Lazily constructs one instance per container. |
| `Registration.transient(key, Type)` | Creates a fresh instance on every resolution. |
| `Registration.callback(key, fn)` | Runs the callback each time; the callback can pull other services from the container. |
| `Registration.cachedCallback(key, fn)` | Runs once per container and caches the result. |
| `Registration.aliasTo(existingKey, aliasKey)` | Resolves an alias by redirecting to the original key. |
| `Registration.defer(extension, ...params)` | Defers registration to another registry (used by the HTML preprocessor for CSS, SVG, etc.). |

Example:

```typescript
container.register(
  Registration.singleton(ISessionService, SessionService),
  Registration.cachedCallback(IApiClient, buildClient),
  Registration.aliasTo(ISessionService, IUserSession)
);
```

Need bespoke construction logic? Use `container.registerFactory(...)` to plug in a custom factory and `container.registerTransformer(...)` to decorate resolved instances. The runtime exposes both APIs via `IContainer` (see packages/kernel/src/di.container.ts for details).

Decorators can also be used to register classes in the root or requesting container:

```typescript
@singleton
export class SomeClass {}

@singleton({ scoped: true })
export class SomeClass {}
```

## Customizing Injection

You can customize how dependencies are injected using additional decorators:

```typescript
export class MyComponent {
  private sinks: ISink[] = resolve(all(ISink));
  private getFoo: () => IFoo = resolve(lazy(IFoo));
  // And so on...
}
```

## Common DI Patterns

### Pattern: Singleton Service with State

**Use case**: You need a service that maintains state across your entire application.

```typescript
import { resolve } from '@aurelia/kernel';
import { IEventAggregator } from '@aurelia/kernel';
import { observable } from 'aurelia';

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

// No @singleton needed - services are singleton by default!
export class CartService {
  private ea = resolve(IEventAggregator);

  @observable items: CartItem[] = [];

  itemsChanged() {
    // Notify app when cart changes
    this.ea.publish('cart:updated', {
      itemCount: this.items.length,
      total: this.total
    });
  }

  get total(): number {
    return this.items.reduce((sum, item) =>
      sum + (item.price * item.quantity), 0
    );
  }

  addItem(productId: string, price: number) {
    const existing = this.items.find(i => i.productId === productId);
    if (existing) {
      existing.quantity++;
    } else {
      this.items.push({ productId, quantity: 1, price });
    }
  }

  clear() {
    this.items = [];
  }
}
```

**Why this works**: Services are singleton by default in Aurelia, so all components automatically share the same `CartService` instance, maintaining consistent state across the app. You can add `@singleton` explicitly if you prefer, but it's not required.

### Pattern: Service Composition

**Use case**: You have a high-level service that depends on other services.

```typescript
import { resolve, singleton } from '@aurelia/kernel';
import { IHttpClient } from '@aurelia/fetch-client';
import { ILogger } from '@aurelia/kernel';

export interface User {
  id: string;
  name: string;
  email: string;
}

// Singleton by default - no decorator needed
export class UserService {
  private http = resolve(IHttpClient);
  private logger = resolve(ILogger);
  private cache = new Map<string, User>();

  async getUser(id: string): Promise<User> {
    // Check cache first
    if (this.cache.has(id)) {
      this.logger.debug(`Cache hit for user ${id}`);
      return this.cache.get(id)!;
    }

    // Fetch from API
    this.logger.debug(`Fetching user ${id} from API`);
    try {
      const response = await this.http.fetch(`/api/users/${id}`);
      const user = await response.json() as User;
      this.cache.set(id, user);
      return user;
    } catch (error) {
      this.logger.error(`Failed to fetch user ${id}`, error);
      throw new Error(`Unable to load user ${id}`);
    }
  }

  clearCache() {
    this.cache.clear();
  }
}
```

**Why this works**: Service composition lets you build complex functionality from smaller, focused services. Each dependency is resolved automatically.

### Pattern: Transient Services

**Use case**: You need a fresh instance every time (e.g., for isolating state per operation).

```typescript
import { transient, resolve } from '@aurelia/kernel';
import { ILogger } from '@aurelia/kernel';

@transient
export class FileProcessor {
  private logger = resolve(ILogger);
  private processed = 0;

  async process(files: File[]): Promise<void> {
    this.logger.info(`Processing ${files.length} files`);

    for (const file of files) {
      await this.processFile(file);
      this.processed++;
    }

    this.logger.info(`Completed processing ${this.processed} files`);
  }

  private async processFile(file: File): Promise<void> {
    // Processing logic...
  }
}

// Usage in a component:
export class UploadComponent {
  private processorFactory = resolve(FileProcessor);

  async handleUpload(files: File[]) {
    // Each upload gets its own processor instance
    const processor = this.processorFactory;
    await processor.process(files);
  }
}
```

**Why this works**: Each component gets its own instance, preventing state leakage between operations.

### Pattern: Optional Dependencies

**Use case**: You want to use a service if it's available, but don't require it.

```typescript
import { resolve, optional } from '@aurelia/kernel';
import { IAnalyticsService } from './analytics';

export class ProductPage {
  private analytics = resolve(optional(IAnalyticsService));

  viewProduct(productId: string) {
    // Track view only if analytics is configured
    if (this.analytics) {
      this.analytics.trackEvent('product_viewed', { productId });
    }

    // Continue with main logic
    this.loadProduct(productId);
  }

  private loadProduct(productId: string) {
    // Load product...
  }
}
```

**Why this works**: Your code works whether the optional service is registered or not, making features truly optional.

### Pattern: Factory Functions

**Use case**: You need to create instances with runtime parameters.

```typescript
import { resolve, lazy } from '@aurelia/kernel';
import { IDialogService } from '@aurelia/dialog';

export class NotificationService {
  private getDialog = resolve(lazy(IDialogService));

  async showConfirmation(message: string): Promise<boolean> {
    const dialog = this.getDialog();
    const result = await dialog.open({
      component: () => import('./confirm-dialog'),
      model: { message }
    });

    return result.wasCancelled === false;
  }
}
```

**Why this works**: The `lazy()` resolver gives you a factory function, delaying instantiation until you need it.

## Extending Types for Injection

For injecting objects like `Window` with additional properties:

```typescript
export interface IReduxDevTools extends Window {
  devToolsExtension?: DevToolsExtension;
}

export class MyComponent {
  private window: IReduxDevTools = resolve(IWindow);
}
```

### Scoped providers with `InstanceProvider`

When you need to expose a specific instance (such as the current router context or DOM host) to descendants, create an `InstanceProvider` and register it as the resolver for your token. Aurelia does this internally for controllers, hydration contexts, and router scopes (see packages/runtime-html/src/templating/controller.ts and packages/router/src/route-context.ts).

```typescript
import { DI, IContainer, InstanceProvider } from '@aurelia/kernel';

export interface FeatureScope { id: string; }
export const IFeatureScope = DI.createInterface<FeatureScope>('IFeatureScope');

export function createFeatureContainer(parent: IContainer, id: string) {
  const child = parent.createChild();
  const provider = new InstanceProvider<FeatureScope>('IFeatureScope');
  child.registerResolver(IFeatureScope, provider, true);
  provider.prepare({ id });
  return child;
}
```

- The provider’s `prepare` method updates the instance at runtime.
- Passing `true` as the third argument to `registerResolver` asks the container to dispose the provider automatically when the child container is destroyed.

By following these guidelines and utilizing the powerful features of Aurelia's DI system, you can build a well-architected application with cleanly separated concerns and easily manageable dependencies.
