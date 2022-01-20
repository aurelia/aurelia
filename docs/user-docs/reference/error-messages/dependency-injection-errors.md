# Dependency Injection errors

### AUR0001

**Parameters**: Interface name

**Error message**: Attempted to jitRegister an intrinsic type: `yyyy`. Did you forget to add @inject(Key)

**Error explanation**: A DI container is trying to resolve an instance of an interface, but there is no registration for it.

### AUR0002

**Parameters**: Name of the key being resolved

**Error message**: `yyyy` not registered, did you forget to add @singleton()?

**Error explanation**: A DI container is trying to resolve a key, but there's not a known strategy for it.

### AUR0003

**Parameters**: Name of the key being resolved

**Error message**: Cyclic dependency found: `name`

**Error explanation**: Cyclic dependencies found. This means that you have tried including a dependency in your application that is trying to include the dependency you're loading.

**Possible solution:**

This happens when there is a dependency graph that looks like this: `A --> B --> A` or `A --> B --> C --> A`, check your code and extract what in `A` that causes the cyclic dependencies into a separate file, and refer to that from both `A` and `B`

### AUR0004

**Parameters**: String version of the key being resolved

**Error message**: Resolver for `yyyy` returned a null factory

**Error explanation**: No factory found for transient registration

**Possible solution:**

This means the transient registration you gave to a container wasn't with a proper factory registered along with it, consider using `container.registerFactory(IMyInterface, someFactoryObject)`

### AUR0005

**Parameters**: strategy(string)

**Error message**: Invalid resolver strategy specified: `yyyy`

**Error explanation**: This means the internal state of the Internal `Resolver` has been modified, into an invalid value

**Possible solution:**

Check your code where there's an invalid assignment to a resolver strategy, that may look like `resolver.strategy = ...`

### AUR0006

**Parameters**: list of registering parameters

**Error message**: Unable to autoregister dependency: \[`yyyy`]

**Error explanation**: This means during the registration of some value with a container, it has reached the depth 100, which is an extreme case, and is considered invalid

**Possible solution:**

Check your dependency graph, if it's really complex, which could happen over time, maybe inject a container and resolve the dependencies lazily instead, where possible

### AUR0007

**Parameters**: resource key

**Error message**: Resource key "`yyyy`" already registered

**Error explanation**: This means there is a resource with that name already registered with a container

**Possible solution:**

Consider using a different name for the resource (element/attribute/value converter/binding behavior etc...)

### AUR0008

**Parameters**: key(string)

**Error message**: Unable to resolve key: `yyyy`

**Error explanation**: This means a container has failed to resolve a key in the call `container.get(key)`

**Possible solution:**

This requires specific debugging as it shouldn't happen, with all the default strategies to resolve for various kinds of keys

### AUR0009

**Parameters**: key(any)

**Error message**: Attempted to jitRegister something that is not a constructor: '`yyyy`'. Did you forget to register this resource?

**Error explanation**: This means a `container.get(key)` call happens without any prior knowledge for the container to resolve the `key` given. And the container is unable to instantiate this key as it's not a class (or a normal function).

**Possible solution:**

Consider registering the key with the container, or parent or root containers before making the call

### AUR0010

**Parameters**: key(any)

**Error message**: Attempted to jitRegister something that is not a constructor: '`yyyy`'. Did you forget to register this resource?

**Error explanation**: This means a `container.get(key)` call happens with key being built in type functions such as `String`/`Number`/`Array` etc..

**Error explanation**: This means a `container.get(key)` call happens without any prior knowledge for the container to resolve the `key` given. And the container is unable to instantiate this key as it's not a class (or a normal function).

**Possible solution:**

This could happen from TS generated code where it fails to generate proper metadata, or forgotten registration, consider checking the output of TS when `emitDecoratorMetadata` is on, or remember to register a resolution for those built-in types

### AUR0011

**Parameters**: -

**Error message**: Invalid resolver returned from the static register method

**Error explanation**: `container.get(key)` was called with the `key` having a `register` method. But this `register` method did not result in an actual registration with a container

**Possible solution:**

Check the `register` method on the `key`

### AUR0012

**Parameters**: name(string)

**Error message**: Attempted to jitRegister an interface: `yyyy`

**Error explanation**: `container.get(key)` was called with `key` being an interface with no prior registration

**Possible solution:**

Register the interface with the container before calling `container.get()`

### AUR0013

**Parameters**: name(string)

**Error message**: Cannot call resolve `yyyy` before calling prepare or after calling dispose.

**Error explanation**: An `InstanceProvider.resolve()` call happens without having an any instance provided.

**Possible solution:**

Call `InstanceProvider.prepare(instance)` before resolving, or instantiate the `InstanceProvider` with an instance in the 2nd parameter

### AUR0014

**Parameters**: -

**Error message**: key/value cannot be null or undefined. Are you trying to inject/register something that doesn't exist with DI?

**Error explanation**: A key was `null`/`undefined` in a `container.get`/`.getAll` call

**Possible solution:**

Make sure the key is not `null`/`undefined`. This sometimes can happen with bundler that leaves circular dependency handling to applications, e.x: Webpack

### AUR0015

**Parameters**: name(string)

**Error message**: `yyyy` is a native function and therefore cannot be safely constructed by DI. If this is intentional, please use a callback or cachedCallback resolver.

**Error explanation**: A `container.invoke(key)` or `container.getFactory(key)` call happens with the key being one of the built-in types like `String`/`Number`/`Array`

**Possible solution:**

Consider avoid using these keys for those calls
