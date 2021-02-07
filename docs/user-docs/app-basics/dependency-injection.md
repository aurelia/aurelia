# Dependency Injection

Dependency injection is a powerful tool that not only enables Aurelia and its component model, but that can assist in building SOLID, modular architectures in any object-oriented environment.

{% hint style="success" %}
**Here's what you'll learn...**

* What is "DI" and why would I use it?
* How do I create a container and register services?
* How can I enable any class in my app to leverage DI?
* How can I extend and customize the default DI container?
{% endhint %}

## What is DI and Why would I use it?

As a system increases in complexity, it becomes more and more important to break complex code down into groups of smaller, collaborating functions or objects. However, once we’ve broken down a problem/solution into smaller pieces, we have then introduced a new problem: how do we put the pieces together?

One approach is to have the controlling function or object directly instantiate all its dependencies. This is tedious, but also introduces the bigger problem of tight coupling and muddies the primary responsibility of the controller by forcing upon it a secondary concern of locating and creating all dependencies. To address these issues, the practice of Inversion of Control \(IoC\) can be employed. Simply put, the responsibility for locating and/or instantiating collaborators is removed from the controlling function/object and delegated to a 3rd party \(the control is inverted\). Typically, this means that all dependencies become parameters of the function or object constructor, making every function/object implemented this way not only decoupled but open for extension through providing different implementations of the dependencies. The process of providing these dependencies to the controller is known as Dependency Injection \(DI\).

Once again, we’re back at our original problem: how do we put all these pieces together? With the control merely inverted and open for injection, we are now stuck having to manually instantiate or locate all dependencies and supply them before calling the function or creating the object…and we must do this at every function call-site or every place that the object is instanced. It seems as if this may be a bigger maintenance problem than we started with!

Fortunately, there is a battle-tested solution to this problem. We can use a Dependency Injection Container. With a DI container, a class can declare its dependencies, and allow the container to locate the dependencies and provide them to the class. Because the container manages locating and providing dependencies, it can also manage the lifetime of objects, enabling singleton, transient and object pooling patterns without consumers needing to be aware of this complexity.

## Creating Containers

An application typically has a single root-level DI container. To create a root container, call the `DI.createContainer()` method:

```typescript
import { DI } from 'aurelia';

const container = DI.createContainer();
```

Once you have a root-level container, you'll typically configure it with any services and then resolve your composition root, allowing you to kick off instantiation.

## Declaring Injectable Dependencies

### Injecting Into Plain Classes

To declare a dependency on a plain class, you can use one of three techniques, depending on what JavaScript/TypeScript features you want to use...

#### Use Static Property

You can declare your desired injected dependencies by adding an `inject` static property to your class. The `inject` property should reference an array of items to be injected, where each item in the array corresponds to a constructor argument. Here's an example...

```typescript
export class FileImporter {
  public static readonly inject = [FileReader, Logger];
  constructor(private fileReader: FileReader, logger: Logger) { ... }
}
```

In this case we have a class that is designed to import files. In order to do its job, the importer makes use of a file system abstraction \(FileReader\) and a logging abstraction \(Logger\). The importer simply declares these in its `inject` array and then creates a constructor with the matching inputs. At runtime, when the DI container instantiates the importer, it will locate or instantiate its dependencies as well and supply them to the constructor.

#### Use a Decorator

Decorators are an upcoming feature of EcmaScript and an experimental feature in TypeScript. If you want to use decorators in your project, you must first opt into them by adding `"experimentalDecorators": true` in the `compilerOptions` section of your `tsconfig.json` file. Once enabled, you can import the `@inject` decorator from this library and use it to declare injected dependencies. Here's the same example from above, written with a decorator:

```typescript
import { inject } from 'aurelia';

@inject(FileReader, Logger)
export class FileImporter {
  constructor(private fileReader: FileReader, logger: Logger) { ... }
}
```

This decorator simply creates a static `inject` property on the decorated class, with an array whose items correspond to the decorator's arguments. It's just a bit of syntax sugar over the base implementation. You could even write your own app-specific decorator to accomplish the same end result, if desired.

#### Use Compiler Metadata

If you have already opted into using TypeScript and decorators, you have an additional option available to you: decorator metadata. It's possible for the TypeScript compiler to emit metadata about the types of the constructor parameters automatically, as part of the build process, if a decorator is present. If this metadata is present, the DI container can use it instead of an explicit injection list. To enable this feature for the compiler, add `"emitDecoratorMetadata": true` in the `compilerOptions` section of your `tsconfig.json` file. With that in place, you can write the above code like this:

```typescript
import { inject } from 'aurelia';

@inject()
export class FileImporter {
  constructor(private fileReader: FileReader, logger: Logger) { ... }
}
```

When the `inject` decorator specifies no arguments, the DI container will attempt to look up the metadata that the TypeScript compiler has associated with the importer class. This approach is nice, since it allows the constructor of the class to be the single source of truth for the information on what to inject.

> Note The secret of TypeScript's metadata generation is that _any_ decorator on the class will cause the compiler to include the metadata. You don't have to use the `inject` decorator specifically.

Besides the experimental nature of this feature, there are some drawbacks to be aware of:

* **You can only use classes for the types of your constructor parameters.** Interfaces don't exist at runtime, so using them in this case will result in missing metadata for the type at runtime. Using a symbol or other value won't work either. This constraint tends to be fairly limiting, in practice.
* **You cannot use custom resolvers.** See the section below to learn about resolvers like `all` and `lazy`. Since these provide additional information to the DI about how to resolve the dependency, they aren't able to stand in as a type for the TypeScript compiler to store in metadata.

If you have either of the above scenarios, you'll want to be sure to use an explicit dependency list either through the decorator or the static property.

## Leveraging Resolvers

Internally, the DI Container figures out how to locate each dependency using a Resolver. Which resolver is used depends on if or how the dependency was registered. \(See below for information on registration.\) However, you can specify a special resolver when you declare your dependencies. For example, perhaps your application has an Inspector that is composed of Panel instances. You may want to inject the panels into the inspector. However, there isn't just one Panel, there are multiple different types of panels that implement the Panel interface. In this case, you'd want to use the `all` resolver. Here's what that would look like with a plain class:

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

In another scenario, you might have a dependency on a service that is expensive to create and that isn't always required, depending on what the user is doing with the app. In this case, you may want to lazily resolve the dependency when it's needed. For this, use the `lazy` resolver:

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

In this case, the lazy resolver will inject a function that you can call on demand, to get an instance of the `ExpensiveToCreateService`.

> Tip The core DI container does not enable circular dependencies. To get around this issue, in situations where you might have a circular reference, you can use a `lazy` resolver.
>
> Warning In each of the resolvers above, the "key" we are providing in the `inject` property/decorator is different in type than the constructor parameter. As a result, we cannot use compiler-generated decorator metadata to automatically provide the dependency information. In the case of `lazy`, the compiler will see the type as `Function` while with `all` it will see it as `Array`. Neither provides enough information for the DI container to figure out what to do.

### Custom Resolvers

You can create your own resolver by implementing the `IResolver` interface. Here's what that looks like:

```typescript
export interface IResolver<T = any> {
  resolve(handler: IContainer, requestor: IContainer): T;
  getFactory?(container: IContainer): IFactory<T> | null;
}
```

As you can see, you only need to implement one method, which uses the container \(either the original requesting container or the one that the request bubbled up to, if they aren't the same\) to return the instance. Here's a simplified version of the `all` function that's built in:

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

## Registering Services

The DI container uses a technique called _auto-registration_. What this means is that, if a class requests another class to be injected, and the requested class is not already registered with the container, the container will automatically register the class as a singleton, create the instance, and return it to the requestor.

Auto-registration works if everything is a singleton and you're using classes for dependencies everywhere and not making use of any interfaces or objects directly. That's very rarely the case though. Additionally, you may want to declare the behavior of your services upfront, to make the code more understandable for other engineers. To do this, the DI container provides a registration API.

The primary API for registration is called `register` and it can be used in combination with the `Registration` DSL. Here's an example:

```typescript
import { DI, Registration } from 'aurelia';

const container = DI.createContainer();
container.register(
  Registration.singleton(ProfileService, ProfileService),
  Registration.instance(fetch, fakeFetch)
);
```

With each registration, we provide a _key_ and a _value_. The _key_ is what consumers will use to request the dependency. The value is what the DI container will provide. The type of value you configure here depends on the registration type. Below is list of available options along with explanations:

* `Registration.instance(key: any, value: any): IRegistration` - Creates a registration for an existing object instance with the container, so that it can be looked up by the specified key.
* `Registration.singleton(key: any, value: Function): IRegistration` - Creates a registration for a singleton. The value is a class that will be instantiated when first requested. The DI container will retain a reference to the created instance and will return the same instance to all subsequent requestors.
* `Registration.transient(key: any, value: Function): IRegistration` - Creates a registration for a transient instance. The value is a class that will be instantiated every time it is requested. The container does not retain a reference to the created instance.
* `Registration.callback(key: any, value: ResolveCallback): IRegistration` - Creates a registration that enables custom instantiation and lifetime behavior. `ResolveCallback` is defined as follows:

  ```typescript
  type ResolveCallback<T = any> = (handler?: IContainer, requestor?: IContainer, resolver?: IResolver) => T;
  ```

  Simply provide a function with the above signature and the container will invoke you each time it needs to resolve an instance. Note that the `resolver` that is provided as the third parameter is the resolver that your factory is associated with. As such, should your resolver need to store state that is used across requests, it can store that state on the resolver instance itself.

* `Registration.alias(originalKey: any, aliasKey: any): IRegistration` - Creates a registration that allows access to a previous registration via an additional name. The `originalKey` is the key used in the original registration. The `aliasKey` is the 2nd \(or 3rd, 4th, etc.\) key that you also want to be able to resolve to the same behavior.

You will notice that each of these helper methods returns an `IRegistration` implementation. The `register` method of the container is able to handle anything that implements this interface, so you can also create your own registration implementations. Here's what that interface looks like:

```typescript
export interface IRegistration<T = any> {
  register(container: IContainer, key?: any): IResolver<T>;
}
```

> **Note:** For a deeper exploration of how to implement custom registrations and resolvers, [see the internal registration/resolver implementation](https://github.com/aurelia/aurelia/tree/1475ca4d7b1e7ef3037fc4942c4a456337d06f3c/docs/user-docs/app-basics/src/di.ts#L409) that handles all the registration scenarios listed above.

## Resolving Services

In most cases, resolution will happen automatically through constructor injection. However, you'll typically need to manually resolve the root service, to kick the whole thing off. There are also other scenarios which may come up that require manual resolution. To resolve from a container, call the `get` API on the container. Here's an example:

```typescript
const profileService: ProfileService = container.get(ProfileService);
```

If there are multiple different implementations for the same key, then you can resolve all of them with the `getAll` API:

```typescript
const panels: Panel[] = container.getAll(Panel);
```

### Using Interfaces

When using DI on other platforms, one would typically register services with an interface. However, TypeScript interfaces only exist at compile-time, not runtime, and the JavaScript language doesn't \(currently\) support interfaces. As a result, using an interface for the _key_ of a registration cannot work. However, there is a feature of the TypeScript language that lets you get around this limitation. Because TypeScript can merge definitions, it's possible to create an interface and a symbol with the same name. Here's an example:

```typescript
export const IProfileService = Symbol('IProfileService');
export interface IProfileService { ... }
```

When this technique is used, TypeScript, based on usage, can determine in which scenarios you want to use the interface and in which you want to use the Symbol. So, it can completely understand this code:

```typescript
import { Registration } from 'aurelia';

const IProfileService = Symbol('IProfileService');
interface IProfileService { ... }

class ProfileService implements IProfileService {
    // ...implementation...
}

class SomeClass {
  inject = [IProfileService];
  constructor(service: IProfileService) {
        // ...implementation...
    }
}

container.register(
  Registration.singleton(IProfileService, ProfileService)
);
```

> Warning You cannot use decorator metadata in this case because the TypeScript compiler is not able to understand that it should encode the variable value into the metadata in place of the interface \(which gets erased\).

Because this is such a handy capability of the compiler, the DI API provides a helper method with some benefits. We can optionally rework the above code to use this API like so:

```typescript
import { DI } from 'aurelia';

export const IProfileService = DI.createInterface<IProfileService>();
export interface IProfileService {
    // ...implementation...
}
```

This is slightly more verbose, but it has the advantage that the symbol created by the `DI.createInterface()` API "captures" the generic parameter, allowing it to work seamlessly with the `get` APIs of the container, providing strong return types when manually resolving with these symbols.

#### Default Interface Implementations

In many front-end scenarios, it's common to have a single default implementation of your interface, which you provide "out of the box". To facilitate this scenario, the `DI.createInterface()` method accepts a callback that you can use to associate a default implementation with your interface. The consumer who sets up the container can still specify their own implementation of the interface at runtime, but if one is not provided, it will fallback to the default implementation specified through this method. This allows the container to use auto-registration with the symbols created by the `DI.createInterface()` helper.

```typescript
import { DI } from 'aurelia';

export interface ITaskQueue {
    // ...api...
}

export const ITaskQueue = DI.createInterface<ITaskQueue>(x => x.singleton(TaskQueue));

class TaskQueue implements ITaskQueue {
    // ...implementation...
}
```

The callback that creates the default registration. This API looks nearly identical to the `Registration` DSL described above.

