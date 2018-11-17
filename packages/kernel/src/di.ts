/// <reference types="reflect-metadata" />
// tslint:disable:no-reserved-keywords
import { Constructable, IIndexable, Injectable, Primitive } from './interfaces';
import { PLATFORM } from './platform';
import { Reporter } from './reporter';

export type ResolveCallback<T = any> = (handler?: IContainer, requestor?: IContainer, resolver?: IResolver) => T;

export type Key<T> = InterfaceSymbol<T> | Primitive | IIndexable | Function;

export type InterfaceSymbol<T> = (target: Injectable<T>, property: string, index: number) => any;

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
  readonly type: Function;
  registerTransformer(transformer: (instance: T) => T): boolean;
  construct(container: IContainer, dynamicDependencies?: any[]): T;
}

export interface IServiceLocator {
  has(key: any, searchAncestors: boolean): boolean;

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
  register(...params: IRegistry[]): void;
  register(...params: Record<string, Partial<IRegistry>>[]): void;
  register(...params: (IRegistry | Record<string, Partial<IRegistry>>)[]): void;
  register(registry: Record<string, Partial<IRegistry>>): void;
  register(registry: IRegistry): void;
  register(registry: IRegistry | Record<string, Partial<IRegistry>>): void;

  registerResolver<T>(key: Key<T>, resolver: IResolver<T>): IResolver<T>;
  registerResolver<T extends Constructable>(key: T, resolver: IResolver<InstanceType<T>>): IResolver<InstanceType<T>>;

  registerTransformer<T>(key: Key<T>, transformer: (instance: T) => T): boolean;
  registerTransformer<T extends Constructable>(key: T, transformer: (instance: InstanceType<T>) => T): boolean;

  getResolver<T>(key: Key<T>, autoRegister?: boolean): IResolver<T> | null;
  getResolver<T extends Constructable>(key: T, autoRegister?: boolean): IResolver<InstanceType<T>> | null;

  getFactory<T extends Constructable>(type: T): IFactory<InstanceType<T>>;

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
if (!('getOwnMetadata' in Reflect)) {
  // tslint:disable-next-line:no-any
  Reflect.getOwnMetadata = function(metadataKey: any, target: Object): any {
    return (<IIndexable>target)[metadataKey];
  };

  // tslint:disable-next-line:no-any
  Reflect.metadata = function(metadataKey: any, metadataValue: any): (target: Function) => void {
    return function(target: Function): void {
      (<IIndexable>target)[metadataKey] = metadataValue;
    };
  };
}

export const DI = {
  createContainer(): IContainer {
    return new Container();
  },

  getDesignParamTypes(target: Function): Function[] {
    return Reflect.getOwnMetadata('design:paramtypes', target) || PLATFORM.emptyArray;
  },

  getDependencies(type: Function | Injectable): Function[] {
    let dependencies: Function[];

    if ((type as Injectable).inject === undefined) {
      dependencies = DI.getDesignParamTypes(type);
    } else {
      dependencies = [];
      let ctor = type as Injectable;

      while (typeof ctor === 'function') {
        if (ctor.hasOwnProperty('inject')) {
          dependencies.push(...ctor.inject);
        }

        ctor = Object.getPrototypeOf(ctor);
      }
    }

    return dependencies;
  },

  createInterface<T = any>(friendlyName?: string): IDefaultableInterfaceSymbol<T> {
    const Key: any = function(target: Injectable, property: string, index: number): any {
      Key.friendlyName = friendlyName || 'Interface';
      (target.inject || (target.inject = []))[index] = Key;
      return target;
    };

    Key.noDefault = function(): InterfaceSymbol<T> {
      return Key;
    };

    Key.withDefault = function(configure: (builder: IResolverBuilder<T>) => IResolver): InterfaceSymbol<T> {
      Key.withDefault = function(): void {
        throw Reporter.error(17, Key);
      };

      Key.register = function(container: IContainer, key?: Key<T>): IResolver<T> {
        const trueKey = key || Key;
        return configure({
          instance(value: T): IResolver {
            return container.registerResolver(trueKey, new Resolver(trueKey, ResolverStrategy.instance, value));
          },
          singleton(value: Function): IResolver {
            return container.registerResolver(trueKey, new Resolver(trueKey, ResolverStrategy.singleton, value));
          },
          transient(value: Function): IResolver {
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

      return Key;
    };

    return Key;
  },

  inject(...dependencies: Function[]): (target: any, key?: string, descriptor?: PropertyDescriptor | number) => void {
    return function(target: any, key?: string, descriptor?: PropertyDescriptor | number): void {
      if (typeof descriptor === 'number') { // It's a parameter decorator.
        if (!target.hasOwnProperty('inject')) {
          target.inject = DI.getDesignParamTypes(target).slice();
        }

        if (dependencies.length === 1) {
          target.inject[descriptor] = dependencies[0];
        }
      } else if (key) { // It's a property decorator. Not supported by the container without plugins.
        const actualTarget = target.constructor;
        (actualTarget.inject || (actualTarget.inject = {}))[key] = dependencies[0];
      } else if (descriptor) { // It's a function decorator (not a Class constructor)
        const fn = descriptor.value;
        fn.inject = dependencies;
      } else { // It's a class decorator.
        if (dependencies.length === 0) {
          target.inject = DI.getDesignParamTypes(target).slice();
        } else {
          target.inject = dependencies;
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
      return Registration.transient(target, target).register(container, target);
    };
    return <T & RegisterSelf<T>>target;
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
      return Registration.singleton(target, target).register(container, target);
    };
    return <T & RegisterSelf<T>>target;
  }
};

export const IContainer = DI.createInterface<IContainer>().noDefault();
export const IServiceLocator = IContainer as InterfaceSymbol<IServiceLocator>;

function createResolver(
  getter: (key: any, handler: IContainer, requestor: IContainer) => any
): (key: any) => ReturnType<typeof DI.inject> {
  return function(key: any): ReturnType<typeof DI.inject> {
    const Key = function Key(target: Injectable, property?: string, descriptor?: PropertyDescriptor | number): void {
      return DI.inject(Key)(target, property, descriptor);
    };

    (Key as any).resolve = function(handler: IContainer, requestor: IContainer): any {
      return getter(key, handler, requestor);
    };

    return Key;
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

export const all = createResolver((key: any, handler: IContainer, requestor: IContainer) => requestor.getAll(key));

export const lazy = createResolver((key: any, handler: IContainer, requestor: IContainer) =>  {
  let instance: any = null; // cache locally so that lazy always returns the same instance once resolved
  return () => {
    if (instance === null) {
      instance = requestor.get(key);
    }

    return instance;
  };
});

export const optional = createResolver((key: any, handler: IContainer, requestor: IContainer) =>  {
  if (requestor.has(key, true)) {
    return requestor.get(key);
  } else {
    return null;
  }
});

/*@internal*/
export const enum ResolverStrategy {
  instance = 0,
  singleton = 1,
  transient = 2,
  callback = 3,
  array = 4,
  alias = 5
}

/*@internal*/
export class Resolver implements IResolver, IRegistration {
  public key: any;
  public strategy: ResolverStrategy;
  public state: any;
  constructor(key: any, strategy: ResolverStrategy, state: any) {
    this.key = key;
    this.strategy = strategy;
    this.state = state;
  }

  public register(container: IContainer, key?: any): IResolver {
    return container.registerResolver(key || this.key, this);
  }

  public resolve(handler: IContainer, requestor: IContainer): any {
    switch (this.strategy) {
      case ResolverStrategy.instance:
        return this.state;
      case ResolverStrategy.singleton:
        this.strategy = ResolverStrategy.instance;
        return this.state = handler.getFactory(this.state).construct(handler);
      case ResolverStrategy.transient:
        // Always create transients from the requesting container
        return handler.getFactory(this.state).construct(requestor);
      case ResolverStrategy.callback:
        return (this.state as ResolveCallback)(handler, requestor, this);
      case ResolverStrategy.array:
        return this.state[0].resolve(handler, requestor);
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
        return container.getFactory(this.state);
      default:
        return null;
    }
  }
}

/*@internal*/
export interface IInvoker {
  invoke(container: IContainer, fn: Function, dependencies: any[]): any;
  invokeWithDynamicDependencies(
    container: IContainer,
    fn: Function,
    staticDependencies: any[],
    dynamicDependencies: any[]
  ): any;
}

/*@internal*/
export class Factory implements IFactory {
  public type: Function;
  private invoker: IInvoker;
  private dependencies: any[];
  private transformers: ((instance: any) => any)[] | null;

  constructor(type: Function, invoker: IInvoker, dependencies: any[]) {
    this.type = type;
    this.invoker = invoker;
    this.dependencies = dependencies;
    this.transformers = null;
  }

  public static create(type: Function): IFactory {
    const dependencies = DI.getDependencies(type);
    const invoker = classInvokers[dependencies.length] || fallbackInvoker;
    return new Factory(type, invoker, dependencies);
  }

  public construct(container: IContainer, dynamicDependencies?: any[]): any {
    const transformers = this.transformers;
    let instance = dynamicDependencies !== undefined
      ? this.invoker.invokeWithDynamicDependencies(container, this.type, this.dependencies, dynamicDependencies)
      : this.invoker.invoke(container, this.type, this.dependencies);

    if (transformers === null) {
      return instance;
    }

    for (let i = 0, ii = transformers.length; i < ii; ++i) {
      instance = transformers[i](instance);
    }

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

/*@internal*/
export interface IContainerConfiguration {
  factories?: Map<Function, IFactory>;
}

const containerResolver: IResolver = {
  resolve(handler: IContainer, requestor: IContainer): IContainer {
    return requestor;
  }
};

function isRegistry(obj: IRegistry | Record<string, IRegistry>): obj is IRegistry {
  return typeof obj.register === 'function';
}

/*@internal*/
export class Container implements IContainer {
  private parent: Container | null;
  private resolvers: Map<any, IResolver>;
  private factories: Map<Function, IFactory>;
  private configuration: IContainerConfiguration;

  constructor(configuration: IContainerConfiguration = {}) {
    this.parent = null;
    this.resolvers = new Map<any, IResolver>();
    this.configuration = configuration;
    this.factories = configuration.factories || (configuration.factories = new Map());
    this.resolvers.set(IContainer, containerResolver);
  }

  public register(registry: (IRegistry | Record<string, Partial<IRegistry>>)): void;
  public register(...params: (IRegistry | Record<string, Partial<IRegistry>>)[]): void {
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
  }

  public registerResolver(key: any, resolver: IResolver): IResolver {
    validateKey(key);

    const resolvers = this.resolvers;
    const result = resolvers.get(key);

    if (result === undefined) {
      resolvers.set(key, resolver);
    } else if (result instanceof Resolver && result.strategy === ResolverStrategy.array) {
      result.state.push(resolver);
    } else {
      resolvers.set(key, new Resolver(key, ResolverStrategy.array, [result, resolver]));
    }

    return resolver;
  }

  public registerTransformer(key: any, transformer: (instance: any) => any): boolean {
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

  public getResolver(key: any, autoRegister: boolean = true): IResolver | null {
    validateKey(key);

    if (key.resolve) {
      return key;
    }

    let current: Container = this;

    while (current !== null) {
      const resolver = current.resolvers.get(key);

      if (resolver === undefined) {
        if (current.parent === null) {
          return autoRegister ? this.jitRegister(key, current) : null;
        }

        current = current.parent;
      } else {
        return resolver;
      }
    }

    return null;
  }

  public has(key: any, searchAncestors: boolean = false): boolean {
    return this.resolvers.has(key)
      ? true
      : searchAncestors && this.parent !== null
      ? this.parent.has(key, true)
      : false;
  }

  public get(key: any): any {
    validateKey(key);

    if (key.resolve) {
      return key.resolve(this, this);
    }

    let current: Container = this;

    while (current !== null) {
      const resolver = current.resolvers.get(key);

      if (resolver === undefined) {
        if (current.parent === null) {
          return this.jitRegister(key, current).resolve(current, this);
        }

        current = current.parent;
      } else {
        return resolver.resolve(current, this);
      }
    }
  }

  public getAll(key: any): any {
    validateKey(key);

    let current: Container | null = this;

    while (current !== null) {
      const resolver = current.resolvers.get(key);

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

  public getFactory(type: Function): IFactory {
    let factory = this.factories.get(type);

    if (factory === undefined) {
      factory = Factory.create(type);
      this.factories.set(type, factory);
    }

    return factory;
  }

  public createChild(): IContainer {
    const child = new Container(this.configuration);
    child.parent = this;
    return child;
  }

  private jitRegister(keyAsValue: any, handler: Container): IResolver {
    if (keyAsValue.register) {
      const registrationResolver = keyAsValue.register(handler, keyAsValue);
      if (!(registrationResolver && registrationResolver.resolve)) {
        throw Reporter.error(40); // did not return a valid resolver from the static register method
      }
      return registrationResolver;
    }

    const resolver = new Resolver(keyAsValue, ResolverStrategy.singleton, keyAsValue);
    handler.resolvers.set(keyAsValue, resolver);
    return resolver;
  }
}

export const Registration = {
  instance(key: any, value: any): IRegistration {
    return new Resolver(key, ResolverStrategy.instance, value);
  },

  singleton(key: any, value: Function): IRegistration {
    return new Resolver(key, ResolverStrategy.singleton, value);
  },

  transient(key: any, value: Function): IRegistration {
    return new Resolver(key, ResolverStrategy.transient, value);
  },

  callback(key: any, callback: ResolveCallback): IRegistration {
    return new Resolver(key, ResolverStrategy.callback, callback);
  },

  alias(originalKey: any, aliasKey: any): IRegistration {
    return new Resolver(aliasKey, ResolverStrategy.alias, originalKey);
  },

  interpret(interpreterKey: any, ...rest: any[]): IRegistry {
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

/*@internal*/
export function validateKey(key: unknown): void {
  // note: design:paramTypes which will default to Object if the param types cannot be statically analyzed by tsc
  // this check is intended to properly report on that problem - under no circumstance should Object be a valid key anyway
  if (key === null || key === undefined || key === Object) {
    throw Reporter.error(5);
  }
}

function buildAllResponse(resolver: IResolver, handler: IContainer, requestor: IContainer): any[] {
  if (resolver instanceof Resolver && resolver.strategy === ResolverStrategy.array) {
    const state = resolver.state;
    let i = state.length;
    const results = new Array(i);

    while (i--) {
      results[i] = state[i].resolve(handler, requestor);
    }

    return results;
  }

  return [resolver.resolve(handler, requestor)];
}

/*@internal*/
export const classInvokers: IInvoker[] = [
  {
    invoke<T extends Constructable, K>(container: IContainer, Type: T): K {
      return new Type();
    },
    invokeWithDynamicDependencies
  },
  {
    invoke<T extends Constructable, K>(container: IContainer, Type: T, deps: any[]): K {
      return new Type(container.get(deps[0]));
    },
    invokeWithDynamicDependencies
  },
  {
    invoke<T extends Constructable, K>(container: IContainer, Type: T, deps: any[]): K {
      return new Type(container.get(deps[0]), container.get(deps[1]));
    },
    invokeWithDynamicDependencies
  },
  {
    invoke<T extends Constructable, K>(container: IContainer, Type: T, deps: any[]): K {
      return new Type(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]));
    },
    invokeWithDynamicDependencies
  },
  {
    invoke<T extends Constructable, K>(container: IContainer, Type: T, deps: any[]): K {
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
    invoke<T extends Constructable, K>(container: IContainer, Type: T, deps: any[]): K {
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

/*@internal*/
export const fallbackInvoker: IInvoker = {
  invoke: invokeWithDynamicDependencies as any,
  invokeWithDynamicDependencies
};

/*@internal*/
export function invokeWithDynamicDependencies<T extends Constructable, K>(
  container: IContainer,
  Type: T,
  staticDependencies: any[],
  dynamicDependencies: any[]
): K {
  let i = staticDependencies.length;
  let args = new Array(i);
  let lookup;

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
