import {
  DI,
  Registration,
  type IResolver,
  type Key,
  type Constructable,
  type IContainer,
  type IAllResolver,
  IOptionalResolver,
  createResolver,
} from '@aurelia/kernel';
import { defineMetadata, getAnnotationKeyFor, getOwnMetadata } from './utilities-metadata';
import { IResourceKind } from './resources/resources-shared';

export const resource = <T extends Key>(key: T) =>
  createResolver((key, handler, requestor) =>
    requestor.has(key, false)
      ? requestor.get(key)
      : requestor.root.get(key))(key);

export const optionalResource = <T extends Key>(key: T) =>
  createResolver((key, handler, requestor) =>
    (requestor.has(key, false)
      ? requestor.get(key)
      : requestor.root.has(key, false)
        ? requestor.root.get(key)
        : void 0))(key) as IOptionalResolver<T>;
/**
 * A resolver builder for resolving all registrations of a key
 * with resource semantic (leaf + root + ignore middle layer container)
 */
export const allResources = <T extends Key>(key: T) =>
  createResolver((key, handler, requestor) => {
    if (/* is root? */requestor.root === requestor) {
      return requestor.getAll(key, false);
    }

    return requestor.has(key, false)
      ? requestor.getAll(key, false).concat(requestor.root.getAll(key, false))
      : requestor.root.getAll(key, false);
  })(key) as IAllResolver<T>;

/** @internal */
export const createInterface = DI.createInterface;

/** @internal */
export const singletonRegistration = Registration.singleton;

/** @internal */
export const aliasRegistration = Registration.aliasTo;

/** @internal */
export const instanceRegistration = Registration.instance;

/** @internal */
export const callbackRegistration = Registration.callback;

/** @internal */
export const transientRegistration = Registration.transient;

/** @internal */
export const registerResolver = (ctn: IContainer, key: Key, resolver: IResolver): IResolver =>
  ctn.registerResolver(key, resolver);

export function alias(...aliases: readonly string[]) {
  return function (target: Constructable) {
    const key = getAnnotationKeyFor('aliases');
    const existing = getOwnMetadata(key, target) as string[] | undefined;
    if (existing === void 0) {
      defineMetadata(key, aliases, target);
    } else {
      existing.push(...aliases);
    }
  };
}

export function registerAliases(aliases: readonly string[], resource: IResourceKind, key: string, container: IContainer) {
  for (let i = 0, ii = aliases.length; i < ii; ++i) {
    Registration.aliasTo(key, resource.keyFrom(aliases[i])).register(container);
  }
}
