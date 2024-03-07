import {
  type Key,
  IRegistration,
  Resolver,
  ResolverStrategy,
  type ResolveCallback,
  type Resolved,
  type IRegistry,
  type IContainer,
  IResolver,
  ParameterizedRegistry,
} from './di';
import { Constructable } from './interfaces';

/** @internal */
export const instanceRegistration = <T>(key: Key, value: T): IRegistration<T> =>
  new Resolver(key, ResolverStrategy.instance, value);

/** @internal */
export const singletonRegistration = <T extends Constructable>(key: Key, value: T): IRegistration<InstanceType<T>> =>
  new Resolver(key, ResolverStrategy.singleton, value);

/** @internal */
export const transientRegistation = <T extends Constructable>(key: Key, value: T): IRegistration<InstanceType<T>> =>
  new Resolver(key, ResolverStrategy.transient, value);

/** @internal */
export const callbackRegistration = <T>(key: Key, callback: ResolveCallback<T>): IRegistration<Resolved<T>> =>
  new Resolver(key, ResolverStrategy.callback, callback);

/** @internal */
export const cachedCallbackRegistration = <T>(key: Key, callback: ResolveCallback<T>): IRegistration<Resolved<T>> =>
  new Resolver(key, ResolverStrategy.callback, cacheCallbackResult(callback));

/** @internal */
export const aliasToRegistration = <T>(originalKey: T, aliasKey: Key): IRegistration<Resolved<T>> =>
  new Resolver(aliasKey, ResolverStrategy.alias, originalKey);

/** @internal */
export const deferRegistration = (key: Key, ...params: unknown[]): IRegistry =>
  new ParameterizedRegistry(key, params);

type ResolverLookup = WeakMap<IResolver, unknown>;
const containerLookup = new WeakMap<IContainer, ResolverLookup>();

/** @internal */
export const cacheCallbackResult = <T>(fun: ResolveCallback<T>): ResolveCallback<T> => {
  return (handler: IContainer, requestor: IContainer, resolver: IResolver): T => {
    let resolverLookup = containerLookup.get(handler);
    if (resolverLookup === void 0) {
      containerLookup.set(handler, resolverLookup = new WeakMap());
    }
    if (resolverLookup.has(resolver)) {
      return resolverLookup.get(resolver) as T;
    }
    const t = fun(handler, requestor, resolver);
    resolverLookup.set(resolver, t);
    return t;
  };
};

/**
 * you can use the resulting {@linkcode IRegistration} of any of the factory methods
 * to register with the container, e.g.
 * ```
 * class Foo {}
 * const container = DI.createContainer();
 * container.register(Registration.instance(Foo, new Foo()));
 * container.get(Foo);
 * ```
 */
export const Registration = {
  /**
   * allows you to pass an instance.
   * Every time you request this {@linkcode Key} you will get this instance back.
   * ```
   * Registration.instance(Foo, new Foo()));
   * ```
   *
   * @param key - key to register the instance with
   * @param value - the instance associated with the key
   */
  instance: instanceRegistration,
  /**
   * Creates an instance from the class.
   * Every time you request this {@linkcode Key} you will get the same one back.
   * ```
   * Registration.singleton(Foo, Foo);
   * ```
   *
   * @param key - key to register the singleton class with
   * @param value - the singleton class to instantiate when a container resolves the associated key
   */
  singleton: singletonRegistration,
  /**
   * Creates an instance from a class.
   * Every time you request this {@linkcode Key} you will get a new instance.
   * ```
   * Registration.instance(Foo, Foo);
   * ```
   *
   * @param key - key to register the transient class with
   * @param value - the class to instantiate when a container resolves the associated key
   */
  transient: transientRegistation,
  /**
   * Creates an instance from the method passed.
   * Every time you request this {@linkcode Key} you will get a new instance.
   * ```
   * Registration.callback(Foo, () => new Foo());
   * Registration.callback(Bar, (c: IContainer) => new Bar(c.get(Foo)));
   * ```
   *
   * @param key - key to register the callback with
   * @param callback - the callback to invoke when a container resolves the associated key
   */
  callback: callbackRegistration,
  /**
   * Creates an instance from the method passed.
   * On the first request for the {@linkcode Key} your callback is called and returns an instance.
   * subsequent requests for the {@linkcode Key}, the initial instance returned will be returned.
   * If you pass the same {@linkcode Registration} to another container the same cached value will be used.
   * Should all references to the resolver returned be removed, the cache will expire.
   * ```
   * Registration.cachedCallback(Foo, () => new Foo());
   * Registration.cachedCallback(Bar, (c: IContainer) => new Bar(c.get(Foo)));
   * ```
   *
   * @param key - key to register the cached callback with
   * @param callback - the cache callback to invoke when a container resolves the associated key
   */
  cachedCallback: cachedCallbackRegistration,
  /**
   * creates an alternate {@linkcode Key} to retrieve an instance by.
   * Returns the same scope as the original {@linkcode Key}.
   * ```
   * Register.singleton(Foo, Foo)
   * Register.aliasTo(Foo, MyFoos);
   *
   * container.getAll(MyFoos) // contains an instance of Foo
   * ```
   *
   * @param originalKey - the real key to resolve the get call from a container
   * @param aliasKey - the key that a container allows to resolve the real key associated
   */
  aliasTo: aliasToRegistration,
  /**
   * @internal
   * @param key - the key to register a defer registration
   * @param params - the parameters that should be passed to the resolution of the key
   */
  defer: deferRegistration,
};
