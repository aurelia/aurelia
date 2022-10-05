import {
  type Key,
  IRegistration,
  Resolver,
  ResolverStrategy,
  type ResolveCallback,
  type Resolved,
  type IRegistry,
  ParameterizedRegistry,
  type IContainer,
  IResolver
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
