import { StrategyResolver } from './resolvers';
import { InvocationHandler } from './invocation-handler';
import { IContainerConfiguration, IResolver, IContainer, IInvocationHandler } from './interfaces';

export const _emptyParameters = Object.freeze([]);

export { IContainerConfiguration, IResolver, IContainer, IInvocationHandler } from './interfaces';

/**
 * A lightweight, extensible dependency injection container.
 */
export class Container implements IContainer {
  /**
   * The global root Container instance. Available if makeGlobal() has been called. Aurelia Framework calls makeGlobal().
   */
  static instance: IContainer;

  /**
   * The parent container in the DI hierarchy.
   */
  parent: IContainer | null;

  /**
   * The root container in the DI hierarchy.
   */
  root: IContainer;

  /** @internal */
  protected _configuration: IContainerConfiguration;

  /** @internal */
  protected _onHandlerCreated?: (handler: IInvocationHandler) => IInvocationHandler;

  /** @internal */
  protected _handlers: Map<any, any>;

  /** @internal */
  protected _resolvers: Map<any, any>;

  /**
   * Creates an instance of Container.
   * @param configuration Provides some configuration for the new Container instance.
   */
  constructor(configuration?: IContainerConfiguration) {
    if (configuration === undefined) {
      configuration = {};
    }

    this._configuration = configuration;
    this._onHandlerCreated = configuration.onHandlerCreated;
    this._handlers = configuration.handlers || (configuration.handlers = new Map());
    this._resolvers = new Map();
    this.root = this;
    this.parent = null;
  }

  /**
   * Makes this container instance globally reachable through Container.instance.
   */
  makeGlobal(): this {
    Container.instance = this;
    return this;
  }

  /**
   * Sets an invocation handler creation callback that will be called when new InvocationsHandlers are created (called once per Function).
   * @param onHandlerCreated The callback to be called when an InvocationsHandler is created.
   */
  public setHandlerCreatedCallback(onHandlerCreated: (handler: IInvocationHandler) => IInvocationHandler): void {
    this._onHandlerCreated = onHandlerCreated;
    this._configuration.onHandlerCreated = onHandlerCreated;
  }

  /**
   * Registers an existing object instance with the container.
   * @param key The key that identifies the dependency at resolution time; usually a constructor function.
   * @param instance The instance that will be resolved when the key is matched. This defaults to the key value when instance is not supplied.
   * @return The resolver that was registered.
   */
  public registerInstance(key: any, instance?: any): IResolver {
    return this.registerResolver(key, new StrategyResolver(0, instance === undefined ? key : instance));
  }

  /**
   * Registers a type (constructor function) such that the container always returns the same instance for each request.
   * @param key The key that identifies the dependency at resolution time; usually a constructor function.
   * @param fn The constructor function to use when the dependency needs to be instantiated. This defaults to the key value when fn is not supplied.
   * @return The resolver that was registered.
   */
  public registerSingleton(key: any, fn?: Function): IResolver {
    return this.registerResolver(key, new StrategyResolver(1, fn === undefined ? key : fn));
  }

  /**
   * Registers a type (constructor function) such that the container returns a new instance for each request.
   * @param key The key that identifies the dependency at resolution time; usually a constructor function.
   * @param fn The constructor function to use when the dependency needs to be instantiated. This defaults to the key value when fn is not supplied.
   * @return The resolver that was registered.
   */
  public registerTransient(key: any, fn?: Function): IResolver {
    return this.registerResolver(key, new StrategyResolver(2, fn === undefined ? key : fn));
  }

  /**
   * Registers a custom resolution function such that the container calls this function for each request to obtain the instance.
   * @param key The key that identifies the dependency at resolution time; usually a constructor function.
   * @param handler The resolution function to use when the dependency is needed.
   * @return The resolver that was registered.
   */
  public registerHandler(
    key: any,
    handler: (container?: IContainer, key?: any, resolver?: IResolver) => any
  ): IResolver {
    return this.registerResolver(key, new StrategyResolver(3, handler));
  }

  /**
   * Registers an additional key that serves as an alias to the original DI key.
   * @param originalKey The key that originally identified the dependency; usually a constructor function.
   * @param aliasKey An alternate key which can also be used to resolve the same dependency  as the original.
   * @return The resolver that was registered.
   */
  public registerAlias(originalKey: any, aliasKey: any): IResolver {
    return this.registerResolver(aliasKey, new StrategyResolver(5, originalKey));
  }

  /**
   * Registers a custom resolution function such that the container calls this function for each request to obtain the instance.
   * @param key The key that identifies the dependency at resolution time; usually a constructor function.
   * @param resolver The resolver to use when the dependency is needed.
   * @return The resolver that was registered.
   */
  public registerResolver(key: any, resolver: IResolver): IResolver {
    validateKey(key);

    let allResolvers = this._resolvers;
    let result = allResolvers.get(key);

    if (result === undefined) {
      allResolvers.set(key, resolver);
    } else if (result.strategy === 4) {
      result.state.push(resolver);
    } else {
      allResolvers.set(key, new StrategyResolver(4, [result, resolver]));
    }

    return resolver;
  }

  /**
   * Registers a type (constructor function) by inspecting its registration annotations. If none are found, then the default singleton registration is used.
   * @param key The key that identifies the dependency at resolution time; usually a constructor function.
   * @param fn The constructor function to use when the dependency needs to be instantiated. This defaults to the key value when fn is not supplied.
   */
  public autoRegister(key: any, fn?: Function): IResolver {
    fn = fn === undefined ? key : fn;

    if (typeof fn === 'function') {
      return this.registerResolver(key, new StrategyResolver(1, fn));
    }

    return this.registerResolver(key, new StrategyResolver(0, fn));
  }

  /**
   * Registers an array of types (constructor functions) by inspecting their registration annotations. If none are found, then the default singleton registration is used.
   * @param fns The constructor function to use when the dependency needs to be instantiated.
   */
  public autoRegisterAll(fns: any[]): void {
    let i = fns.length;
    while (i--) {
      this.autoRegister(fns[i]);
    }
  }

  /**
   * Unregisters based on key.
   * @param key The key that identifies the dependency at resolution time; usually a constructor function.
   */
  public unregister(key: any): void {
    this._resolvers.delete(key);
  }

  /**
   * Inspects the container to determine if a particular key has been registred.
   * @param key The key that identifies the dependency at resolution time; usually a constructor function.
   * @param checkParent Indicates whether or not to check the parent container hierarchy.
   * @return Returns true if the key has been registred; false otherwise.
   */
  public hasResolver(key: any, checkParent: boolean = false): boolean {
    validateKey(key);

    return (
      this._resolvers.has(key) || (checkParent && this.parent !== null && this.parent.hasResolver(key, checkParent))
    );
  }

  /**
   * Gets the resolver for the particular key, if it has been registered.
   * @param key The key that identifies the dependency at resolution time; usually a constructor function.
   * @return Returns the resolver, if registred, otherwise undefined.
   */
  public getResolver(key: any): any {
    return this._resolvers.get(key);
  }

  /**
   * Resolves a single instance based on the provided key.
   * @param key The key that identifies the object to resolve.
   * @return Returns the resolved instance.
   */
  public get(key: any): any {
    validateKey(key);

    if (key === Container) {
      return this;
    }

    let resolver = this._resolvers.get(key);

    if (resolver === undefined) {
      if (this.parent === null) {
        return this.autoRegister(key).get(this, key);
      }

      return (this.parent as Container)._get(key);
    }

    return resolver.get(this, key);
  }

  protected _get(key: any): any {
    let resolver = this._resolvers.get(key);

    if (resolver === undefined) {
      if (this.parent === null) {
        return this.autoRegister(key).get(this, key);
      }

      return (this.parent as Container)._get(key);
    }

    return resolver.get(this, key);
  }

  /**
   * Resolves all instance registered under the provided key.
   * @param key The key that identifies the objects to resolve.
   * @return Returns an array of the resolved instances.
   */
  public getAll(key: any): ReadonlyArray<any> {
    validateKey(key);

    let resolver = this._resolvers.get(key);

    if (resolver === undefined) {
      if (this.parent === null) {
        return _emptyParameters;
      }

      return this.parent.getAll(key);
    }

    if (resolver.strategy === 4) {
      let state = resolver.state;
      let i = state.length;
      let results = new Array(i);

      while (i--) {
        results[i] = state[i].get(this, key);
      }

      return results;
    }

    return [resolver.get(this, key)];
  }

  /**
   * Creates a new dependency injection container whose parent is the current container.
   * @return Returns a new container instance parented to this.
   */
  public createChild(): IContainer {
    let child: IContainer = new Container(this._configuration);
    child.root = this.root;
    child.parent = this;
    return child;
  }

  /**
   * Invokes a function, recursively resolving its dependencies.
   * @param fn The function to invoke with the auto-resolved dependencies.
   * @param dynamicDependencies Additional function dependencies to use during invocation.
   * @return Returns the instance resulting from calling the function.
   */
  public invoke(fn: Function & { name?: string }, dynamicDependencies?: any[]): any {
    try {
      let handler = this._handlers.get(fn);

      if (handler === undefined) {
        handler = this._createInvocationHandler(fn);
        this._handlers.set(fn, handler);
      }

      return handler.invoke(this, dynamicDependencies);
    } catch (e) {
      throw new Error(`Error invoking ${fn.name}.`);
    }
  }

  protected _createInvocationHandler(fn: Function & { inject?: any }): IInvocationHandler {
    let dependencies;

    dependencies = [];
    let ctor = fn;
    while (typeof ctor === 'function') {
      dependencies.push(...getDependencies(ctor));
      ctor = Object.getPrototypeOf(ctor);
    }

    let invoker = classInvokers[dependencies.length] || classInvokers.fallback;
    let handler = new InvocationHandler(fn, invoker, dependencies);

    return this._onHandlerCreated !== undefined ? this._onHandlerCreated(handler) : handler;
  }
}

function invokeWithDynamicDependencies(container: IContainer, fn: Function, staticDependencies: any[], dynamicDependencies: any[]) {
  let i = staticDependencies.length;
  let args = new Array(i);
  let lookup;

  while (i--) {
    lookup = staticDependencies[i];

    if (lookup === null || lookup === undefined) {
      throw new Error(
        'Constructor Parameter with index ' +
        i +
        " cannot be null or undefined. Are you trying to inject/register something that doesn't exist with DI?"
      );
    } else {
      args[i] = container.get(lookup);
    }
  }

  if (dynamicDependencies !== undefined) {
    args = args.concat(dynamicDependencies);
  }

  return Reflect.construct(fn, args);
}

interface IClassInvoker {
  invoke<TType = any>(container: IContainer, Type: { new(...args: any[]): TType }, deps: any[]): any;
  invokeWithDynamicDependencies: typeof invokeWithDynamicDependencies;
}

let classInvokers: { [key: number]: IClassInvoker; fallback: any } = {
  0: {
    invoke<TType = any>(container: IContainer, Type: { new(): TType }) {
      return new Type();
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  1: {
    invoke<TType = any>(container: IContainer, Type: { new(...args: any[]): TType }, deps: any[]) {
      return new Type(container.get(deps[0]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  2: {
    invoke<TType = any>(container: IContainer, Type: { new(...args: any[]): TType }, deps: any[]) {
      return new Type(container.get(deps[0]), container.get(deps[1]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  3: {
    invoke<TType = any>(container: IContainer, Type: { new(...args: any[]): TType }, deps: any[]) {
      return new Type(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  4: {
    invoke<TType = any>(container: IContainer, Type: { new(...args: any[]): TType }, deps: any[]) {
      return new Type(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]), container.get(deps[3]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  5: {
    invoke<TType = any>(container: IContainer, Type: { new(...args: any[]): TType }, deps: any[]) {
      return new Type(
        container.get(deps[0]),
        container.get(deps[1]),
        container.get(deps[2]),
        container.get(deps[3]),
        container.get(deps[4])
      );
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  fallback: {
    invoke: invokeWithDynamicDependencies,
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  }
};

function getDependencies(f: Function & { inject?: any }) {
  if (!f.hasOwnProperty('inject')) {
    return [];
  }

  if (typeof f.inject === 'function') {
    return f.inject();
  }

  return f.inject;
}

function validateKey(key: any) {
  if (key === null || key === undefined) {
    throw new Error(
      "key/value cannot be null or undefined. Are you trying to inject/register something that doesn't exist with DI?"
    );
  }
}
