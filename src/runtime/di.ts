import { PLATFORM } from "./platform";

type InterfaceSymbol = (target, property, index) => typeof target;

function createInterface(key: string): InterfaceSymbol {
  return function Key(target, prop, index) {
    const inject = target.inject || (target.inject = []);
    (<any>Key).key = key;
    inject[index] = Key;
    return target;
  };
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

function getDesignParamTypes(target: any): any[] {
  return (<any>Reflect).getOwnMetadata('design:paramtypes', target) || PLATFORM.emptyArray;
};

export const IContainer = createInterface('IContainer');

export interface IContainer {
  register(...params: any[]);
  registerResolver(key: any, resolver: IResolver): IResolver;

  get<T>(key: any): T;
  getAll<T>(key: any): ReadonlyArray<T>;
  
  construct(type: Function, dynamicDependencies?: any[]): any;

  createChild(): IContainer;
}

export interface IResolver {
  get(handler: IContainer, requestor: IContainer): any;
}

export interface IRegistration {
  register(container: IContainer, key?: any): IResolver;
}

type Factory = (handler?: IContainer, requestor?: IContainer, resolver?: IResolver) => any;

class Resolver implements IResolver, IRegistration {
  constructor(public key: any, public strategy: number, public state: any) {}

  register(container: IContainer, key?: any) {
    return container.registerResolver(key || this.key, this);
  }

  get(handler: IContainer, requestor: IContainer): any {
    switch (this.strategy) {
    case 0: //instance
      return this.state;
    case 1: //singleton
      const singleton = handler.construct(this.state);
      this.state = singleton;
      this.strategy = 0; //switch to instance strategy
      return singleton;
    case 2: //transient
      return requestor.construct(this.state); //always create transients from the requesting container
    case 3: //function
      return (<Factory>this.state)(handler, requestor, this);
    case 4: //array
      return this.state[0].get(handler, requestor);
    case 5: //alias
      return handler.get(this.state);
    default:
      throw new Error('Invalid strategy: ' + this.strategy);
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

      if (key.register) {
        return key.register(this, key).get(this, this);
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
    let dependencies;

    if (fn.inject === undefined) {
      dependencies = getDesignParamTypes(fn);
    } else {
      dependencies = [];
      let ctor = fn;

      while (typeof ctor === 'function') {
        dependencies.push(...getDependencies(ctor));
        ctor = Object.getPrototypeOf(ctor);
      }
    }

    let invoker = classInvokers[dependencies.length] || classInvokers.fallback;
    return new InvocationHandler(fn, invoker, dependencies);
  }

  createChild(): IContainer {
    const child = new Container(this.configuration);
    child.parent = this;
    return child;
  }
}

const container: any = new Container();

container.createInterface = createInterface;
container.getDesignParamTypes = getDesignParamTypes;

export const DI: IContainer & { 
  createInterface(key: string): InterfaceSymbol
  getDesignParamTypes(target: any): any[];
} = <any>container;

export const Registration = {
  instance(key: any, value: any): IRegistration {
    return new Resolver(key, 0, value);
  },

  singleton(key: any, value: Function): IRegistration {
    return new Resolver(key, 1, value);
  },

  transient(key: any, value: Function): IRegistration {
    return new Resolver(key, 2, value);
  },

  factory(key: any, value: Factory): IRegistration {
    return new Resolver(key, 3, value);
  },

  alias(originalKey: any, aliasKey: any): IRegistration {
    return new Resolver(aliasKey, 5, originalKey);
  }
};

function validateKey(key: any) {
  if (key === null || key === undefined) {
    throw new Error('key/value cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?');
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

function getDependencies(type) {
  if (!type.hasOwnProperty('inject')) {
    return PLATFORM.emptyArray;
  }

  return type.inject;
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
      throw new Error('Constructor Parameter with index ' + i + ' cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?');
    } else {
      args[i] = container.get(lookup);
    }
  }

  if (dynamicDependencies !== undefined) {
    args = args.concat(dynamicDependencies);
  }

  return Reflect.construct(fn, args);
}
