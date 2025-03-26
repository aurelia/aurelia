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
- [Migrating from v1 to v2](#migrating-from-v1-to-v2)

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

Since TypeScript interfaces don’t exist at runtime, use symbols or tokens for injection.

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

Aurelia’s DI system offers various registration types to control how services are instantiated:

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
export class MyComponent {
  private sinks: ISink[] = resolve(all(ISink));
  private getFoo: () => IFoo = resolve(lazy(IFoo));
  // Additional injections as needed...
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

By following these guidelines and examples, you can leverage Aurelia 2’s powerful Dependency Injection system to create well-architected, maintainable applications with clear separation of concerns and flexible service management.
