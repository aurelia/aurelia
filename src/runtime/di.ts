import { PLATFORM } from "./platform";
import { Injectable, Constructable, IIndexable } from "./interfaces";
import { Reporter } from "./reporter";

type Factory<T = any> = (handler?: IContainer, requestor?: IContainer, resolver?: IResolver) => T;

interface InterfaceSymbol<T> {
  (target: Injectable, property: string, index: number): any;
  withDefault(configure: (builder: IResolverBuilder<T>) => IResolver): this;
}

interface IResolverBuilder<T> {
  instance(value: T & IIndexable): IResolver;
  singleton(value: Constructable<T>): IResolver;
  transient(value: Constructable<T>): IResolver;
  factory(value: Factory<T>): IResolver;
  aliasTo(destinationKey: any): IResolver;
}

export const DI = { 
  createContainer(): IContainer {
    return new Container();
  },
  getDependencies(type: Function): any[] {
    let dependencies: any[];

    if ((<any>type).inject === undefined) {
      dependencies = getDesignParamTypes(type);
    } else {
      dependencies = [];
      let ctor = type;

      while (typeof ctor === 'function') {
        if (ctor.hasOwnProperty('inject')) {
          dependencies.push(...(<any>ctor).inject);
        }
        
        ctor = Object.getPrototypeOf(ctor);
      }
    }

    return dependencies;
  },
  createInterface<T = any>(friendlyName?: string): InterfaceSymbol<T> {
    const Key: any = function(target: Injectable, property: string, index: number): any {
      const inject = target.inject || (target.inject = []);
      (<any>Key).friendlyName = friendlyName || 'Interface';
      inject[index] = Key;
      return target;
    };
  
    Key.withDefault = function(configure: (builder: IResolverBuilder<T>) => IResolver) {
      Key.register = function(container: IContainer, key?: any) {
        return configure({
          instance(value: any) { 
            return container.registerResolver(Key, new Resolver(key || Key, ResolverStrategy.instance, value));
          },
          singleton(value: Function) { 
            return container.registerResolver(Key, new Resolver(key || Key, ResolverStrategy.singleton, value));
          },
          transient(value: Function) { 
            return container.registerResolver(Key, new Resolver(key || Key, ResolverStrategy.transient, value));
          },
          factory(value: Factory) { 
            return container.registerResolver(Key, new Resolver(key || Key, ResolverStrategy.factory, value));
          },
          aliasTo(destinationKey: any) { 
            return container.registerResolver(destinationKey, new Resolver(key || Key, ResolverStrategy.alias, Key));
          },
        });
      }
  
      return Key;
    };
  
    return Key;
  }
};

function getDesignParamTypes(target: any): any[] {
  return (<any>Reflect).getOwnMetadata('design:paramtypes', target) || PLATFORM.emptyArray;
}

if (!('getOwnMetadata' in Reflect)) {
  (<any>Reflect).getOwnMetadata = function(key, target) {
    return target[key];
  };

  (<any>Reflect).metadata = function(key, value) {
    return function(target) {
      target[key] = value;
    }
  };
}

export const IContainer = DI.createInterface('IContainer');

export interface IContainer {
  register(...params: any[]);
  registerResolver(key: any, resolver: IResolver): IResolver;

  get<T>(key: Constructable<T>): T;
  get<T>(key: InterfaceSymbol<T>): T;
  get<T = any>(key: any): T;

  getAll<T>(key: Constructable<T>): ReadonlyArray<T>;
  getAll<T>(key: InterfaceSymbol<T>): ReadonlyArray<T>;
  getAll<T = any>(key: any): ReadonlyArray<T>;
  
  construct<T>(type: Constructable<T>, dynamicDependencies?: any[]): T;

  createChild(): IContainer;
}

export interface IResolver {
  get(handler: IContainer, requestor: IContainer): any;
}

export interface IRegistration {
  register(container: IContainer, key?: any): IResolver;
}

enum ResolverStrategy {
  instance = 0,
  singleton = 1,
  transient = 2,
  factory = 3,
  array = 4,
  alias = 5
}

class Resolver implements IResolver, IRegistration {
  constructor(public key: any, public strategy: ResolverStrategy, public state: any) {}

  register(container: IContainer, key?: any) {
    return container.registerResolver(key || this.key, this);
  }

  get(handler: IContainer, requestor: IContainer): any {
    switch (this.strategy) {
      case ResolverStrategy.instance:
        return this.state;
      case ResolverStrategy.singleton:
        const singleton = handler.construct(this.state);
        this.state = singleton;
        this.strategy = ResolverStrategy.instance;
        return singleton;
      case ResolverStrategy.transient:
        return requestor.construct(this.state); //always create transients from the requesting container
      case ResolverStrategy.factory:
        return (<Factory>this.state)(handler, requestor, this);
      case ResolverStrategy.array:
        return this.state[0].get(handler, requestor);
      case ResolverStrategy.alias:
        return handler.get(this.state);
      default:
        throw Reporter.error(6, this.strategy);
    }
  }
}

interface IInvoker {
  invoke(container: IContainer, fn: Function, dependencies: any[]): any;
  invokeWithDynamicDependencies(container: IContainer, fn: Function, staticDependencies: any[], dynamicDependencies: any[]): any;
}

class InvocationHandler {
  fn: Function;
  invoker: IInvoker;
  dependencies: any[];

  constructor(fn: Function, invoker: IInvoker, dependencies: any[]) {
    this.fn = fn;
    this.invoker = invoker;
    this.dependencies = dependencies;
  }

  invoke(container: IContainer, dynamicDependencies?: any[]): any {
    return dynamicDependencies !== undefined
      ? this.invoker.invokeWithDynamicDependencies(container, this.fn, this.dependencies, dynamicDependencies)
      : this.invoker.invoke(container, this.fn, this.dependencies);
  }
}

interface IContainerConfiguration {
  handlers?: Map<Function, any>;
}

class Container implements IContainer {
  private parent: Container = null
  private resolvers = new Map<any, IResolver>();
  private handlers: Map<Function, any>;
  private configuration: IContainerConfiguration;

  constructor(configuration: IContainerConfiguration = {}) {
    this.configuration = configuration;
    this.handlers = configuration.handlers || (configuration.handlers = new Map());
  }

  register(...params: any[]) {
    const resolvers = this.resolvers;

    for (let i = 0, ii = params.length; i < ii; ++i) {
      const current = params[i];
      
      if (current.register) {
        current.register(this);
      } else {
        Object.values(current).forEach((x: any) => {
          if (x.register) {
            x.register(this);
          }
        });
      }
    }
  }

  registerResolver(key: any, resolver: IResolver): IResolver {
    validateKey(key);

    const resolvers = this.resolvers;
    const result = resolvers.get(key);

    if (result === undefined) {
      resolvers.set(key, resolver);
    } else if (resolver instanceof Resolver && (<Resolver>resolver).strategy === 4) {
      (<Resolver>result).state.push(resolver);
    } else {
      resolvers.set(key, new Resolver(key, 4, [result, resolver]));
    }

    return resolver;
  }

  get(key: any) {
    if (key === IContainer) {
      return this;
    }

    if (key.get) {
      return key.get(this, this);
    }

    const resolver = this.resolvers.get(key);

    if (resolver === undefined) {
      if (this.parent === null) {
        return this.jitRegister(key, this).get(this, this);
      }

      return this.parent.parentGet(key, this);
    }

    return resolver.get(this, this);
  }

  private parentGet(key: any, requestor: IContainer) {
    const resolver = this.resolvers.get(key);

    if (resolver === undefined) {
      if (this.parent === null) {
        return this.jitRegister(key, requestor).get(this, requestor);
      }

      return this.parent.parentGet(key, requestor);
    }

    return resolver.get(this, requestor);
  }

  getAll(key: any): ReadonlyArray<any> {
    validateKey(key);

    const resolver = this.resolvers.get(key);

    if (resolver === undefined) {
      if (this.parent === null) {
        return PLATFORM.emptyArray;
      }

      return this.parent.parentGetAll(key, this);
    }

    return buildAllResponse(resolver, this, this);
  }

  private parentGetAll(key: any, requestor: IContainer): ReadonlyArray<any> {
    const resolver = this.resolvers.get(key);

    if (resolver === undefined) {
      if (this.parent === null) {
        return PLATFORM.emptyArray;
      }

      return this.parent.parentGetAll(key, requestor);
    }

    return buildAllResponse(resolver, this, requestor);
  }

  private jitRegister(keyAsValue: any, requestor: IContainer): IResolver {
    if (keyAsValue.register) {
      return keyAsValue.register(this, keyAsValue);
    }

    const strategy = new Resolver(keyAsValue, 1, keyAsValue);
    this.resolvers.set(keyAsValue, strategy);
    return strategy;
  }

  construct(type: Function, dynamicDependencies?: any[]) {
    let handler = this.handlers.get(type);

    if (handler === undefined) {
      handler = this.createInvocationHandler(type);
      this.handlers.set(type, handler);
    }

    return handler.invoke(this, dynamicDependencies);
  }

  private createInvocationHandler(fn: Function & { inject?: any }): InvocationHandler {
    const dependencies = DI.getDependencies(fn);
    const invoker = classInvokers[dependencies.length] || classInvokers.fallback;
    return new InvocationHandler(fn, invoker, dependencies);
  }

  createChild(): IContainer {
    const child = new Container(this.configuration);
    child.parent = this;
    return child;
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

  factory(key: any, value: Factory): IRegistration {
    return new Resolver(key, ResolverStrategy.factory, value);
  },

  alias(originalKey: any, aliasKey: any): IRegistration {
    return new Resolver(aliasKey, ResolverStrategy.alias, originalKey);
  }
};

function validateKey(key: any) {
  if (key === null || key === undefined) {
    throw Reporter.error(5);
  }
}

function buildAllResponse(resolver: IResolver, handler: IContainer, requestor: IContainer) {
  if (resolver instanceof Resolver && (<Resolver>resolver).strategy === 4) {
    const state = (<Resolver>resolver).state;
    let i = state.length;
    const results = new Array(i);

    while (i--) {
      results[i] = state[i].get(handler, requestor);
    }

    return results;
  }

  return [resolver.get(handler, requestor)];
}

const classInvokers: Record<string, IInvoker> = {
  [0]: {
    invoke(container: IContainer, Type: Function) {
      return new (<any>Type)();
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  [1]: {
    invoke(container: IContainer, Type: Function, deps: any[]) {
      return new (<any>Type)(container.get(deps[0]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  [2]: {
    invoke(container: IContainer, Type: Function, deps: any[]) {
      return new (<any>Type)(container.get(deps[0]), container.get(deps[1]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  [3]: {
    invoke(container: IContainer, Type: Function, deps: any[]) {
      return new (<any>Type)(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  [4]: {
    invoke(container: IContainer, Type: Function, deps: any[]) {
      return new (<any>Type)(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]), container.get(deps[3]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  [5]: {
    invoke(container: IContainer, Type: Function, deps: any[]) {
      return new (<any>Type)(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]), container.get(deps[3]), container.get(deps[4]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  fallback: {
    invoke: <any>invokeWithDynamicDependencies,
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  }
};

function invokeWithDynamicDependencies(container: IContainer, fn: Function, staticDependencies, dynamicDependencies) {
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

  return Reflect.construct(fn, args);
}

/**
* Decorator: Directs the TypeScript transpiler to write-out type metadata for the decorated class.
*/
export function autoinject<T extends Injectable>(potentialTarget?: T): any {
  let deco = function<T extends Injectable>(target: T) {
    let previousInject = target.inject ? target.inject.slice() : null; //make a copy of target.inject to avoid changing parent inject
    let autoInject: any = getDesignParamTypes(target);
    
    if (!previousInject) {
      target.inject = autoInject;
    } else {
      for (let i = 0; i < autoInject.length; i++) {
        //check if previously injected.
        if (previousInject[i] && previousInject[i] !== autoInject[i]) {
          const prevIndex = previousInject.indexOf(autoInject[i]);
          if (prevIndex > -1) {
            previousInject.splice(prevIndex, 1);
          }
          previousInject.splice((prevIndex > -1 && prevIndex < i) ? i - 1 : i, 0, autoInject[i]);
        } else if (!previousInject[i]) {//else add
          previousInject[i] = autoInject[i];
        }
      }

      target.inject = previousInject;
    }
  };

  return potentialTarget ? deco(potentialTarget) : deco;
}

/**
* Decorator: Specifies the dependencies that should be injected by the DI Container into the decoratored class/function.
*/
export function inject(...rest: any[]): any {
  return function<T extends Injectable>(target: T, key?, descriptor?) {
    // handle when used as a parameter
    if (typeof descriptor === 'number' && rest.length === 1) {
      let params = target.inject;

      if (!params) {
        params = getDesignParamTypes(target).slice();
        target.inject = params;
      }

      params[descriptor] = rest[0];
      return;
    }

    // if it's true then we injecting rest into function and not Class constructor
    if (descriptor) {
      const fn = descriptor.value;
      fn.inject = rest;
    } else {
      target.inject = rest;
    }
  };
}
