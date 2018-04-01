# IoC

## Progress

* [ ] Configuration
  * [x] Fluent API
  * [x] Decorators
  * [ ] Static analysis
    * [x] TypeScript
    * [x] JavaScript
    * [ ] Generated code (faster initial load)
* [ ] Activation
  * [x] Direct API
  * [ ] Generated code (less manual configuration/calls needed)
* [x] Lifetime scopes
* [ ] Resolution scopes (similar in functionality to child containers)
* [ ] Registration types
  * [x] Concrete type
  * [x] Instance
  * [ ] Custom resolvers

# Getting started - Runtime

The IoC code is split up between `designtime` and `runtime`. This readme is primarily focused on the `runtime` part, for now.

Some additional terminology is introduced to help distinguish between responsibilities of components. None of this is set in stone yet however.

What used to be `Container` is now effectively split up between `Injector` and `InjectorBuilder`. The `InjectorBuilder` is the main entry point to configure Dependency Injection via a fluent API and ultimately build an `Injector`, which can inject dependencies. The `Container` class is much less relevant from an end-user perspective; this is simply a "container" object for the dependency map that creates class activators.

On a basic level, the injector can be instantiated like so:

```ts
import { InjectorBuilder } from 'ioc/runtime/injector';

export function configure() {
  const builder = InjectorBuilder.create();
  const injector = builder.build()
}
```

The injector is now globally accessible via the static variable:

```ts
import { DefaultInjector } from 'ioc/runtime/injector';
import { Foo } from './foo';

export function configure() {
  const foo = DefaultInjector.INSTANCE.getInstance(Foo);
}
```

Note: the `build()` method sets the static `INSTANCE` and multiple consecutive calls will create multiple separate injectors that override the global `INSTANCE`. It's generally not meant to be called multiple times, nor should it be necessary.

# Configuration

The DefaultInjector supports most/all of the previous container's automatic resolution capabilities (e.g. `static inject`, `@autoinject()`) but it does so in a very different manner. Dependencies are stored in a graph object where they form a topology that represents the resolution "path" before they are actually instantiated. While this adds some complexity, it also allows for certain optimizations, code generation and deep inspection of the resolution process. This graph can be modified, extended or merged after the injector is built.

## Fluent API

From a user's perspective, the configuration is exposed via `RegistrationRules`. They are directly accessible from the `InjectorBuilder`. Each registration rule starts with a call to `register()` to supply the key, followed by a configuration rule for that particular key which ends with a `to...` terminator:

```ts
import { InjectorBuilder } from 'ioc/runtime/injector';
import { Foo, Bar, Baz, Qux } from './foo';

export function configure() {
  const builder = InjectorBuilder.create();
  builder.register(Foo).singleton().toSelf(); // Associate the Foo key with the Foo class
  builder.register('foo').toType(Foo); // Point the 'foo' key to the same registration as the Foo class
  builder.register(Bar).toInstance(new Bar()); // Point the Bar key to a supplied singleton instance of Bar
  builder.register(Baz).transient().toSelf(); // A new instance of Baz will be created for each call
  builder.register(Qux).toType(Qux); // Behaves identical to .toSelf and singleton is the default lifetime

  const injector = builder.build();
}
```

Configuration can also be provided via a module class. Implement the `IModuleConfiguration` interface for the correct types:

```ts
import { IModuleConfiguration, IContext } from 'ioc/runtime/interfaces';
import { Foo } from './foo';

export class AppConfiguration implements IModuleConfiguration {
  // IContext provides the same fluent API as InjectorBuilder
  public configure(ctx: IContext): void {
    ctx.register(Foo).toSelf();
  }
}
```

Then instantiate it and pass it to an `apply()` call on the `InjectorBuilder`:

```ts
import { InjectorBuilder } from 'ioc/runtime/injector';
import { AppConfiguration } from './app-configuration';

export function configure() {
  const builder = InjectorBuilder.create();
  builder.applyModule(new AppConfiguration());

  const injector = builder.build();
}
```

Or simply pass an array of modules directly to `create()`:

```ts
import { InjectorBuilder } from 'ioc/runtime/injector';
import { AppConfiguration } from './app-configuration';
import { OtherConfiguration } from './other-configuration';

export function configure() {
  const builder = InjectorBuilder.create(new AppConfiguration(), new OtherConfiguration());
  const injector = builder.build();
}
```

## Class Decorators

For the most part, the decorators are similar to those of version 1:

```ts
import { inject, autoinject, singleton, transient } from 'ioc/runtime/decorators';

@inject(Bar, Baz)
export class Foo() {
  // Since the types are provided to the decorator, they could be omitted in the constructor
  constructor(private bar: any, private baz: any) {}
}

@autoinject()
export class Bar() {
  // The types must be specified in the constructor since @autoinject() uses typescript emitted metadata
  constructor(private foo: Foo, private baz: Baz) {}
}

@singleton()
export class Baz() {
  // Will behave similar to @autoinject() (which defaults to singleton)
  constructor(private foo: Foo, private bar: Bar) {}
}

@transient()
export class Qux() {
  // Will behave similar to @autoinject(), except a new instance will be created for each resolution
  constructor(private foo: Foo, private bar: Bar) {}
}
```

You can override the default singleton lifetime for `@inject()` and `@autoinject()` via the `InjectorBuilder`:

```ts
import { InjectorBuilder } from 'ioc/runtime/injector';
import { Lifetime } from 'ioc/runtime/types';

export function configure() {
  const builder = InjectorBuilder.create();
  builder.setDefaultLifetime(Lifetime.transient); // Now all registrations with unspecified lifetime will default to transient rather than singleton

  const injector = builder.build();
}
```

Furthermore, there is a `@registration()` decorator which provides access to a slightly different Fluent API:

```ts
import { registration } from 'ioc/runtime/decorators';
import { Lifetime } from 'ioc/runtime/types';

@registration(rule => rule
  .setDependencyType('foo') // the key is now 'foo' instead of Foo
  .setLifetime(Lifetime.transient)
)
export class Foo {}
```

```ts
import { registration } from 'ioc/runtime/decorators';
import { Bar } from './bar';

@registration(rule => rule.setImplementation(Bar)) // the key Foo will now instead resolve to Bar
export class Foo {}
```

## Parameter Decorators

The parameter decorator can be particularly useful when you prefer to inject interfaces rather than classes. `registerDependency()` allows you to create a reusable decorator based on an arbitrary key (typically a string). Then wherever you apply that parameter decorator, the registration (configured elsewhere) associated with that key will be injected:


```ts
import { registerDependency } from 'ioc/runtime/decorators';

export const IFoo = registerDependency('IFoo');
export interface IFoo {
  signature(): void;
}

export const IBar = registerDependency('IBar');
export interface IBar {}
```

We're utilizing the property of interfaces not being types, so we can import `IFoo` and `IBar` and this will give us the `interface` as well as the `const` - they will automatically resolve to the correct thing based on where it's used:

```ts
import { IFoo, IBar } from './interfaces';


export class Foo implements IFoo { 
  public bar: IBar;

  constructor(@IBar bar: IBar) {
    this.bar = bar;
  }

  public signature(): void {}
}
```

The key still needs to be associated with an implementation, but `Foo` doesn't need to know about that:

```ts
import { InjectorBuilder } from 'ioc/runtime/injector';
import { IBar } from './interfaces';
import { Bar } from './bar';

export function configure() {
  const builder = InjectorBuilder.create();

  // either of these will work and have exactly the same effect
  builder.register(IBar).toType(Bar); 
  builder.register('IBar').toType(Bar);
}


```

# Extending

For power users..

## Registration Functions

The IoC framework is composed of small, specialized parts most of which can be extended / overridden.

The primary extension point is the `IRegistrationFunction` interface.

The `Resolver` uses these to resolve unregistered dependencies and will iterate through them until it receives a non-null `RegistrationResult`. If none is returned from any of the functions, the resolution is considered to have failed and the injector will throw an error.

You can implement this interface and perform any kind of custom resolution logic:

```ts
export class MyRegistrationFunction implements IRegistrationFunction {
  public register(
    context: ResolutionContext, // context contains the entire dependency graph
    chain: RequirementChain // chain is the dependency chain for the current component being resolved
  ): RegistrationResult {

    const key = chain.key; // the dependency key that is being resolved, e.g. 'foo'
    const requirement = chain.currentRequirement; // the 'requirement' (read: dependency) that is not yet registered; we want to try to resolve this here by going through cached rules, metadata, applying conventions etc

    // we'll just naively tell it to assume an asSelf()-like registration and return it as-is
    return new RegistrationResult(
      requirement,
      Lifetime.Singleton,
      RegistrationFlags.Terminal // Terminal tells the resolver to stop looking for further rules and functions, and try to instantiate it (will throw if it's not instantiable for whatever reason)
    );

  }
}

```

The resolver has a standard set of `IRegistrationFunction`s which look through typescript's emitted metadata, `inject` properties, decorator metadata etc. You can pass any of your own directly to the `InjectorBuilder`:


```ts
import { InjectorBuilder } from 'ioc/runtime/injector';
import { MyRegistrationFunction } from './my-registration-function';
import { MyRegistrationFunction2 } from './my-registration-function2';

export function configure() {
  const builder = InjectorBuilder.create();
  const injector = builder.build(new MyRegistrationFunction(), new MyRegistrationFunction2());
}


```

Note: registration functions are not the same thing as custom resolvers or factories, and are not meant to replace those either. Custom resolvers and factories are simply not implemented yet at the time of writing.

## Requirements -> Fulfillments -> Activators

Requirements form the backbone of dependency tracking. They are essentially wrappers for raw dependency keys and carry additional relevant information about that component and its dependencies. There is a mapping between raw keys and requirements which you can access (at your own risk):

```ts
import { registry } from 'ioc/runtime/types';
import { MyCustomRequirement } from './my-custom-requirement';

export function configure() {
  registry.requirements.set('foo' new MyCustomRequirement('foo'));
}

```

A fully resolved requirement will have an `IFulfillment` which it can return. A fulfillment in turn carries all the information needed to *instantiate* a particular component. With that information it can create an `IActivator`, which is the final link that provides concrete instances.

Implementing the `IRequirement` interface gives you fine-grained control over how dependencies are resolved and even allow you to short-circuit dependencies by bypassing the `Resolver` and directly supplying fulfillments.


There are essentially 3 methods that link `injector.getInstance()` to the final instantiation:

`getFulfillment()`, `makeActivator()` and `activate()`

The rest is only relevant for exchanging information with the resolver.

A minimal example to demonstrate this:


```ts
import { IRequirement, IFulfillment, IActivator } from 'ioc/runtime/interfaces';
import { Lifetime } from 'ioc/runtime/types';

export class NaiveRequirement implements IRequirement {
  public injectionPoint: IInjectionPoint;
  public requiredType: DependencyType;
  constructor(type: DependencyType) {
    this.requiredType = type;
    this.injectionPoint = new BasicInjectionPoint(type); // a 'null' injection point
  }
  public isInstantiable(): boolean {
    return true;
  }
  public getFulfillment(): IFulfillment {
    return new NaiveFulfillment(this.requiredType);
  }
  public restrict(typeOrFulfillment: DependencyType | IFulfillment): IRequirement {
    return this;
  }
  public isEqualTo(other: NaiveRequirement): boolean {
    return other.requiredType === this.requiredType;
  }
}

export class NaiveFulfillment implements IFulfillment {
  public type: DependencyType;
  constructor(type: DependencyType) {
    this.type = type;
  }
  public getDefaultLifetime(): Lifetime {
    return Lifetime.Singleton;
  }
  public getDependencies(): IRequirement[] {
    return []; // return an empty array so the resolver will move on quickly
  }
  public makeActivator(dependencies: DependencyMap): IActivator {
    return new NaiveActivator(type);
  }
  public isEqualTo(other: NaiveFulfillment): boolean {
    return other.type === this.type;
  }
}

export class NaiveActivator implements IActivator {
  public type: DependencyType;
  constructor(type: DependencyType) {
    this.type = type;
  }

  public activate(): any {
    if (this.type instanceof Function) {
      return new (this.type as any)(); // just invoke the constructor without any arguments
    }
  }
}

```

And now you can do this:


```ts
import { InjectorBuilder } from 'ioc/runtime/injector';
import { registry } from 'ioc/runtime/types';
import { NaiveRequirement } from './naive-requirement';
import { Foo } from './foo';

export function configure() {
  registry.requirements.set(Foo new NaiveRequirement(Foo));
  const injector = InjectorBuilder.create().build();
  // .getInstance() will retrieve the requirement from the registry which is where your code takes over
  const foo = injector.getInstance(Foo);
  // this is created by NaiveActivator

}

```

# Designtime

todo..

## To try the code generator:

- `npm run build-ioc`
- `npm run test-ioc-ts-fixture`

There will be `.js` files next to the `.ts` files under `test/fixture/ts`

Code generation is not yet integrated and is still in an early stage of development.
