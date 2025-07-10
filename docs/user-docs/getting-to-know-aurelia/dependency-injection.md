# Dependency Injection (DI)

Dependency Injection (DI) is a design pattern that enables classes to receive their dependencies from an external source rather than instantiating them directly. This inversion of control simplifies wiring up your application, promotes loose coupling, and enables advanced patterns such as singleton, transient, and scoped lifetimes. In Aurelia, DI is a core feature that not only manages the creation and resolution of dependencies but also provides powerful strategies—called resolvers—to control how dependencies are delivered.

---

## Table of Contents

- [Overview](#overview)
- [Constructor Injection & Declaring Dependencies](#constructor-injection--declaring-dependencies)
- [Creating Containers and Registering Services](#creating-containers-and-registering-services)
- [Resolving Services](#resolving-services)
- [Using Interfaces & Injection Tokens](#using-interfaces--injection-tokens)
- [Property Injection](#property-injection)
- [Resolvers](#resolvers)
  - [Built-in Resolvers Summary](#built-in-resolvers-summary)
  - [Custom Resolvers](#custom-resolvers)
- [Creating Injectable Services](#creating-injectable-services)
- [Registration Types & Customizing Injection](#registration-types--customizing-injection)
- [Scope & Container Hierarchies](#scope--container-hierarchies)
- [Advanced Registration Helpers](#advanced-registration-helpers)
- [Decorators & Helper Functions](#decorators--helper-functions)
- [Migrating from v1 to v2](#migrating-from-v1-to-v2)
- [Container Disposal & Lifecycle Management](#container-disposal--lifecycle-management)
- [Container Configuration & Advanced Options](#container-configuration--advanced-options)
- [Container Introspection & Utility Methods](#container-introspection--utility-methods)
- [Testing with Dependency Injection](#testing-with-dependency-injection)
- [Real-world Architecture Patterns](#real-world-architecture-patterns)

---

## Overview

Dependency Injection is a design pattern that decouples object creation from business logic. Instead of a class instantiating its own dependencies, those dependencies are provided by an external DI container. This approach:

- **Improves testability:** You can inject mocks or stubs for unit testing.
- **Promotes loose coupling:** Classes depend on abstractions rather than concrete implementations.
- **Manages lifetimes:** The DI container controls the lifetime of objects (singleton, transient, scoped, etc.).
- **Facilitates configuration:** Changing implementations or registration strategies is centralized.

In Aurelia 2, the DI container not only instantiates classes but also resolves dependencies based on metadata declared via constructor parameters, static properties, or decorators.

---

## Constructor Injection & Declaring Dependencies

### Injecting into Plain Classes

Aurelia supports several approaches for declaring dependencies:

### Using a Static Property

Define dependencies by setting a `static inject` property that lists the dependencies in the same order as the constructor parameters.

```typescript
import { FileReader, Logger } from 'your-dependencies-path';

export class FileImporter {
  public static readonly inject = [FileReader, Logger];

  constructor(private fileReader: FileReader, private logger: Logger) {
    // Constructor logic here
  }
}
```

> **Warning:** The order in the `inject` array must match the constructor parameters.

### Using Decorators

Leverage the `@inject` decorator for a more declarative style.

```typescript
import { inject, FileReader, Logger } from 'aurelia';

@inject(FileReader, Logger)
export class FileImporter {
  constructor(private fileReader: FileReader, private logger: Logger) {
    // Constructor logic here
  }
}
```

---

## Creating Containers and Registering Services

### Creating a DI Container

A typical Aurelia application has a single root-level DI container:

```typescript
import { DI } from 'aurelia';

const container = DI.createContainer();
```

### Registering Services

Register services with the container using the `register` API. This associates a key with a value (or class) and controls its lifetime.

```typescript
import { DI, Registration } from 'aurelia';

const container = DI.createContainer();
container.register(
  Registration.singleton(ProfileService, ProfileService),
  Registration.instance(fetch, fakeFetch)
);
```

### Deregistering Services

You can also remove a service from the container when needed:

```typescript
container.deregister(fetch);
```

---

## Resolving Services

Although constructor injection is the norm, you can manually resolve services from the container:

- **Single instance:**
  ```typescript
  const profileService: ProfileService = container.get(ProfileService);
  ```

- **Multiple implementations:**
  ```typescript
  const panels: Panel[] = container.getAll(Panel);
  ```

---

## Using Interfaces & Injection Tokens

Since TypeScript interfaces don't exist at runtime, use symbols or tokens for injection.

### Using Symbols

```typescript
export const IProfileService = Symbol('IProfileService');
export interface IProfileService { /* ... */ }
```

### Using `DI.createInterface()`

Create a strongly typed injection token that can also provide a default implementation:

#### With a Default Implementation

```typescript
import { DI } from 'aurelia';

export class LoggerService {
  log(message: string) {
    console.log(message);
  }
}

// Create an injection token with a default registration as a singleton.
export const ILoggerService = DI.createInterface<ILoggerService>(
  'ILoggerService',
  x => x.singleton(LoggerService)
);

// Export type equal to the class to serve as an interface.
export type ILoggerService = LoggerService;
```

#### Without a Default Implementation

```typescript
import { DI } from 'aurelia';

export class LoggerService {
  log(message: string) {
    // Logging logic
  }
}

// Export type equal to the class.
export type ILoggerService = LoggerService;

// Create an interface token without a default; register it manually later.
export const ILoggerService = DI.createInterface<ILoggerService>('ILoggerService');
```

Then register the implementation with the container:

```typescript
import { Registration } from 'aurelia';

container.register(
  Registration.singleton(ILoggerService, LoggerService)
);
```

---

## Property Injection

For cases like inheritance where constructor injection may not suffice, use property injection via the `resolve` function:

```typescript
import { resolve } from 'aurelia';

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

You can also use `resolve` in factory functions:

```typescript
import { resolve, all } from 'aurelia';

export function useFieldListeners(field) {
  const listeners = resolve(all(IFieldListeners));
  // Further logic
}
```

> **Note:** `resolve` must be used within an active DI container context.

---

## Resolvers

Resolvers in Aurelia 2 provide strategies for how dependencies are resolved. They give you granular control over instance creation and lifetime management.

### Built-in Resolvers Summary

The table below summarizes the built-in resolvers available in Aurelia:

| **Resolver**              | **Purpose**                                                                                   | **Usage**                                                                |
|---------------------------|-----------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| **lazy**                  | Delays creation of a service until it is needed.                                              | `@inject(lazy(MyService))` or `static inject = [lazy(MyService)]`         |
| **all**                   | Injects an array of all instances registered under a particular key.                           | `@inject(all(MyService))` or `static inject = [all(MyService)]`           |
| **optional**              | Injects the service if available, otherwise `undefined`.                                     | `@inject(optional(MyService))` or `static inject = [optional(MyService)]` |
| **factory**               | Provides a function to create instances, offering control over instantiation.                  | `@inject(factory(MyService))` or `static inject = [factory(MyService)]`   |
| **newInstanceForScope**   | Provides a unique instance within a particular scope (e.g., component or sub-container).         | `@inject(newInstanceForScope(MyService))`                              |
| **newInstanceOf**         | Always creates a fresh instance, regardless of existing registrations.                       | `@inject(newInstanceOf(MyService))`                                     |
| **last**                  | Injects the most recently registered instance among multiple registrations.                  | `@inject(last(MyService))`                                              |
| **own**                   | Injects the dependency only if it is registered **in the current container** (does not search ancestors); otherwise `undefined`. | `@inject(own(MyService))` |
| **ignore**                | Tells the container to ignore this dependency and inject `undefined`. Useful for optional parameters you plan to populate manually. | `@inject(ignore)` |
| **resource**              | Resolves a key using *resource semantics*: first the current container, then falls back to the root container. | `@inject(resource('my-resource-key'))` |
| **optionalResource**      | Same as `resource` but returns `undefined` when the key cannot be resolved. | `@inject(optionalResource(MyService))` |
| **allResources**          | Retrieves **all** instances for a resource key from both the current and root containers, without duplicates. | `@inject(allResources(MyService))` |

Each resolver can be used with both the `@inject` decorator and the static `inject` property. Below are detailed examples for a few of them.

### Examples

#### Lazy Resolver

```typescript
import { lazy, inject } from 'aurelia';

@inject(lazy(MyService))
export class MyClass {
  constructor(private getMyService: () => MyService) {
    // Call getMyService() when you need an instance of MyService
  }
}
```

#### All Resolver

```typescript
import { all, inject } from 'aurelia';

@inject(all(MyService))
export class MyClass {
  constructor(private services: MyService[]) {
    // services is an array of MyService instances
  }
}
```

#### Optional Resolver

```typescript
import { optional, inject } from 'aurelia';

@inject(optional(MyService))
export class MyClass {
  constructor(private service?: MyService) {
    // service is MyService or undefined
  }
}
```

#### Factory Resolver

```typescript
import { factory, inject } from 'aurelia';

@inject(factory(MyService))
export class MyClass {
  constructor(private createMyService: () => MyService) {
    // createMyService is a function to create MyService instances
  }
}
```

#### newInstanceForScope Resolver

```typescript
import { newInstanceForScope, inject } from 'aurelia';

@inject(newInstanceForScope(MyService))
export class MyClass {
  constructor(private service: MyService) {
    // service is a new scoped instance of MyService
  }
}
```

#### newInstanceOf Resolver

```typescript
import { newInstanceOf, inject } from 'aurelia';

@inject(newInstanceOf(MyService))
export class MyClass {
  constructor(private service: MyService) {
    // service is a fresh instance of MyService
  }
}
```

#### Last Resolver

```typescript
import { last, inject } from 'aurelia';

@inject(last(MyService))
export class MyClass {
  constructor(private service: MyService) {
    // service is the last registered instance of MyService
  }
}
```

##### Last Resolver Example with Multiple Registrations

```typescript
import { DI, IContainer, last, Registration } from 'aurelia';

const container = DI.createContainer();
container.register(Registration.instance(MyService, new MyService('instance1')));
container.register(Registration.instance(MyService, new MyService('instance2')));
container.register(Registration.instance(MyService, new MyService('instance3')));

const myClass = container.get(last(MyService));
console.log(myClass.service); // Outputs: instance3
```

If no instances are registered, the last resolver returns `undefined`:

```typescript
const container = DI.createContainer();
const myClass = container.get(last(MyClass));
console.log(myClass.service); // Outputs: undefined
```

#### own & ignore Resolver Examples

```typescript
import { inject, own, ignore } from 'aurelia';

@inject(own(Logger), ignore)
export class MyComponent {
  constructor(
    private localLogger?: Logger,            // Resolved only if the logger is registered in *this* container
    private unused?: unknown                 // Always `undefined` – DI will skip this parameter
  ) {}
}
```

#### resource-based Resolvers

```typescript
import { inject, resource, optionalResource, allResources } from 'aurelia';

@inject(resource('my-plugin:config'))
export class PluginConsumer {
  constructor(private config: PluginConfig) {}
}

@inject(optionalResource(Service))
export class FallbackConsumer {
  constructor(private maybeService?: Service) {}
}

@inject(allResources(IValidationRule))
export class ValidatorRegistry {
  constructor(private rules: IValidationRule[]) {}
}
```

---

### Custom Resolvers

You can create custom resolvers by implementing the `IResolver` interface to handle complex resolution logic.

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

// Usage with the @inject decorator:
@inject(new MyCustomResolver(MyService))
export class MyClass {
  constructor(private service: MyService) {
    // service is resolved using MyCustomResolver
  }
}
```

---

## Creating Injectable Services

Building maintainable applications in Aurelia often involves creating services that encapsulate shared functionality (business logic, data access, etc.). There are several approaches to define injectable services.

### Using `DI.createInterface()` to Create Injectable Services

This method creates an injection token that doubles as a type and, optionally, provides a default implementation.

#### With a Default Implementation

```typescript
import { DI } from 'aurelia';

export class LoggerService {
  log(message: string) {
    console.log(message);
  }
}

export const ILoggerService = DI.createInterface<ILoggerService>(
  'ILoggerService',
  x => x.singleton(LoggerService)
);

// Export type equal to the class to serve as an interface.
export type ILoggerService = LoggerService;
```

#### Without a Default Implementation

```typescript
import { DI } from 'aurelia';

export class LoggerService {
  log(message: string) {
    // Logging logic
  }
}

// Export type equal to the class.
export type ILoggerService = LoggerService;

// Create an interface token without a default; register later.
export const ILoggerService = DI.createInterface<ILoggerService>('ILoggerService');
```

Then register the service with the container:

```typescript
import { Registration } from 'aurelia';

container.register(
  Registration.singleton(ILoggerService, LoggerService)
);
```

### Exporting Classes Directly for Injectable Services

For services that do not require an abstraction, simply export the class.

#### Simple Class Export

```typescript
export class AuthService {
  isAuthenticated(): boolean {
    // Authentication logic
    return true;
  }
}
```

Register if needed:

```typescript
import { Registration } from 'aurelia';

container.register(
  Registration.singleton(AuthService, AuthService)
);
```

#### Decorator-based Registration

Use decorators like `@singleton()` for auto-registration.

```typescript
import { singleton } from 'aurelia';

@singleton()
export class AuthService {
  isAuthenticated(): boolean {
    // Authentication logic
    return true;
  }
}
```

#### Exporting a Type Equal to the Class

This approach reduces redundancy by using the class as its own interface.

```typescript
export class PaymentProcessor {
  processPayment(amount: number) {
    // Payment processing logic
  }
}

// Export type equal to the class.
export type IPaymentProcessor = PaymentProcessor;
```

Then use it for injection:

```typescript
import { resolve } from 'aurelia';

export class CheckoutService {
  private paymentProcessor: IPaymentProcessor = resolve(IPaymentProcessor);
  // Use paymentProcessor
}
```

---

## Registration Types & Customizing Injection

Aurelia's DI system offers various registration types to control how services are instantiated:

| **Registration Type** | **Description**                                    | **Example**                                        |
|-----------------------|----------------------------------------------------|----------------------------------------------------|
| **singleton**         | One instance per container.                        | `Registration.singleton(MyService, MyService)`     |
| **transient**         | A new instance is created every time.              | `Registration.transient(MyService, MyService)`     |
| **instance**          | Registers a pre-created instance.                  | `Registration.instance(MyService, myServiceInstance)` |

Decorators can also be used to register classes:

```typescript
@singleton
export class SomeClass {}
```

You can further customize injection by using additional decorators and helper functions:

```typescript
@inject(SettingsService)
export class Widget {
  constructor(private settings: SettingsService) {}
}
```

For extending built-in objects, you might define interfaces that augment native types:

```typescript
export interface IReduxDevTools extends Window {
  devToolsExtension?: DevToolsExtension;
}

export class MyComponent {
  private window: IReduxDevTools = resolve(IWindow);
}
```

---

## Scope & Container Hierarchies

Aurelia allows you to create *child containers* that inherit registrations from their parent but can also override or extend them. This is useful for per-component or per-request scoping.

```typescript
import { DI } from 'aurelia';

const root = DI.createContainer();
root.register(Registration.singleton(ApiClient, ApiClient));

// Create a child container for a specific workflow
const child = root.createChild();
child.register(Registration.instance(CurrentUser, new CurrentUser('alice')));

const rootApi = root.get(ApiClient);   // shared singleton
const childApi = child.get(ApiClient); // same instance as rootApi
const user = child.get(CurrentUser);   // only registered in the child
```

### ContainerConfiguration

When calling `createChild`, you can tweak behaviour via an optional `ContainerConfiguration` object:

* `inheritParentResources` – if `true`, resource keys registered in the parent are automatically available in the child (default: `false`).
* `defaultResolver` – a function that decides how unknown keys should be auto-registered. The built-in presets are `DefaultResolver.singleton`, `DefaultResolver.transient`, or you can supply your own.

```typescript
const scoped = root.createChild({ inheritParentResources: true });
```

Child containers are fully disposable: calling `dispose()` on a container releases any disposable resolvers that were registered with it.

---

## Advanced Registration Helpers

The `Registration` API offers several helpers beyond the common *singleton*/*transient* patterns:

| Helper | Description | Example |
|--------|-------------|---------|
| **callback** | Uses a factory function to create a new instance every time the key is resolved. | `Registration.callback(Logger, () => new Logger('debug'))` |
| **cachedCallback** | Like `callback`, but the *first* invocation is cached and returned for all subsequent resolutions (per container tree). | `Registration.cachedCallback(Config, buildConfig)` |
| **aliasTo** | Registers an *alias key* that resolves to an existing registration. | `Registration.aliasTo(IApi, ApiClient)` |

These helpers can be freely mixed with `container.register(...)` calls.

### When to Use Each Helper

* **callback** – ideal when you need a *new* instance on every resolution **and** the creation logic is more complex than `new SomeClass()`.

  ```typescript
  const randomId = () => Math.random().toString(36).slice(2);
  container.register(
    Registration.callback(UserId, () => randomId()) // every injection gets a new id
  );
  ```

* **cachedCallback** – similar to `callback` but caches the first result. Useful for *expensive* computations or singletons created lazily.

  ```typescript
  function buildConfig() {
    // heavy I/O or computation
    return fetch('/config.json').then(r => r.json());
  }

  container.register(
    Registration.cachedCallback(AppConfig, buildConfig)
  );
  // The HTTP request is performed only once, even if AppConfig is resolved multiple times.
  ```

* **aliasTo** – create semantic aliases or backwards-compatibility keys without duplicating registrations.

  ```typescript
  container.register(
    Registration.singleton(ApiClient, ApiClient),
    Registration.aliasTo(IApi, ApiClient) // both keys resolve to the same singleton
  );
  ```



---

## Decorators & Helper Functions

Aurelia ships with convenient decorators that combine registration *and* typing:

```typescript
import { singleton, transient, inject } from 'aurelia';

@singleton()
export class SettingsService {}

@transient()
@inject(SettingsService)
export class Widget {
  constructor(private settings: SettingsService) {}
}
```

* `@singleton()` – registers the class as a singleton; pass `{ scoped: true }` to make it per-requestor instead of global.
* `@transient()` – registers the class as transient.
* `@inject(...keys)` – explicit constructor/property injection (alternative to static `inject`).

If you need to register a class *outside* of a decorator (for example in unit tests), you can use the functional helpers:

```typescript
DI.singleton(MyService);
DI.transient(MyOtherService);
```

These helpers attach a static `register` method to the class, allowing you to include it directly in module-level `container.register(...)` calls.

---

## Migrating from v1 to v2

Many DI concepts remain consistent between Aurelia 1 and Aurelia 2. However, it is recommended to use `DI.createInterface()` to create injection tokens for better forward compatibility and improved type safety. When injecting interfaces, you can use decorators or resolve functions directly:

```typescript
export class MyComponent {
  private api: IApiClient = resolve(IApiClient);
}

// In future iterations, constructor injection may suffice:
export class MyComponent {
  constructor(private api: IApiClient) {}
}
```

---

## Container Disposal & Lifecycle Management

Proper container lifecycle management is crucial for preventing memory leaks and ensuring clean application shutdown. Aurelia's DI system provides comprehensive disposal mechanisms for both containers and their managed resources.

### Container Disposal

Containers should be disposed when they're no longer needed to free up resources and prevent memory leaks:

```typescript
import { DI } from 'aurelia';

const container = DI.createContainer();
// ... use container
container.dispose(); // Cleans up all resolvers and disposable resources
```

### Disposable Resolvers

When registering resolvers, you can mark them as disposable to ensure proper cleanup:

```typescript
import { DI, Registration } from 'aurelia';

const container = DI.createContainer();

// Register a disposable resolver
const disposableResolver = Registration.instance(MyService, new MyService());
container.registerResolver(MyService, disposableResolver, true); // true = isDisposable

// Later, dispose only disposable resolvers
container.disposeResolvers();
```

### Child Container Disposal

Child containers inherit disposal behavior but can be managed independently:

```typescript
const parent = DI.createContainer();
const child = parent.createChild();

// Register disposable services in child
child.register(
  Registration.instance(ChildService, new ChildService())
);

// Dispose only child resources
child.disposeResolvers();

// Or dispose the entire child container
child.dispose();

// Parent remains unaffected
```

### Aurelia Application Lifecycle

In Aurelia applications, follow the proper shutdown sequence:

```typescript
import { Aurelia } from 'aurelia';

const aurelia = new Aurelia();

try {
  await aurelia
    .app({ host: document.querySelector('#app'), component: MyApp })
    .start();

  console.log('Application started');

  // ... application runs ...

} finally {
  // Proper shutdown sequence
  await aurelia.stop();  // Stop application first
  aurelia.dispose();     // Then dispose container and resources
}
```

### Custom Disposable Services

Create disposable services by implementing cleanup logic:

```typescript
import { IDisposable } from 'aurelia';

export class DatabaseConnection implements IDisposable {
  private connection: Connection;

  constructor() {
    this.connection = createConnection();
  }

  dispose(): void {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
  }
}

// Register as disposable
container.registerResolver(
  DatabaseConnection,
  Registration.singleton(DatabaseConnection, DatabaseConnection),
  true // Mark as disposable
);
```

---

## Container Configuration & Advanced Options

Aurelia's DI containers can be configured with advanced options to control behavior like resource inheritance and default resolution strategies.

### Container Configuration Options

The `IContainerConfiguration` interface provides several important options:

```typescript
import { DI, DefaultResolver } from 'aurelia';

// Create container with custom configuration
const container = DI.createContainer({
  inheritParentResources: true,
  defaultResolver: DefaultResolver.transient
});
```

### Resource Inheritance

Control how child containers inherit resources from their parents:

```typescript
// Default behavior: inherit only from root container
const defaultChild = parent.createChild();

// Inherit resources from immediate parent
const inheritingChild = parent.createChild({
  inheritParentResources: true
});

// Example with resource registration
parent.register(Registration.singleton('parent:service:logger', LoggerService));
grandParent.register(Registration.singleton('root:service:config', ConfigService));

// defaultChild can access root:service:config but not parent:service:logger
// inheritingChild can access both
```

### Default Resolver Strategies

Configure how unregistered dependencies are auto-resolved:

```typescript
// Singleton by default (default behavior)
const singletonContainer = DI.createContainer({
  defaultResolver: DefaultResolver.singleton
});

// Transient by default
const transientContainer = DI.createContainer({
  defaultResolver: DefaultResolver.transient
});

// Throw error for unregistered dependencies
const strictContainer = DI.createContainer({
  defaultResolver: DefaultResolver.none
});

// Custom resolver logic
const customContainer = DI.createContainer({
  defaultResolver: (key: Key, handler: IContainer) => {
    // Custom logic for auto-registration
    if (isService(key)) {
      return new Resolver(key, ResolverStrategy.singleton, key);
    }
    return new Resolver(key, ResolverStrategy.transient, key);
  }
});
```

### Configuration Inheritance

Child containers inherit configuration from their parents by default:

```typescript
const parent = DI.createContainer({
  defaultResolver: DefaultResolver.transient
});

const child = parent.createChild(); // Inherits transient default resolver

// Override configuration for specific child
const customChild = parent.createChild({
  defaultResolver: DefaultResolver.singleton,
  inheritParentResources: false
});
```

### Container Depth and Performance

Consider container hierarchy depth for performance:

```typescript
// Access container depth
console.log(`Container depth: ${container.depth}`);

// Shallow hierarchies perform better
const efficientHierarchy = root.createChild().createChild(); // Depth: 2

// Deep hierarchies can impact resolution performance
// Avoid excessively deep nesting when possible
```

---

## Container Introspection & Utility Methods

Aurelia's DI containers provide powerful introspection and utility methods for examining and manipulating registered dependencies.

### Checking Registration Status

Use the `has()` method to check if a key is registered:

```typescript
import { DI } from 'aurelia';

const container = DI.createContainer();
container.register(Registration.singleton(MyService, MyService));

// Check in current container only
if (container.has(MyService)) {
  console.log('MyService is registered in this container');
}

// Check in current container and ancestors
if (container.has(MyService, true)) {
  console.log('MyService is registered somewhere in the hierarchy');
}
```

### Retrieving Multiple Implementations

Get all registered implementations for a key:

```typescript
// Register multiple implementations
container.register(
  Registration.instance(IPlugin, new DatabasePlugin()),
  Registration.instance(IPlugin, new CachePlugin()),
  Registration.instance(IPlugin, new LoggingPlugin())
);

// Get all implementations
const plugins: IPlugin[] = container.getAll(IPlugin);
console.log(`Found ${plugins.length} plugins`);

// Search ancestors for additional implementations
const allPlugins: IPlugin[] = container.getAll(IPlugin, true);
```

### Resource Discovery

Find registered resources by kind and name:

```typescript
// Find value converter by name
const currencyConverter = container.find('value-converter', 'currency');

// Find custom element by name
const myElement = container.find('custom-element', 'my-button');

// Find any resource by full key
const resource = container.find('au:resource:value-converter:currency');
```

### Direct Instantiation with Dependencies

Use `invoke()` to create instances with automatic dependency injection:

```typescript
class EmailService {
  constructor(private logger: ILogger, private config: IConfig) {}

  sendEmail(to: string, subject: string, body: string) {
    // Implementation
  }
}

// Create instance without registering the class
const emailService = container.invoke(EmailService);

// With additional dynamic dependencies
const serviceWithExtras = container.invoke(EmailService, ['extra', 'params']);
```

### Custom Factory Registration

Register custom factories for complex instantiation logic:

```typescript
import { IFactory } from 'aurelia';

class DatabaseFactory implements IFactory<Database> {
  construct(container: IContainer, dynamicDependencies?: unknown[]): Database {
    const config = container.get(IConfig);
    const logger = container.get(ILogger);

    return new Database(config.connectionString, {
      logger,
      timeout: config.queryTimeout,
      // Additional dynamic configuration
      ...dynamicDependencies
    });
  }

  registerTransformer(transformer: (instance: Database) => Database): void {
    // Handle instance transformation - implementation depends on your needs
    // This method is called to register instance transformation logic
  }
}

// Register the custom factory
container.registerFactory(Database, new DatabaseFactory());
```

### Resolver Inspection

Examine resolver configuration for debugging:

```typescript
// Get resolver without auto-registration
const resolver = container.getResolver(MyService, false);

if (resolver) {
  console.log('Service is registered');

  // Get associated factory if available
  const factory = resolver.getFactory?.(container);
  if (factory) {
    console.log(`Factory type: ${factory.Type.name}`);
  }
} else {
  console.log('Service not registered');
}
```

### Container Tree Navigation

Navigate container hierarchies:

```typescript
function inspectContainer(container: IContainer, indent = 0) {
  const prefix = '  '.repeat(indent);
  console.log(`${prefix}Container ID: ${container.id}`);

  if (container.parent) {
    console.log(`${prefix}Parent: ${container.parent.id}`);
  }

  if (container.root !== container) {
    console.log(`${prefix}Root: ${container.root.id}`);
  }

  console.log(`${prefix}Depth: ${container.depth}`);
}
```

---

## Testing with Dependency Injection

Effective testing with Aurelia's DI system involves creating isolated test containers, mocking dependencies, and managing test lifecycle properly.

### Basic Test Setup

Create isolated containers for each test to ensure clean state:

```typescript
import { DI, Registration } from 'aurelia';
import { ILogger, IConfig } from './interfaces';

describe('UserService', () => {
  let container: IContainer;
  let mockLogger: ILogger;
  let mockConfig: IConfig;

  beforeEach(() => {
    // Create fresh container for each test
    container = DI.createContainer();

    // Create mocks
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    mockConfig = {
      apiUrl: 'http://test-api.com',
      timeout: 5000
    };

    // Register mocks
    container.register(
      Registration.instance(ILogger, mockLogger),
      Registration.instance(IConfig, mockConfig),
      Registration.singleton(UserService, UserService)
    );
  });

  afterEach(() => {
    // Clean up
    container.dispose();
  });

  it('should log user creation', () => {
    const userService = container.get(UserService);
    userService.createUser({ name: 'John', email: 'john@example.com' });

    expect(mockLogger.info).toHaveBeenCalledWith('Creating user: John');
  });
});
```

### Mocking Strategies

Different approaches for mocking dependencies:

```typescript
// 1. Simple object mocks
const mockApiClient = {
  get: jest.fn().mockResolvedValue({ data: [] }),
  post: jest.fn().mockResolvedValue({ data: { id: 1 } })
};

// 2. Class-based mocks with jest
const MockNotificationService = jest.fn().mockImplementation(() => ({
  send: jest.fn(),
  subscribe: jest.fn()
}));

// 3. Partial mocks for interfaces
const mockEmailService: Partial<IEmailService> = {
  sendEmail: jest.fn().mockResolvedValue(true)
};

// Register in container
container.register(
  Registration.instance(IApiClient, mockApiClient),
  Registration.instance(INotificationService, new MockNotificationService()),
  Registration.instance(IEmailService, mockEmailService as IEmailService)
);
```

### Testing Resolver Behavior

Test custom resolvers and registration strategies:

```typescript
describe('Custom Resolver', () => {
  it('should create new instances with newInstanceOf', () => {
    container.register(Registration.singleton(CounterService, CounterService));

    const instance1 = container.get(newInstanceOf(CounterService));
    const instance2 = container.get(newInstanceOf(CounterService));
    const singleton = container.get(CounterService);

    expect(instance1).not.toBe(instance2);
    expect(instance1).not.toBe(singleton);
    expect(instance2).not.toBe(singleton);
  });

  it('should resolve with factory', () => {
    const serviceFactory = container.get(factory(ConfigurableService));

    const service1 = serviceFactory('config1');
    const service2 = serviceFactory('config2');

    expect(service1.config).toBe('config1');
    expect(service2.config).toBe('config2');
  });
});
```

### Integration Testing with Child Containers

Test component-level isolation using child containers:

```typescript
describe('Component Integration', () => {
  let rootContainer: IContainer;
  let componentContainer: IContainer;

  beforeEach(() => {
    rootContainer = DI.createContainer();

    // Register global services
    rootContainer.register(
      Registration.singleton(IGlobalConfig, GlobalConfig),
      Registration.singleton(ILogger, ConsoleLogger)
    );

    // Create component-specific container
    componentContainer = rootContainer.createChild();

    // Register component-specific services
    componentContainer.register(
      Registration.instance(IComponentData, { items: [] }),
      Registration.transient(IComponentService, ComponentService)
    );
  });

  it('should inherit global services but have isolated component services', () => {
    const globalConfig = componentContainer.get(IGlobalConfig);
    const componentService = componentContainer.get(IComponentService);

    expect(globalConfig).toBeDefined();
    expect(componentService).toBeDefined();

    // Component services are isolated
    const anotherChild = rootContainer.createChild();
    expect(() => anotherChild.get(IComponentService)).toThrow();
  });
});
```

### Testing Async Dependencies

Handle asynchronous dependency resolution:

```typescript
describe('Async Dependencies', () => {
  it('should handle async initialization', async () => {
    const mockAsyncService = {
      initialize: jest.fn().mockResolvedValue(undefined),
      getData: jest.fn().mockResolvedValue(['item1', 'item2'])
    };

    container.register(
      Registration.instance(IAsyncService, mockAsyncService),
      Registration.singleton(DataManager, DataManager)
    );

    const dataManager = container.get(DataManager);
    await dataManager.initialize();

    const data = await dataManager.loadData();
    expect(data).toEqual(['item1', 'item2']);
    expect(mockAsyncService.initialize).toHaveBeenCalled();
  });
});
```

### Test Utilities and Helpers

Create reusable test utilities:

```typescript
// test-utils.ts
export class TestContainerBuilder {
  private registrations: any[] = [];

  withMock<T>(key: any, mock: T): this {
    this.registrations.push(Registration.instance(key, mock));
    return this;
  }

  withSingleton<T>(key: any, implementation: new (...args: any[]) => T): this {
    this.registrations.push(Registration.singleton(key, implementation));
    return this;
  }

  build(): IContainer {
    const container = DI.createContainer();
    container.register(...this.registrations);
    return container;
  }
}

// Usage in tests
describe('UserService with TestContainerBuilder', () => {
  it('should work with builder pattern', () => {
    const container = new TestContainerBuilder()
      .withMock(ILogger, { info: jest.fn() })
      .withMock(IApiClient, { get: jest.fn() })
      .withSingleton(UserService, UserService)
      .build();

    const userService = container.get(UserService);
    expect(userService).toBeDefined();
  });
});
```

---

## Real-world Architecture Patterns

Aurelia's DI system enables sophisticated architectural patterns for complex applications. Here are proven patterns for organizing services and managing dependencies in real-world scenarios.

### Multi-Tenant Architecture

Use container hierarchies to isolate tenant-specific services:

```typescript
import { DI, Registration } from 'aurelia';

// Base application container
const appContainer = DI.createContainer();

// Register shared services
appContainer.register(
  Registration.singleton(ILogger, ConsoleLogger),
  Registration.singleton(ICrypto, CryptoService),
  Registration.singleton(IMetrics, MetricsCollector)
);

// Tenant-specific container factory
class TenantContainerFactory {
  createTenantContainer(tenantId: string, config: TenantConfig): IContainer {
    const tenantContainer = appContainer.createChild({
      inheritParentResources: false // Explicit control over inheritance
    });

    // Register tenant-specific services
    tenantContainer.register(
      Registration.instance(ITenantConfig, config),
      Registration.instance('tenantId', tenantId),
      Registration.singleton(ITenantDatabase, TenantDatabase),
      Registration.singleton(ITenantCache, TenantCache),
      Registration.transient(ITenantService, TenantService)
    );

    // Selectively inherit global services by registering instances
    tenantContainer.register(
      Registration.instance(ILogger, appContainer.get(ILogger)),
      Registration.instance(ICrypto, appContainer.get(ICrypto))
    );

    return tenantContainer;
  }
}

// Usage
const factory = new TenantContainerFactory();
const tenant1Container = factory.createTenantContainer('tenant1', tenant1Config);
const tenant2Container = factory.createTenantContainer('tenant2', tenant2Config);

// Each tenant has isolated services
const tenant1Service = tenant1Container.get(ITenantService);
const tenant2Service = tenant2Container.get(ITenantService);
```

### Feature Module Organization

Organize large applications using feature-based service modules:

```typescript
// Feature module pattern
export interface IFeatureModule {
  configure(container: IContainer): void;
}

// User Management Feature
export class UserManagementModule implements IFeatureModule {
  configure(container: IContainer): void {
    container.register(
      // Services
      Registration.singleton(IUserRepository, UserRepository),
      Registration.singleton(IUserValidationService, UserValidationService),
      Registration.transient(IUserNotificationService, EmailUserNotificationService),

      // Factories for complex objects
      Registration.callback(IUserFactory, (c) => new UserFactory(
        c.get(IUserValidationService),
        c.get(ILogger)
      )),

      // Configuration
      Registration.instance(IUserModuleConfig, {
        enableEmailVerification: true,
        passwordMinLength: 8,
        sessionTimeout: 3600000
      })
    );
  }
}

// Order Management Feature
export class OrderManagementModule implements IFeatureModule {
  configure(container: IContainer): void {
    container.register(
      Registration.singleton(IOrderRepository, OrderRepository),
      Registration.singleton(IPaymentProcessor, StripePaymentProcessor),
      Registration.singleton(IInventoryService, InventoryService),
      Registration.transient(IOrderService, OrderService)
    );
  }
}

// Application composition
class ApplicationBuilder {
  private container = DI.createContainer();
  private modules: IFeatureModule[] = [];

  addModule(module: IFeatureModule): this {
    this.modules.push(module);
    return this;
  }

  addCoreServices(): this {
    this.container.register(
      Registration.singleton(ILogger, ApplicationLogger),
      Registration.singleton(IConfig, EnvironmentConfig),
      Registration.singleton(IEventBus, EventBus)
    );
    return this;
  }

  build(): IContainer {
    // Configure core services first
    this.addCoreServices();

    // Configure feature modules
    this.modules.forEach(module => module.configure(this.container));

    return this.container;
  }
}

// Usage
const container = new ApplicationBuilder()
  .addModule(new UserManagementModule())
  .addModule(new OrderManagementModule())
  .build();
```

### Service Composition Patterns

Create flexible service architectures using composition:

```typescript
// Strategy pattern with DI
export interface INotificationStrategy {
  send(message: string, recipient: string): Promise<void>;
}

export class EmailNotificationStrategy implements INotificationStrategy {
  constructor(private emailService: IEmailService) {}

  async send(message: string, recipient: string): Promise<void> {
    await this.emailService.sendEmail(recipient, 'Notification', message);
  }
}

export class SmsNotificationStrategy implements INotificationStrategy {
  constructor(private smsService: ISmsService) {}

  async send(message: string, recipient: string): Promise<void> {
    await this.smsService.sendSms(recipient, message);
  }
}

// Composite notification service
export class NotificationService {
  constructor(
    @all(INotificationStrategy) private strategies: INotificationStrategy[]
  ) {}

  async sendToAll(message: string, recipient: string): Promise<void> {
    await Promise.all(
      this.strategies.map(strategy => strategy.send(message, recipient))
    );
  }
}

// Registration
container.register(
  Registration.transient(INotificationStrategy, EmailNotificationStrategy),
  Registration.transient(INotificationStrategy, SmsNotificationStrategy),
  Registration.singleton(NotificationService, NotificationService)
);
```

### Plugin Ecosystem Pattern

Create extensible architectures with plugin support:

```typescript
// Plugin interface
export interface IApplicationPlugin {
  name: string;
  version: string;
  configure(container: IContainer): void;
  initialize?(container: IContainer): Promise<void>;
}

// Plugin manager
export class PluginManager {
  private plugins = new Map<string, IApplicationPlugin>();

  registerPlugin(plugin: IApplicationPlugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin '${plugin.name}' is already registered`);
    }
    this.plugins.set(plugin.name, plugin);
  }

  async configurePlugins(container: IContainer): Promise<void> {
    // Configure all plugins
    for (const plugin of this.plugins.values()) {
      plugin.configure(container);
    }

    // Initialize plugins that need async setup
    for (const plugin of this.plugins.values()) {
      if (plugin.initialize) {
        await plugin.initialize(container);
      }
    }
  }

  getPlugin(name: string): IApplicationPlugin | undefined {
    return this.plugins.get(name);
  }
}

// Example plugin
export class AnalyticsPlugin implements IApplicationPlugin {
  name = 'analytics';
  version = '1.0.0';

  configure(container: IContainer): void {
    container.register(
      Registration.singleton(IAnalyticsService, GoogleAnalyticsService),
      Registration.transient(IAnalyticsEventTracker, EventTracker)
    );
  }

  async initialize(container: IContainer): Promise<void> {
    const analytics = container.get(IAnalyticsService);
    await analytics.initialize();
  }
}

// Application with plugin support
export class PluggableApplication {
  private container = DI.createContainer();
  private pluginManager = new PluginManager();

  registerPlugin(plugin: IApplicationPlugin): this {
    this.pluginManager.registerPlugin(plugin);
    return this;
  }

  async start(): Promise<void> {
    // Configure core services
    this.container.register(
      Registration.singleton(ILogger, ApplicationLogger),
      Registration.instance(PluginManager, this.pluginManager)
    );

    // Configure and initialize plugins
    await this.pluginManager.configurePlugins(this.container);

    // Start application
    console.log('Application started with plugins');
  }
}

// Usage
const app = new PluggableApplication()
  .registerPlugin(new AnalyticsPlugin());

await app.start();
```

### Event-Driven Architecture Integration

Combine DI with event-driven patterns:

```typescript
// Event-driven service with DI
export class OrderProcessingService {
  constructor(
    private eventBus: IEventBus,
    private paymentService: IPaymentService,
    private inventoryService: IInventoryService,
    private notificationService: INotificationService
  ) {
    this.subscribeToEvents();
  }

  private subscribeToEvents(): void {
    this.eventBus.subscribe('order.created', this.handleOrderCreated.bind(this));
    this.eventBus.subscribe('payment.completed', this.handlePaymentCompleted.bind(this));
  }

  private async handleOrderCreated(order: Order): Promise<void> {
    // Reserve inventory
    await this.inventoryService.reserve(order.items);

    // Process payment
    const paymentResult = await this.paymentService.processPayment(order.payment);

    if (paymentResult.success) {
      this.eventBus.publish('payment.completed', { order, paymentResult });
    } else {
      this.eventBus.publish('payment.failed', { order, error: paymentResult.error });
    }
  }

  private async handlePaymentCompleted(event: PaymentCompletedEvent): Promise<void> {
    // Fulfill order
    await this.inventoryService.fulfill(event.order.items);

    // Send confirmation
    await this.notificationService.sendOrderConfirmation(event.order);

    this.eventBus.publish('order.fulfilled', event.order);
  }
}

// Service registration with lifecycle management
container.register(
  Registration.singleton(IEventBus, EventBus),
  Registration.singleton(OrderProcessingService, OrderProcessingService),

  // Use factory for services that need post-construction setup
  Registration.callback(IOrderProcessor, (c) => {
    const processor = c.get(OrderProcessingService);
    // Processor automatically subscribes to events in constructor
    return processor;
  })
);
```

### Microservices Communication Pattern

Structure DI for microservices integration:

```typescript
// Service discovery pattern
export interface IServiceRegistry {
  register(serviceName: string, endpoint: string): void;
  discover(serviceName: string): string | null;
}

export class ServiceRegistry implements IServiceRegistry {
  private services = new Map<string, string>();

  register(serviceName: string, endpoint: string): void {
    this.services.set(serviceName, endpoint);
  }

  discover(serviceName: string): string | null {
    return this.services.get(serviceName) || null;
  }
}

// HTTP client factory for microservices
export class HttpClientFactory {
  constructor(
    private serviceRegistry: IServiceRegistry,
    private logger: ILogger
  ) {}

  createClient(serviceName: string): IHttpClient {
    const endpoint = this.serviceRegistry.discover(serviceName);
    if (!endpoint) {
      throw new Error(`Service '${serviceName}' not found in registry`);
    }

    return new HttpClient(endpoint, {
      timeout: 30000,
      retries: 3,
      logger: this.logger
    });
  }
}

// Service-specific clients
export class UserServiceClient {
  private httpClient: IHttpClient;

  constructor(httpClientFactory: HttpClientFactory) {
    this.httpClient = httpClientFactory.createClient('user-service');
  }

  async getUser(id: string): Promise<User> {
    const response = await this.httpClient.get(`/users/${id}`);
    return response.data;
  }
}

// Registration for microservices architecture
container.register(
  Registration.singleton(IServiceRegistry, ServiceRegistry),
  Registration.singleton(HttpClientFactory, HttpClientFactory),
  Registration.singleton(UserServiceClient, UserServiceClient),
  Registration.singleton(OrderServiceClient, OrderServiceClient),

  // Configure service endpoints
  Registration.callback('configure-services', (c) => {
    const registry = c.get(IServiceRegistry);
    registry.register('user-service', process.env.USER_SERVICE_URL);
    registry.register('order-service', process.env.ORDER_SERVICE_URL);
    return registry;
  })
);
```

These patterns demonstrate how Aurelia's DI system can support complex, real-world architectures while maintaining clean separation of concerns and testability.

---

By following these guidelines and examples, you can leverage Aurelia 2's powerful Dependency Injection system to create well-architected, maintainable applications with clear separation of concerns and flexible service management.
