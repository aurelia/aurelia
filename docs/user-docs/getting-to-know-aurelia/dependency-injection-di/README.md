# Dependency injection (DI)

Dependency injection is a powerful tool that enables Aurelia and its component model and can assist in building SOLID modular architectures in any object-oriented environment. In Aurelia, dependency injection underpins much of what you do in the framework when working with components and resources.

To learn about dependency injection and why you should use it, consult our [what is Dependency Injection](what-is-dependency-injection.md) section.

## Constructor injection & declaring injectable dependencies

The section below describes how to use dependency injection in its traditional form, constructor injection, and how to declare the dependencies to be injected.

### Injecting into plain classes

To declare a dependency on a plain class, you can use one of three techniques, depending on what JavaScript/TypeScript features you want to use.

#### Use static property

You can declare your desired injected dependencies by adding a `inject` static property to your class. The `inject` property should reference an array of items to be injected, where each item in the array corresponds to a constructor argument.

```typescript
export class FileImporter {
  public static readonly inject = [FileReader, Logger];
  
  constructor(private fileReader: FileReader, logger: Logger) { ... }
}
```

In this case, we have a class designed to import files. The importer uses a file system abstraction (FileReader) and a logging abstraction (Logger) to do its job.&#x20;

The importer declares these in its `inject` array and then creates a constructor with the matching inputs. When the DI container instantiates the importer, it will locate or instantiate its dependencies and supply them to the constructor at runtime.

{% hint style="warning" %}
The order is important when using the static injection method. The order of dependencies in the array is how they will be passed through to the constructor.
{% endhint %}

#### Use a decorator

Decorators are an upcoming feature of EcmaScript and an experimental feature in TypeScript. If you want to use decorators in your project, you must first opt into them by adding `"experimentalDecorators": true` in the `compilerOptions` section of your `tsconfig.json` file. Once enabled, you can import the `@inject` decorator from this library and use it to declare injected dependencies. Here's the same example from above, written with a decorator:

```typescript
import { inject } from 'aurelia';

@inject(FileReader, Logger)
export class FileImporter {
  constructor(private fileReader: FileReader, logger: Logger) { ... }
}
```

This decorator creates a static `inject` property on the decorated class, with an array whose items correspond to the decorator's arguments. It's just a bit of syntax sugar over the base implementation. You could even write an app-specific decorator to accomplish the same result if desired.

#### Use compiler metadata

If you have already opted into using TypeScript and decorators, you have an additional option: decorator metadata. The TypeScript compiler can emit metadata about the types of the constructor parameters automatically as part of the build process if a decorator is present. If this metadata is present, the DI container can use it instead of an explicit injection list.&#x20;

To enable this feature for the compiler, add `"emitDecoratorMetadata": true` in the `compilerOptions` section of your `tsconfig.json` file. With that in place, you can write the above code like this:

```typescript
import { inject } from 'aurelia';

@inject()
export class FileImporter {
  constructor(private fileReader: FileReader, logger: Logger) { ... }
}
```

When the `inject` decorator specifies no arguments; the DI container will attempt to look up the metadata that the TypeScript compiler has associated with the importer class. This approach is nice since it allows the constructor of the class to be the single source of truth for the information on what to inject.

{% hint style="info" %}
The secret of TypeScript's metadata generation is that _any_ decorator on the class will cause the compiler to include the metadata. You don't have to use the `inject` decorator specifically.
{% endhint %}

Besides the experimental nature of this feature, there are some drawbacks to be aware of:

* **You can only use classes for the types of your constructor parameters.** Interfaces don't exist at runtime, so using them, in this case, will result in missing metadata for the type at runtime. Using a symbol or other value won't work either. This constraint tends to be fairly limited in practice.
* **You cannot use custom resolvers.** See the section below to learn about resolvers like `all` and `lazy`. Since these provide additional information to the DI about resolving the dependency, they cannot stand in as a type for the TypeScript compiler to store in metadata.

If you have either of the above scenarios, you'll want to use an explicit dependency list through the decorator or the static property.

## Creating containers

An application typically has a single root-level DI container. To create a root container, call the `DI.createContainer()` method:

```typescript
import { DI } from 'aurelia';

const container = DI.createContainer();
```

Once you have a root-level container, you'll typically configure it with any services and then resolve your composition root, allowing you to kick off instantiation.

## Registering services

The DI container uses a technique called _auto-registration_. This means that if a class requests another class to be injected, and the requested class is not already registered with the container, the container will automatically register the class as a singleton, create the instance, and return it to the requestor.

Auto-registration works if everything is a singleton and you're using classes for dependencies everywhere and not using any interfaces or objects directly. That's very rarely the case, though. Additionally, you may want to declare the behavior of your services upfront, to make the code more understandable for other engineers. To do this, the DI container provides a registration API.

The primary API for registration is called `register` , and it can be used in combination with the `Registration` DSL. Here's an example:

```typescript
import { DI, Registration } from 'aurelia';

const container = DI.createContainer();
container.register(
  Registration.singleton(ProfileService, ProfileService),
  Registration.instance(fetch, fakeFetch)
);
```

With each registration, we provide a _key_ and a _value_. The _key_ is what consumers will use to request the dependency. The value is what the DI container will provide. The type of value you configure here depends on the registration type.&#x20;

Below is a list of available options, along with explanations:

* `Registration.instance(key: any, value: any): IRegistration` - Creates a registration for an existing object instance with the container so that the specified key can look it up.
* `Registration.singleton(key: any, value: Function): IRegistration` - Creates a registration for a singleton. The value is a class that will be instantiated when first requested. The DI container will retain a reference to the created instance and will return the same instance to all subsequent requestors.
* `Registration.transient(key: any, value: Function): IRegistration` - Creates a registration for a transient instance. The value is a class that will be instantiated whenever requested. The container does not retain a reference to the created instance.
*   `Registration.callback(key: any, value: ResolveCallback): IRegistration` - Creates a registration that enables custom instantiation and lifetime behavior. `ResolveCallback` is defined as follows:

    ```typescript
    type ResolveCallback<T = any> = (handler?: IContainer, requestor?: IContainer, resolver?: IResolver) => T;
    ```

    Provide a function with the above signature, and the container will invoke you each time it needs to resolve an instance. Note that the `resolver` that is provided as the third parameter is the resolver associated with your factory. As such, should your resolver need to store the state used across requests, it can store that state on the resolver instance itself.
* `Registration.alias(originalKey: any, aliasKey: any): IRegistration` - Creates a registration that allows access to a previous registration via an additional name. The `originalKey` is the key used in the original registration. The `aliasKey` is the 2nd (or 3rd, 4th, etc.) key that you also want to be able to resolve the same behavior.

You will notice that each of these helper methods returns an `IRegistration` implementation. The `register` method of the container can handle anything that implements this interface, so you can create your own registration implementations. Here's what that interface looks like:

```typescript
export interface IRegistration<T = any> {
  register(container: IContainer, key?: any): IResolver<T>;
}
```

> **Note:** For a deeper exploration of how to implement custom registrations and resolvers, [see the internal registration/resolver implementation](./resolvers.md#custom-resolvers) that handles all the registration scenarios listed above.

## Resolving services

In most cases, the resolution will happen automatically through constructor injection. However, you'll typically need to manually resolve the root service to kick the whole thing off. Other scenarios may come up that require manual resolution. To resolve from a container, call the `get` API on the container.

Here's an example:

```typescript
const profileService: ProfileService = container.get(ProfileService);
```

If there are multiple different implementations for the same key, then you can resolve all of them with the `getAll` API:

```typescript
const panels: Panel[] = container.getAll(Panel);
```

### Using interfaces

When using DI on other platforms, one would typically register services with an interface. However, TypeScript interfaces only exist at compile-time, not runtime, and the JavaScript language doesn't (currently) support interfaces. As a result, using an interface for the _registration key_ cannot work. However, a feature of the TypeScript language lets you get around this limitation. Because TypeScript can merge definitions, it's possible to create an interface and a symbol with the same name. Here's an example:

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
  static inject = [IProfileService];
  constructor(service: IProfileService) {
    // ...implementation...
  }
}

container.register(
  Registration.singleton(IProfileService, ProfileService)
);
```

{% hint style="warning" %}
Warning You cannot use decorator metadata in this case because the TypeScript compiler cannot understand that it should encode the variable value into the metadata in place of the interface (which gets erased).
{% endhint %}

Because this is such a handy compiler capability, the DI API provides a helper method with some benefits. We can optionally rework the above code to use this API like so:

```typescript
import { DI } from 'aurelia';

export const IProfileService = DI.createInterface<IProfileService>();
export interface IProfileService {
    // ...implementation...
}
```

This is slightly more verbose, but it has the advantage that the symbol created by the `DI.createInterface()` API "captures" the generic parameter, allowing it to work seamlessly with the `get` APIs of the container providing strong return types when manually resolving with these symbols.

#### Default interface implementations

In many front-end scenarios, it's common to have a single default implementation of your interface, which you provide "out of the box". To facilitate this scenario, the `DI.createInterface()` method accepts a callback that you can use to associate a default implementation with your interface.&#x20;

The consumer who sets up the container can still specify their own interface implementation at runtime. Still, if one is not provided, it will fall back to the default implementation specified through this method. This allows the container to use auto-registration with the symbols created by the `DI.createInterface()` helper.

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

## Property injection

The section below describes how to use `resolve` function to perform property injection, which is another form of dependency injection.

### Context

Often times as application grows, there's a need to extract & group some common functionalities to apply to multiple classes. There are many ways/techniques to do this,
e.g mixin, decorator, sub classing etc.... When working in class based applications, subclassing is the more one commonly seen technique. Normally there would be a base class
that requires a set of parameters during its construction, and provides a certain set of behaviors. In order to provide the base class the set of parameters it needs
during construction, we have to pass those from the constructor of the subclass. Constructor dependency injection cannot help in this case as it won't be able to call the
base call constructor to provide (or "inject") its required dependencies. The following example won't work:

```typescript
abstract class FormElementBase {
  static inject = [Element, FormController];

  constructor(host, formController) {
    this.form = host.form;
    this.formController = formController;
  }
}
```

Even though we declared the `static inject` on the `FormElementBase`, at runtime, Aurelia won't be able to see this information, or able to do anything with it,
as it will be constructing the subclass of this `FormElementBase` class. This results in undesirable boilerplate sometimes, especially when the parameters used in the
base class aren't needed in the subclass, like the following example:

```typescript
abstract class FormElementBase {
  static inject = [Element, FormController];

  constructor(host, formController) {
    this.form = host.form;
    this.formController = formController;
  }
}

export class MyInput extends FormElementBase {
  // redeclaring the injection
  static inject = [Element, FormController];
  constructor(host, formController) {
    // "inject" the dependencies
    super(host, formController);
    // do its own setup work here that doesn't need host or formController
  }
}
```

Property injection is a way to help handle this case. Imagine we can rewrite the above as

```typescript
abstract class FormElementBase {

  @inject(Element)
  form: Element

  @inject(FormController)
  formController: FormController
}

export class MyInput extends FormElementBase {
  constructor() {
    super();
    // do own work
  }
}
```

There's not much boilerplate anymore, and it's easier to manage the dependencies now, as when the base class needs more dependencies, it can declare on its own
and Aurelia DI system can just take care of that. From this example, we see there's a desirable use cases for the property injection capability.
<!-- maybe explain the draw back of using decorator with the old decorator -->
Aurelia provides a function `resolve` to meet this need.

### Using `resolve`

To use property injection with `resolve`, simply call it with the key, which often is the class that you want to "resolve" the value by. The above example could be rewritten like the following:

```typescript
import { resolve } from 'aurelia';

abstract class FormElementBase {

  form = resolve(Element);

  formController = resolve(FormController);
}

export class MyInput extends FormElementBase {
  constructor() {
    super();
    // do own work
  }
}
```

Because the `resolve(key)` call infers the returned type based on the type of `key` parameter, the properties `form` and `formController` will automatically get
the right types, there's no need to do duplicate work as in the case with decorator.

`resolve` can also be called with multiple keys, to get multiple values at once, like the following example:

```typescript
import { resolve } from 'aurelia';

abstract class FormElementBase {

  listeners = resolve(IChangeListener, ISubmitListener, IErrorListener);
}
```

Note that `resolve` can only be used when there is an active container. In other words, it can only be used within a dependency injection context. An attemp to `new FormElementBase` will result in an error as there's no active container.
Because Aurelia applications and its tests are mostly in the context of the dependency injection system, this constraint should not be an issue.

### Other `resolve` usages

While it's required that `resolve` must be called within the context of an active container, it does not necessarily mean that `resolve` can only be used within a class.
You can also move `resolve` to a helper function that resolve a dependency and do more setup work with it before assigning the final value to a property, like the following example:

{% code title="useFieldListeners.js" %}
```typescript
import { resolve, all } from 'aurelia';

export function useFieldListeners(field) {
  const listeners = resolve(all(IFieldListeners));

  if (field.type === 'checkbox') {
    return listeners.filter(listener =>
      listener.type === 'change'
      || listener.type === 'validate'
    );
  }

  return listeners;
}
```
{% endcode %}

{% code title="field-base.js" %}
```typescript
import { useFieldListeners } from './useFieldListeners';

abstract class FormElementBase {

  listeners = useFieldListeners(this);
}
```
{% endcode %}

Doing it this way, however may sometimes lead you to situation where you call those helper functions without a dependency injection context. In such cases, you'll see an error
like the following, in development mode:

```
AUR0016: There is not a currently active container. Are you trying to "new Class(...)" that has a resolve(...) call?
```

To fix this, ensure that you are using `container.get(SomeClass)` instead of `new SomeClass(...)`.
