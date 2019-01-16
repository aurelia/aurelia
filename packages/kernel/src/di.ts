/// <reference types="reflect-metadata" />
import { Constructable, IIndexable, Injectable, InterfaceSymbol, Primitive } from './interfaces';
import { PLATFORM } from './platform';
import { Reporter, Tracer } from './reporter';
import { IResourceType } from './resource';

const slice = Array.prototype.slice;

export type ResolveCallback<T = unknown> = (handler?: IContainer, requestor?: IContainer, resolver?: IResolver) => T;

export type Key<T> = InterfaceSymbol<T> | Primitive | IIndexable | Constructable;

export interface IDefaultableInterfaceSymbol<T> extends InterfaceSymbol<T> {
  withDefault(configure: (builder: IResolverBuilder<T>) => IResolver): InterfaceSymbol<T>;
  noDefault(): InterfaceSymbol<T>;
}

// This interface exists only to break a circular type referencing issue in the IServiceLocator interface.
// Otherwise IServiceLocator references IResolver, which references IContainer, which extends IServiceLocator.
interface IResolverLike<TValue, TContainer> {
  resolve(handler: TContainer, requestor: TContainer): TValue;
  getFactory?(container: TContainer): IFactory<TValue> | null;
}

export interface IResolver<T = any> extends IResolverLike<T, IContainer> { }

export interface IRegistration<T = any> {
  register(container: IContainer, key?: Key<T>): IResolver<T>;
}

export interface IFactory<T = any> {
  readonly Type: Constructable;
  registerTransformer(transformer: (instance: T) => T): boolean;
  construct(container: IContainer, dynamicDependencies?: Key<unknown>[]): T;
}

export interface IServiceLocator {
  has<K>(key: Constructable | Key<unknown> | IResolver<unknown> | K, searchAncestors: boolean): boolean;

  get<K>(key: Constructable | Key<unknown> | IResolver<unknown> | K):
    K extends InterfaceSymbol<infer T> ? T :
    K extends Constructable ? InstanceType<K> :
    K extends IResolverLike<infer T1, unknown> ? T1 extends Constructable ? InstanceType<T1> : T1 :
    K;

  getAll<K>(key: Constructable | Key<unknown> | IResolver<unknown> | K):
    K extends InterfaceSymbol<infer T> ? ReadonlyArray<T> :
    K extends Constructable ? ReadonlyArray<InstanceType<K>> :
    K extends IResolverLike<infer T1, unknown> ? T1 extends Constructable ? ReadonlyArray<InstanceType<T1>> : ReadonlyArray<T1> :
    ReadonlyArray<K>;
}

export interface IRegistry {
  register(container: IContainer): void;
}

export interface IContainer extends IServiceLocator {
  register(...params: IRegistry[]): IContainer;
  register(...params: Record<string, Partial<IRegistry>>[]): IContainer;
  register(...params: (IRegistry | Record<string, Partial<IRegistry>>)[]): IContainer;
  register(registry: Record<string, Partial<IRegistry>>): IContainer;
  register(registry: IRegistry): IContainer;
  register(registry: IRegistry | Record<string, Partial<IRegistry>>): IContainer;

  registerResolver<T>(key: Key<T>, resolver: IResolver<T>): IResolver<T>;
  registerResolver<T extends Constructable>(key: T, resolver: IResolver<InstanceType<T>>): IResolver<InstanceType<T>>;

  registerTransformer<T>(key: Key<T>, transformer: (instance: T) => T): boolean;
  registerTransformer<T extends Constructable>(key: T, transformer: (instance: InstanceType<T>) => T): boolean;

  getResolver<T>(key: Key<T>, autoRegister?: boolean): IResolver<T> | null;
  getResolver<T extends Constructable>(key: T, autoRegister?: boolean): IResolver<InstanceType<T>> | null;

  getFactory<T extends Constructable>(Type: T): IFactory<InstanceType<T>>;

  createChild(): IContainer;
}

export interface IResolverBuilder<T> {
  instance(value: T & IIndexable): IResolver;
  singleton(value: Constructable): IResolver;
  transient(value: Constructable): IResolver;
  callback(value: ResolveCallback<T>): IResolver;
  aliasTo(destinationKey: Key<T>): IResolver;
}

export type RegisterSelf<T extends Constructable> = {
  register(container: IContainer): IResolver<InstanceType<T>>;
};

// Shims to augment the Reflect object with methods used from the Reflect Metadata API proposal:
// https://www.typescriptlang.org/docs/handbook/decorators.html#metadata
// https://rbuckton.github.io/reflect-metadata/
// As the official spec proposal uses "any", we use it here as well and suppress related typedef linting warnings.
// tslint:disable:no-any ban-types
if (!('getOwnMetadata' in Reflect)) {
  Reflect.getOwnMetadata = function(metadataKey: any, target: Object): any {
    return (target as IIndexable)[metadataKey];
  };

  Reflect.metadata = function(metadataKey: any, metadataValue: any): (target: Function) => void {
    return function(target: Function): void {
      (target as IIndexable)[metadataKey] = metadataValue;
    };
  };
}
// tslint:enable:no-any ban-types

function createContainer(...params: IRegistry[]): IContainer;
function createContainer(...params: Record<string, Partial<IRegistry>>[]): IContainer;
function createContainer(...params: (IRegistry | Record<string, Partial<IRegistry>>)[]): IContainer;
function createContainer(registry: Record<string, Partial<IRegistry>>): IContainer;
function createContainer(registry: IRegistry): IContainer;
function createContainer(registry: IRegistry | Record<string, Partial<IRegistry>>): IContainer;
function createContainer(...params: (IRegistry | Record<string, Partial<IRegistry>>)[]): IContainer {
  if (arguments.length === 0) {
    return new Container();
  } else {
    return new Container().register(...params);
  }
}

export const DI = {
  createContainer,

  getDesignParamTypes(target: Constructable): Key<unknown>[] {
    return Reflect.getOwnMetadata('design:paramtypes', target) || PLATFORM.emptyArray;
  },

  getDependencies(Type: Constructable | Injectable): Key<unknown>[] {
    let dependencies: Key<unknown>[];

    if ((Type as Injectable).inject === undefined) {
      dependencies = DI.getDesignParamTypes(Type);
    } else {
      dependencies = [];
      let ctor = Type as Injectable;

      while (typeof ctor === 'function') {
        if (ctor.hasOwnProperty('inject')) {
          dependencies.push(...ctor.inject);
        }

        ctor = Object.getPrototypeOf(ctor);
      }
    }

    return dependencies;
  },

  createInterface<T = unknown>(friendlyName?: string): IDefaultableInterfaceSymbol<T> {
    const Interface: IDefaultableInterfaceSymbol<T> & Partial<IRegistration<T> & {friendlyName: string}> = function(target: Injectable, property: string, index: number): unknown {
      Interface.friendlyName = friendlyName || 'Interface';
      if (target === undefined) {
        throw Reporter.error(16, Interface.friendlyName, Interface); // TODO: add error (trying to resolve an InterfaceSymbol that has no registrations)
      }
      (target.inject || (target.inject = []))[index] = Interface;
      return target;
    };

    Interface.noDefault = function(): InterfaceSymbol<T> {
      return Interface;
    };

    Interface.withDefault = function(configure: (builder: IResolverBuilder<T>) => IResolver): InterfaceSymbol<T> {
      Interface.withDefault = function(): InterfaceSymbol<T> {
        throw Reporter.error(17, Interface);
      };

      Interface.register = function(container: IContainer, key?: Key<T>): IResolver<T> {
        const trueKey = key || Interface;
        return configure({
          instance(value: T): IResolver {
            return container.registerResolver(trueKey, new Resolver(trueKey, ResolverStrategy.instance, value));
          },
          singleton(value: Constructable): IResolver {
            return container.registerResolver(trueKey, new Resolver(trueKey, ResolverStrategy.singleton, value));
          },
          transient(value: Constructable): IResolver {
            return container.registerResolver(trueKey, new Resolver(trueKey, ResolverStrategy.transient, value));
          },
          callback(value: ResolveCallback): IResolver {
            return container.registerResolver(trueKey, new Resolver(trueKey, ResolverStrategy.callback, value));
          },
          aliasTo(destinationKey: T): IResolver {
            return container.registerResolver(trueKey, new Resolver(trueKey, ResolverStrategy.alias, destinationKey));
          },
        });
      };

      return Interface;
    };

    return Interface;
  },

  inject(...dependencies: Key<unknown>[]): (target: Injectable, key?: string, descriptor?: PropertyDescriptor | number) => void {
    return function(target: Injectable, key?: string, descriptor?: PropertyDescriptor | number): void {
      if (typeof descriptor === 'number') { // It's a parameter decorator.
        if (!target.hasOwnProperty('inject')) {
          const types = DI.getDesignParamTypes(target);
          target.inject = types.slice() as Constructable[];
        }

        if (dependencies.length === 1) {
          target.inject[descriptor] = dependencies[0] as Constructable;
        }
      } else if (key) { // It's a property decorator. Not supported by the container without plugins.
        const actualTarget = target.constructor as Injectable;
        (actualTarget.inject || ((actualTarget.inject as unknown) = {}))[key] = dependencies[0];
      } else if (descriptor) { // It's a function decorator (not a Class constructor)
        const fn = descriptor.value;
        fn.inject = dependencies;
      } else { // It's a class decorator.
        if (dependencies.length === 0) {
          const types = DI.getDesignParamTypes(target);
          target.inject = types.slice() as Constructable[];
        } else {
          target.inject = dependencies as Constructable[];
        }
      }
    };
  },

  // tslint:disable:jsdoc-format
  /**
   * Registers the `target` class as a transient dependency; each time the dependency is resolved
   * a new instance will be created.
   *
   * @param target The class / constructor function to register as transient.
   * @returns The same class, with a static `register` method that takes a container and returns the appropriate resolver.
   *
   * Example usage:
```ts
// On an existing class
class Foo { }
DI.transient(Foo);

// Inline declaration
const Foo = DI.transient(class { });
// Foo is now strongly typed with register
Foo.register(container);
```
   */
  // tslint:enable:jsdoc-format
  transient<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T> {
    target.register = function register(container: IContainer): IResolver<InstanceType<T>> {
      const registration = Registration.transient(target, target);
      return registration.register(container, target);
    };
    return target as T & RegisterSelf<T>;
  },

  // tslint:disable:jsdoc-format
  /**
   * Registers the `target` class as a singleton dependency; the class will only be created once. Each
   * consecutive time the dependency is resolved, the same instance will be returned.
   *
   * @param target The class / constructor function to register as a singleton.
   * @returns The same class, with a static `register` method that takes a container and returns the appropriate resolver.
   * Example usage:
```ts
// On an existing class
class Foo { }
DI.singleton(Foo);

// Inline declaration
const Foo = DI.singleton(class { });
// Foo is now strongly typed with register
Foo.register(container);
```
   */
  // tslint:enable:jsdoc-format
  singleton<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T> {
    target.register = function register(container: IContainer): IResolver<InstanceType<T>> {
      const registration = Registration.singleton(target, target);
      return registration.register(container, target);
    };
    return target as T & RegisterSelf<T>;
  }
};

export const IContainer = DI.createInterface<IContainer>('IContainer').noDefault();
export const IServiceLocator = IContainer as InterfaceSymbol<IServiceLocator>;

function createResolver(getter: (key: unknown, handler: IContainer, requestor: IContainer) => any): (key: unknown) => ReturnType<typeof DI.inject> {
  return function(key: unknown): ReturnType<typeof DI.inject> {
    const resolver: InterfaceSymbol<{}> & Partial<Pick<IResolver, 'resolve'>> = function (target: Injectable, property?: string, descriptor?: PropertyDescriptor | number): void {
      DI.inject(resolver)(target, property, descriptor);
    };

    resolver.resolve = function(handler: IContainer, requestor: IContainer): any {
      return getter(key, handler, requestor);
    };

    return resolver;
  };
}

export const inject = DI.inject;

function transientDecorator<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T> {
  return DI.transient(target);
}
// tslint:disable:jsdoc-format
/**
 * Registers the decorated class as a transient dependency; each time the dependency is resolved
 * a new instance will be created.
 *
 * Example usage:
```ts
@transient
class Foo { }
```
 */
// tslint:enable:jsdoc-format
export function transient<T extends Constructable>(): typeof transientDecorator;
// tslint:disable:jsdoc-format
/**
 * Registers the `target` class as a transient dependency; each time the dependency is resolved
 * a new instance will be created.
 *
 * @param target The class / constructor function to register as transient.
 *
 * Example usage:
```ts
@transient()
class Foo { }
```
 */
// tslint:enable:jsdoc-format
export function transient<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
export function transient<T extends Constructable>(target?: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T> | typeof transientDecorator {
  return target === undefined ? transientDecorator : transientDecorator(target);
}

function singletonDecorator<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T> {
  return DI.singleton(target);
}
// tslint:disable:jsdoc-format
/**
 * Registers the decorated class as a singleton dependency; the class will only be created once. Each
 * consecutive time the dependency is resolved, the same instance will be returned.
 *
 * Example usage:
```ts
@singleton
class Foo { }
```
 */
// tslint:enable:jsdoc-format
export function singleton<T extends Constructable>(): typeof singletonDecorator;
// tslint:disable:jsdoc-format
/**
 * Registers the `target` class as a singleton dependency; the class will only be created once. Each
 * consecutive time the dependency is resolved, the same instance will be returned.
 *
 * @param target The class / constructor function to register as a singleton.
 *
 * Example usage:
```ts
@singleton()
class Foo { }
```
 */
// tslint:enable:jsdoc-format
export function singleton<T extends Constructable>(target: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T>;
export function singleton<T extends Constructable>(target?: T & Partial<RegisterSelf<T>>): T & RegisterSelf<T> | typeof singletonDecorator {
  return target === undefined ? singletonDecorator : singletonDecorator(target);
}

export const all = createResolver((key: unknown, handler: IContainer, requestor: IContainer) => requestor.getAll(key));

export const lazy = createResolver((key: unknown, handler: IContainer, requestor: IContainer) =>  {
  let instance: unknown = null; // cache locally so that lazy always returns the same instance once resolved
  return () => {
    if (instance === null) {
      instance = requestor.get(key);
    }

    return instance;
  };
});

export const optional = createResolver((key: unknown, handler: IContainer, requestor: IContainer) =>  {
  if (requestor.has(key, true)) {
    return requestor.get(key);
  } else {
    return null;
  }
});

/** @internal */
export const enum ResolverStrategy {
  instance = 0,
  singleton = 1,
  transient = 2,
  callback = 3,
  array = 4,
  alias = 5
}

/** @internal */
export class Resolver implements IResolver, IRegistration {
  public key: Key<unknown>;
  public strategy: ResolverStrategy;
  public state: unknown;
  constructor(key: Key<unknown>, strategy: ResolverStrategy, state: unknown) {
    this.key = key;
    this.strategy = strategy;
    this.state = state;
  }

  public register(container: IContainer, key?: Key<unknown>): IResolver {
    return container.registerResolver(key || this.key, this);
  }

  public resolve(handler: IContainer, requestor: IContainer): unknown {
    switch (this.strategy) {
      case ResolverStrategy.instance:
        return this.state;
      case ResolverStrategy.singleton: {
        this.strategy = ResolverStrategy.instance;
        const factory = handler.getFactory(this.state as Constructable);
        return this.state = factory.construct(handler);
      }
      case ResolverStrategy.transient: {
        // Always create transients from the requesting container
        const factory = handler.getFactory(this.state as Constructable);
        return factory.construct(requestor);
      }
      case ResolverStrategy.callback:
        return (this.state as ResolveCallback)(handler, requestor, this);
      case ResolverStrategy.array:
        return (this.state as IResolver[])[0].resolve(handler, requestor);
      case ResolverStrategy.alias:
        return handler.get(this.state);
      default:
        throw Reporter.error(6, this.strategy);
    }
  }

  public getFactory(container: IContainer): IFactory | null {
    switch (this.strategy) {
      case ResolverStrategy.singleton:
      case ResolverStrategy.transient:
        return container.getFactory(this.state as Constructable);
      default:
        return null;
    }
  }
}

/** @internal */
export interface IInvoker {
  invoke(container: IContainer, fn: Constructable, dependencies: Key<unknown>[]): Constructable;
  invokeWithDynamicDependencies(
    container: IContainer,
    fn: Constructable,
    staticDependencies: Key<unknown>[],
    dynamicDependencies: Key<unknown>[]
  ): Constructable;
}

/** @internal */
export class Factory implements IFactory {
  public Type: Constructable;
  private readonly invoker: IInvoker;
  private readonly dependencies: Key<unknown>[];
  private transformers: ((instance: any) => any)[] | null;

  constructor(Type: Constructable, invoker: IInvoker, dependencies: Key<unknown>[]) {
    this.Type = Type;
    this.invoker = invoker;
    this.dependencies = dependencies;
    this.transformers = null;
  }

  public static create(Type: Constructable): IFactory {
    const dependencies = DI.getDependencies(Type);
    const invoker = classInvokers[dependencies.length] || fallbackInvoker;
    return new Factory(Type, invoker, dependencies);
  }

  public construct(container: IContainer, dynamicDependencies?: Key<unknown>[]): Constructable {
    if (Tracer.enabled) { Tracer.enter(`Factory.construct`, slice.call(arguments).concat(this.Type)); }
    const transformers = this.transformers;
    let instance = dynamicDependencies !== undefined
      ? this.invoker.invokeWithDynamicDependencies(container, this.Type, this.dependencies, dynamicDependencies)
      : this.invoker.invoke(container, this.Type, this.dependencies);

    if (transformers === null) {
      if (Tracer.enabled) { Tracer.leave(); }
      return instance;
    }

    for (let i = 0, ii = transformers.length; i < ii; ++i) {
      instance = transformers[i](instance);
    }

    if (Tracer.enabled) { Tracer.leave(); }
    return instance;
  }

  public registerTransformer(transformer: (instance: any) => any): boolean {
    if (this.transformers === null) {
      this.transformers = [];
    }

    this.transformers.push(transformer);
    return true;
  }
}

/** @internal */
export interface IContainerConfiguration {
  factories?: Map<Constructable, IFactory>;
  resourceLookup?: Record<string, IResourceType<unknown, unknown>>;
}

const containerResolver: IResolver = {
  resolve(handler: IContainer, requestor: IContainer): IContainer {
    return requestor;
  }
};

function isRegistry(obj: IRegistry | Record<string, IRegistry>): obj is IRegistry {
  return typeof obj.register === 'function';
}

/** @internal */
export class Container implements IContainer {
  private parent: Container | null;
  private readonly resolvers: Map<InterfaceSymbol<IContainer>, IResolver>;
  private readonly factories: Map<Constructable, IFactory>;
  private readonly configuration: IContainerConfiguration;
  private readonly resourceLookup: Record<string, IResolver>;

  constructor(configuration: IContainerConfiguration = {}) {
    this.parent = null;
    this.resolvers = new Map<InterfaceSymbol<IContainer>, IResolver>();
    this.configuration = configuration;
    this.factories = configuration.factories || (configuration.factories = new Map());
    this.resourceLookup = configuration.resourceLookup || (configuration.resourceLookup = Object.create(null));
    this.resolvers.set(IContainer, containerResolver);
  }

  public register(...params: IRegistry[]): this;
  public register(...params: Record<string, Partial<IRegistry>>[]): this;
  public register(...params: (IRegistry | Record<string, Partial<IRegistry>>)[]): this;
  public register(registry: Record<string, Partial<IRegistry>>): this;
  public register(registry: IRegistry): this;
  public register(registry: IRegistry | Record<string, Partial<IRegistry>>): this;
  public register(...params: (IRegistry | Record<string, Partial<IRegistry>>)[]): this {
    for (let i = 0, ii = params.length; i < ii; ++i) {
      const current = params[i] as IRegistry | Record<string, IRegistry>;
      if (isRegistry(current)) {
        current.register(this);
      } else {
        const keys = Object.keys(current);
        for (let j = 0, jj = keys.length; j < jj; ++j) {
          const value = current[keys[j]];
          // note: we could remove this if-branch and call this.register directly
          // - the extra check is just a perf tweak to create fewer unnecessary arrays by the spread operator
          if (isRegistry(value)) {
            value.register(this);
          } else {
            this.register(value);
          }
        }
      }
    }
    return this;
  }

  public registerResolver(key: Key<IContainer>, resolver: IResolver): IResolver {
    validateKey(key);

    const resolvers = this.resolvers;
    const result = resolvers.get(key as InterfaceSymbol<IContainer>);

    if (result === undefined) {
      resolvers.set(key as InterfaceSymbol<IContainer>, resolver);
      if (typeof key === 'string') {
        this.resourceLookup[key] = resolver;
      }
    } else if (result instanceof Resolver && result.strategy === ResolverStrategy.array) {
      (result.state as IResolver[]).push(resolver);
    } else {
      resolvers.set(key as InterfaceSymbol<IContainer>, new Resolver(key, ResolverStrategy.array, [result, resolver]));
    }

    return resolver;
  }

  public registerTransformer(key: IResolver, transformer: (instance: any) => any): boolean {
    const resolver = this.getResolver(key);

    if (resolver === null) {
      return false;
    }

    if (resolver.getFactory) {
      const handler = resolver.getFactory(this);

      if (handler === null) {
        return false;
      }

      return handler.registerTransformer(transformer);
    }

    return false;
  }

  public getResolver(key: Key<IContainer> | IResolver, autoRegister: boolean = true): IResolver | null {
    validateKey(key);

    if ((key as IResolver).resolve) {
      return key as IResolver;
    }

    let current: Container = this;

    while (current !== null) {
      const resolver = current.resolvers.get(key as InterfaceSymbol<IContainer>);

      if (resolver === undefined) {
        if (current.parent === null) {
          return autoRegister ? this.jitRegister(key as InterfaceSymbol<IContainer>, current) : null;
        }

        current = current.parent;
      } else {
        return resolver;
      }
    }

    return null;
  }

  public has(key: Key<IContainer>, searchAncestors: boolean = false): boolean {
    return this.resolvers.has(key as InterfaceSymbol<IContainer>)
      ? true
      : searchAncestors && this.parent !== null
      ? this.parent.has(key, true)
      : false;
  }

  public get(key: Key<IContainer>|IResolver): any {
    if (Tracer.enabled) { Tracer.enter(`Container.get`, slice.call(arguments)); }
    validateKey(key);

    if ((key as IResolver).resolve) {
      if (Tracer.enabled) { Tracer.leave(); }
      return (key as IResolver).resolve(this, this);
    }

    let current: Container = this;

    while (current !== null) {
      let resolver = current.resolvers.get(key as InterfaceSymbol<IContainer>);

      if (resolver === undefined) {
        if (current.parent === null) {
          resolver = this.jitRegister(key as InterfaceSymbol<IContainer>, current);
          if (Tracer.enabled) { Tracer.leave(); }
          return resolver.resolve(current, this);
        }

        current = current.parent;
      } else {
        if (Tracer.enabled) { Tracer.leave(); }
        return resolver.resolve(current, this);
      }
    }
  }

  public getAll(key: Key<IContainer>): any {
    validateKey(key);

    let current: Container | null = this;

    while (current !== null) {
      const resolver = current.resolvers.get(key as InterfaceSymbol<IContainer>);

      if (resolver === undefined) {
        if (this.parent === null) {
          return PLATFORM.emptyArray;
        }

        current = current.parent;
      } else {
        return buildAllResponse(resolver, current, this);
      }
    }

    return PLATFORM.emptyArray;
  }

  public getFactory(Type: Constructable): IFactory {
    let factory = this.factories.get(Type);

    if (factory === undefined) {
      factory = Factory.create(Type);
      this.factories.set(Type, factory);
    }

    return factory;
  }

  public createChild(): IContainer {
    const config = this.configuration;
    const childConfig = { factories: config.factories, resourceLookup: { ...config.resourceLookup } };
    const child = new Container(childConfig);
    child.parent = this;
    return child;
  }

  private jitRegister(keyAsValue: Key<IContainer>|IRegistration, handler: Container): IResolver {
    if ((keyAsValue as IRegistration).register) {
      const registrationResolver = (keyAsValue as IRegistration).register(handler, keyAsValue);
      if (!(registrationResolver && registrationResolver.resolve)) {
        throw Reporter.error(40); // did not return a valid resolver from the static register method
      }
      return registrationResolver;
    }

    const resolver = new Resolver(keyAsValue, ResolverStrategy.singleton, keyAsValue);
    handler.resolvers.set(keyAsValue as InterfaceSymbol<IContainer>, resolver);
    return resolver;
  }
}

export const Registration = {
  instance(key: Key<unknown>, value: unknown): IRegistration {
    return new Resolver(key, ResolverStrategy.instance, value);
  },

  singleton(key: Key<unknown>, value: Constructable): IRegistration {
    return new Resolver(key, ResolverStrategy.singleton, value);
  },

  transient(key: Key<unknown>, value: Constructable): IRegistration {
    return new Resolver(key, ResolverStrategy.transient, value);
  },

  callback(key: Key<unknown>, callback: ResolveCallback): IRegistration {
    return new Resolver(key, ResolverStrategy.callback, callback);
  },

  alias(originalKey: Key<unknown>, aliasKey: Key<unknown>): IRegistration {
    return new Resolver(aliasKey, ResolverStrategy.alias, originalKey);
  },

  interpret(interpreterKey: Key<{}>, ...rest: Constructable[]): IRegistry {
    return {
      register(container: IContainer): void {
        const resolver = container.getResolver<IRegistry>(interpreterKey);

        if (resolver !== null) {
          let registry: IRegistry | null =  null;

          if (resolver.getFactory) {
            const factory = resolver.getFactory(container);

            if (factory !== null) {
              registry = factory.construct(container, rest);
            }
          } else {
            registry = resolver.resolve(container, container);
          }

          if (registry !== null) {
            registry.register(container);
          }
        }
      }
    };
  }
};

/** @internal */
export function validateKey(key: unknown): void {
  // note: design:paramTypes which will default to Object if the param types cannot be statically analyzed by tsc
  // this check is intended to properly report on that problem - under no circumstance should Object be a valid key anyway
  if (key === null || key === undefined || key === Object) {
    throw Reporter.error(5);
  }
}

function buildAllResponse(resolver: IResolver, handler: IContainer, requestor: IContainer): any[] {
  if (resolver instanceof Resolver && resolver.strategy === ResolverStrategy.array) {
    const state = resolver.state as IResolver[];
    let i = state.length;
    const results = new Array(i);

    while (i--) {
      results[i] = state[i].resolve(handler, requestor);
    }

    return results;
  }

  return [resolver.resolve(handler, requestor)];
}

/** @internal */
export const classInvokers: IInvoker[] = [
  {
    invoke<T extends Constructable, K>(container: IContainer, Type: T): K {
      return new Type();
    },
    invokeWithDynamicDependencies
  },
  {
    invoke<T extends Constructable, K>(container: IContainer, Type: T, deps: Key<unknown>[]): K {
      return new Type(container.get(deps[0]));
    },
    invokeWithDynamicDependencies
  },
  {
    invoke<T extends Constructable, K>(container: IContainer, Type: T, deps: Key<unknown>[]): K {
      return new Type(container.get(deps[0]), container.get(deps[1]));
    },
    invokeWithDynamicDependencies
  },
  {
    invoke<T extends Constructable, K>(container: IContainer, Type: T, deps: Key<unknown>[]): K {
      return new Type(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]));
    },
    invokeWithDynamicDependencies
  },
  {
    invoke<T extends Constructable, K>(container: IContainer, Type: T, deps: Key<unknown>[]): K {
      return new Type(
        container.get(deps[0]),
        container.get(deps[1]),
        container.get(deps[2]),
        container.get(deps[3])
      );
    },
    invokeWithDynamicDependencies
  },
  {
    invoke<T extends Constructable, K>(container: IContainer, Type: T, deps: Key<unknown>[]): K {
      return new Type(
        container.get(deps[0]),
        container.get(deps[1]),
        container.get(deps[2]),
        container.get(deps[3]),
        container.get(deps[4])
      );
    },
    invokeWithDynamicDependencies
  }
];

/** @internal */
export const fallbackInvoker: IInvoker = {
  invoke: invokeWithDynamicDependencies as (container: IContainer, fn: Constructable, dependencies: Key<unknown>[]) => Constructable,
  invokeWithDynamicDependencies
};

/** @internal */
export function invokeWithDynamicDependencies<T extends Constructable, K>(
  container: IContainer,
  Type: T,
  staticDependencies: Key<unknown>[],
  dynamicDependencies: Key<unknown>[]
): K {
  let i = staticDependencies.length;
  let args: Key<unknown>[] = new Array(i);
  let lookup: Key<unknown>;

  while (i--) {
    lookup = staticDependencies[i];

    if (lookup === null || lookup === undefined) {
      throw Reporter.error(7, `Index ${i}.`);
    } else {
      args[i] = container.get(lookup);
    }
  }

  if (dynamicDependencies !== undefined) {
    args = args.concat(dynamicDependencies);
  }

  return Reflect.construct(Type, args);
}
