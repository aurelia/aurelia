// tslint:disable:no-reserved-keywords
import { Constructable, IIndexable, Injectable, Primitive } from './interfaces';
import { PLATFORM } from './platform';
import { Reporter } from './reporter';

export type ResolveCallback<T = any> = (handler?: IContainer, requestor?: IContainer, resolver?: IResolver) => T;

export type Key<T> = InterfaceSymbol<T> | Primitive | IIndexable | Function;

export type InterfaceSymbol<T> = (target: Injectable, property: string, index: number) => any;

export interface IDefaultableInterfaceSymbol<T> extends InterfaceSymbol<T> {
  withDefault(configure: (builder: IResolverBuilder<T>) => IResolver): InterfaceSymbol<T>;
  noDefault(): InterfaceSymbol<T>;
}

export interface IResolver<T = any> {
  resolve(handler: IContainer, requestor: IContainer): T;
  getFactory?(container: IContainer): IFactory<T> | null;
}

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

  get<T>(key: Key<T>): T;
  get<T extends Constructable>(key: T): InstanceType<T>;

  getAll<T>(key: Key<T>): ReadonlyArray<T>;
  getAll<T extends Constructable>(key: T): ReadonlyArray<InstanceType<T>>;
}

export interface IRegistry {
  register(container: IContainer): void;
}

export interface IContainer extends IServiceLocator {
  register(...params: (IRegistry | Record<string, Partial<IRegistry>>)[]): void;
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
  singleton(value: Constructable<T>): IResolver;
  transient(value: Constructable<T>): IResolver;
  callback(value: ResolveCallback<T>): IResolver;
  aliasTo(destinationKey: Key<T>): IResolver;
}

if (!('getOwnMetadata' in Reflect)) {
  (Reflect as any).getOwnMetadata = function(key: string, target: any): any {
    return target[key];
  };

  (Reflect as any).metadata = function(key: string, value: any): (target: any) => void {
    return function(target: any): void {
      target[key] = value;
    };
  };
}

export const DI = {
  createContainer(): IContainer {
    return new Container();
  },

  getDesignParamTypes(target: any): any[] {
    return (Reflect as any).getOwnMetadata('design:paramtypes', target) || PLATFORM.emptyArray;
  },

  getDependencies(type: Function & { inject?: any }): any[] {
    let dependencies: any[];

    if (type.inject === undefined) {
      dependencies = DI.getDesignParamTypes(type);
    } else {
      dependencies = [];
      let ctor = type;

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
      const inject = target.inject || (target.inject = []);
      (Key as any).friendlyName = friendlyName || 'Interface';
      inject[index] = Key;
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
        return configure({
          instance(value: T): IResolver {
            return container.registerResolver(Key, new Resolver(key || Key, ResolverStrategy.instance, value));
          },
          singleton(value: Function): IResolver {
            return container.registerResolver(Key, new Resolver(key || Key, ResolverStrategy.singleton, value));
          },
          transient(value: Function): IResolver {
            return container.registerResolver(Key, new Resolver(key || Key, ResolverStrategy.transient, value));
          },
          callback(value: ResolveCallback): IResolver {
            return container.registerResolver(Key, new Resolver(key || Key, ResolverStrategy.callback, value));
          },
          aliasTo(destinationKey: T): IResolver {
            return container.registerResolver(destinationKey, new Resolver(key || Key, ResolverStrategy.alias, Key));
          },
        });
      };

      return Key;
    };

    return Key;
  },

  inject(...dependencies: any[]): (target: any, property?: string, descriptor?: PropertyDescriptor | number) => any {
    return function(target: any, key?, descriptor?) {
      if (typeof descriptor === 'number') { // It's a parameter decorator.
        if (!target.hasOwnProperty('inject')) {
          target.inject = DI.getDesignParamTypes(target).slice();
        }

        if (dependencies.length === 1) {
          target.inject[descriptor] = dependencies[0];
        }
      } else if (key) { // It's a property decorator. Not supported by the container without plugins.
        const actualTarget = target.constructor;
        const inject = actualTarget.inject || (actualTarget.inject = {});
        inject[key] = dependencies[0];
      } else if (descriptor) { // It's a function decorator (not a Class constructor)
        const fn = descriptor.value;
        fn.inject = dependencies;
      } else { // It's a class decorator.
        if (!dependencies || dependencies.length === 0) {
          target.inject = DI.getDesignParamTypes(target).slice();
        } else {
          target.inject = dependencies;
        }
      }
    };
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
  constructor(public key: any, public strategy: ResolverStrategy, public state: any) {}

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
  private transformers: ((instance: any) => any)[] | null = null;

  constructor(public type: Function, private invoker: IInvoker, private dependencies: any[]) { }

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
  private parent: Container | null = null;
  private resolvers: Map<any, IResolver> = new Map<any, IResolver>();
  private factories: Map<Function, IFactory>;
  private configuration: IContainerConfiguration;

  constructor(configuration: IContainerConfiguration = {}) {
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
    } else if (result instanceof Resolver && (result as Resolver).strategy === ResolverStrategy.array) {
      (result as Resolver).state.push(resolver);
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

  public getResolver(key: any, autoRegister = true): IResolver | null {
    validateKey(key);

    if (key.resolve) {
      return key;
    }

    /* tslint:disable-next-line:no-this-assignment */
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

    /* tslint:disable-next-line:no-this-assignment */
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

  public getAll(key: any): ReadonlyArray<any> {
    validateKey(key);

    /* tslint:disable-next-line:no-this-assignment */
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
      return keyAsValue.register(handler, keyAsValue);
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
export function validateKey(key: any): void {
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
      results[i] = state[i].get(handler, requestor);
    }

    return results;
  }

  return [resolver.resolve(handler, requestor)];
}

/*@internal*/
export const classInvokers: IInvoker[] = [
  {
    invoke<T extends Constructable<K>, K>(container: IContainer, Type: T): K {
      return new Type();
    },
    invokeWithDynamicDependencies
  },
  {
    invoke<T extends Constructable<K>, K>(container: IContainer, Type: T, deps: any[]): K {
      return new Type(container.get(deps[0]));
    },
    invokeWithDynamicDependencies
  },
  {
    invoke<T extends Constructable<K>, K>(container: IContainer, Type: T, deps: any[]): K {
      return new Type(container.get(deps[0]), container.get(deps[1]));
    },
    invokeWithDynamicDependencies
  },
  {
    invoke<T extends Constructable<K>, K>(container: IContainer, Type: T, deps: any[]): K {
      return new Type(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]));
    },
    invokeWithDynamicDependencies
  },
  {
    invoke<T extends Constructable<K>, K>(container: IContainer, Type: T, deps: any[]): K {
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
    invoke<T extends Constructable<K>, K>(container: IContainer, Type: T, deps: any[]): K {
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
export function invokeWithDynamicDependencies<T extends Constructable<K>, K>(
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
