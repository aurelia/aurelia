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

## Constructor Injection & Declaring Injectable Dependencies

Constructor injection is the most common form of DI. It involves providing the dependencies of a class through its constructor.

### Injecting into Plain Classes

In Aurelia, there are several ways to declare dependencies for injection into plain classes:

#### Using a Static Property

You can specify the dependencies by adding a `static inject` property to your class, which is an array of the dependencies:

```typescript
import { FileReader, Logger } from 'your-dependencies-path';

export class FileImporter {
  public static readonly inject = [FileReader, Logger];
  
  constructor(private fileReader: FileReader, private logger: Logger) { 
    // Constructor logic here
  }
}
```
{% hint style="warning" %}
The order of dependencies in the `inject` array must match the order of the parameters in the constructor.
{% endhint %}

#### Using Decorators

With the `@inject` decorator, you can declare dependencies in a more declarative way:

```typescript
import { inject, FileReader, Logger } from 'aurelia';

@inject(FileReader, Logger)
export class FileImporter {
  constructor(private fileReader: FileReader, private logger: Logger) { 
    // Constructor logic here
  }
}
```

#### Using Compiler Metadata

If you use TypeScript and have enabled metadata emission, you can leverage the TypeScript compiler to deduce the types to inject:

```typescript
import { inject, FileReader, Logger } from 'aurelia';

@inject()
export class FileImporter {
  constructor(private fileReader: FileReader, private logger: Logger) { 
    // Constructor logic here
  }
}
```
{% hint style="info" %}
Any decorator on a class will trigger TypeScript to emit type metadata, which Aurelia's DI can use.
{% endhint %}

### Creating Containers

An Aurelia application typically has a single root-level DI container. To create one:

```typescript
import { DI } from 'aurelia';

const container = DI.createContainer();
```

### Registering Services

In Aurelia, services can be registered with the container using the `register` API:

```typescript
import { DI, Registration } from 'aurelia';

const container = DI.createContainer();
container.register(
  Registration.singleton(ProfileService, ProfileService),
  Registration.instance(fetch, fakeFetch)
);
```

The `register` method allows you to associate a key with a value, which can be a singleton, transient, instance, callback, or alias.

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

### Property Injection

When inheritance is involved, constructor injection may not suffice. Property injection using the `resolve` function can be used in such cases:

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

### Other `resolve` Usages

`resolve` can also be used in factory functions or other setup logic:

```typescript
import { resolve, all } from 'aurelia';

export function useFieldListeners(field) {
  const listeners = resolve(all(IFieldListeners));
  // Further logic
}
```

Remember, `resolve` must be used within an active DI container context.

## Migrating from v1 to v2

For those migrating from Aurelia 1, most concepts remain the same, but it is recommended to use `DI.createInterface` to create injection tokens for better forward compatibility and consumer friendliness.

## Injecting an Interface

You can inject an interface using either the decorator or the token directly:

```typescript
export class MyComponent {
  constructor(@IApiClient private api: IApiClient) {}
}

// In the future, the decorator may not be necessary:
export class MyComponent {
  constructor(private api: IApiClient) {}
}
```

## Registration Types

You can explicitly create resolvers and decorators to control how dependencies are registered:

```typescript
Registration.singleton(key, SomeClass);
Registration.transient(key, SomeClass);
// And so on...
```

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
  constructor(@all(ISink) private sinks: ISink[]) {}
  constructor(@lazy(IFoo) private getFoo: () => IFoo) {}
  // And so on...
}
```

## Extending Types for Injection

For injecting objects like `Window` with additional properties:

```typescript
export interface IReduxDevTools extends Window {
  devToolsExtension?: DevToolsExtension;
}

export class MyComponent {
  constructor(@IWindow private window: IReduxDevTools) {}
}
```

By following these guidelines and utilizing the powerful features of Aurelia's DI system, you can build a well-architected application with cleanly separated concerns and easily manageable dependencies.
