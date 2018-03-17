/**
 * A lightweight, extensible dependency injection container.
 */
export interface IContainer {
  /**
   * The parent container in the DI hierarchy.
   */
  parent: IContainer | null;

  /**
   * The root container in the DI hierarchy.
   */
  root: IContainer;

  /**
   * Creates an instance of Container.
   * @param configuration Provides some configuration for the new Container instance.
   */
  // constructor(configuration?: IContainerConfiguration): IContainer;

  /**
   * Makes this container instance globally reachable through Container.instance.
   */
  makeGlobal(): this;

  /**
   * Sets an invocation handler creation callback that will be called when new InvocationsHandlers are created (called once per Function).
   * @param onHandlerCreated The callback to be called when an InvocationsHandler is created.
   */
  setHandlerCreatedCallback(onHandlerCreated: (handler: IInvocationHandler) => IInvocationHandler): void;

  /**
   * Registers an existing object instance with the container.
   * @param key The key that identifies the dependency at resolution time; usually a constructor function.
   * @param instance The instance that will be resolved when the key is matched. This defaults to the key value when instance is not supplied.
   * @return The resolver that was registered.
   */
  registerInstance(key: any, instance?: any): IResolver;

  /**
   * Registers a type (constructor function) such that the container always returns the same instance for each request.
   * @param key The key that identifies the dependency at resolution time; usually a constructor function.
   * @param fn The constructor function to use when the dependency needs to be instantiated. This defaults to the key value when fn is not supplied.
   * @return The resolver that was registered.
   */
  registerSingleton(key: any, fn?: Function): IResolver;

  /**
   * Registers a type (constructor function) such that the container returns a new instance for each request.
   * @param key The key that identifies the dependency at resolution time; usually a constructor function.
   * @param fn The constructor function to use when the dependency needs to be instantiated. This defaults to the key value when fn is not supplied.
   * @return The resolver that was registered.
   */
  registerTransient(key: any, fn?: Function): IResolver;

  /**
   * Registers a custom resolution function such that the container calls this function for each request to obtain the instance.
   * @param key The key that identifies the dependency at resolution time; usually a constructor function.
   * @param handler The resolution function to use when the dependency is needed.
   * @return The resolver that was registered.
   */
  registerHandler(
    key: any,
    handler: (container?: IContainer, key?: any, resolver?: IResolver) => any
  ): IResolver;

  /**
   * Registers an additional key that serves as an alias to the original DI key.
   * @param originalKey The key that originally identified the dependency; usually a constructor function.
   * @param aliasKey An alternate key which can also be used to resolve the same dependency  as the original.
   * @return The resolver that was registered.
   */
  registerAlias(originalKey: any, aliasKey: any): IResolver;

  /**
   * Registers a custom resolution function such that the container calls this function for each request to obtain the instance.
   * @param key The key that identifies the dependency at resolution time; usually a constructor function.
   * @param resolver The resolver to use when the dependency is needed.
   * @return The resolver that was registered.
   */
  registerResolver(key: any, resolver: IResolver): IResolver;

  /**
   * Registers a type (constructor function) by inspecting its registration annotations. If none are found, then the default singleton registration is used.
   * @param key The key that identifies the dependency at resolution time; usually a constructor function.
   * @param fn The constructor function to use when the dependency needs to be instantiated. This defaults to the key value when fn is not supplied.
   */
  autoRegister(key: any, fn?: Function): IResolver;

  /**
   * Registers an array of types (constructor functions) by inspecting their registration annotations. If none are found, then the default singleton registration is used.
   * @param fns The constructor function to use when the dependency needs to be instantiated.
   */
  autoRegisterAll(fns: any[]): void;

  /**
   * Unregisters based on key.
   * @param key The key that identifies the dependency at resolution time; usually a constructor function.
   */
  unregister(key: any): void;

  /**
   * Inspects the container to determine if a particular key has been registred.
   * @param key The key that identifies the dependency at resolution time; usually a constructor function.
   * @param checkParent Indicates whether or not to check the parent container hierarchy.
   * @return Returns true if the key has been registred; false otherwise.
   */
  hasResolver(key: any, checkParent?: boolean): boolean;

  /**
   * Gets the resolver for the particular key, if it has been registered.
   * @param key The key that identifies the dependency at resolution time; usually a constructor function.
   * @return Returns the resolver, if registred, otherwise undefined.
   */
  getResolver(key: any): any;

  /**
   * Resolves a single instance based on the provided key.
   * @param key The key that identifies the object to resolve.
   * @return Returns the resolved instance.
   */
  get<TResult = any, TKey = any>(key: TKey): TResult;

  /**
   * Resolves all instance registered under the provided key.
   * @param key The key that identifies the objects to resolve.
   * @return Returns an array of the resolved instances.
   */
  getAll(key: any): ReadonlyArray<any>;

  /**
   * Creates a new dependency injection container whose parent is the current container.
   * @return Returns a new container instance parented to this.
   */
  createChild(): IContainer;

  /**
   * Invokes a function, recursively resolving its dependencies.
   * @param fn The function to invoke with the auto-resolved dependencies.
   * @param dynamicDependencies Additional function dependencies to use during invocation.
   * @return Returns the instance resulting from calling the function.
   */
  invoke(fn: Function & { name?: string }, dynamicDependencies?: any[]): any;
}

/**
 * A strategy for invoking a function, resulting in an object instance.
 */
export interface IInvoker {
  /**
   * Invokes the function with the provided dependencies.
   * @param fn The constructor or factory function.
   * @param dependencies The dependencies of the function call.
   * @return The result of the function invocation.
   */
  invoke(container: IContainer, fn: Function, dependencies: any[]): any;

  /**
   * Invokes the function with the provided dependencies.
   * @param fn The constructor or factory function.
   * @param staticDependencies The static dependencies of the function.
   * @param dynamicDependencies Additional dependencies to use during invocation.
   * @return The result of the function invocation.
   */
  invokeWithDynamicDependencies(
    container: IContainer,
    fn: Function,
    staticDependencies: any[],
    dynamicDependencies: any[]
  ): any;
}

/**
 * Used to allow functions/classes to specify custom dependency resolution logic.
 */
export interface IResolver {
  /**
   * Called by the container to allow custom resolution of dependencies for a function/class.
   * @param container The container to resolve from.
   * @param key The key that the resolver was registered as.
   * @return Returns the resolved object.
   */
  get(container: IContainer, key: any): any;
}

/**
 * Used to configure a Container instance.
 */
export interface IContainerConfiguration {
  /**
   * An optional callback which will be called when any function needs an InvocationHandler created (called once per Function).
   */
  onHandlerCreated?: (handler: IInvocationHandler) => IInvocationHandler;

  handlers?: Map<any, any>;
}

export interface IInvocationHandler {
  invoke(container: IContainer, dynamicDependencies?: any[]): any;
}
