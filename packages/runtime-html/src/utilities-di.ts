import {
  DI,
  Injectable,
  Registration,
  type IResolver,
  type Key,
  type Constructable,
  type IContainer,
  type IResourceKind,
  type ResourceDefinition,
  type IAllResolver,
  IOptionalResolver,
} from '@aurelia/kernel';
import { defineMetadata, getAnnotationKeyFor, getOwnMetadata } from './utilities-metadata';
import { objectAssign } from './utilities';

export const resource = <T extends Key>(key: T) => {
  function Resolver(target: Injectable, property?: string | number, descriptor?: PropertyDescriptor | number) {
    DI.inject(Resolver)(target, property, descriptor);
  }
  Resolver.$isResolver = true;
  Resolver.resolve = (handler: IContainer, requestor: IContainer) =>
    requestor.has(key, false)
      ? requestor.get(key)
      : requestor.root.get(key);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Resolver as IResolver<T> & ((...args: unknown[]) => any);
};

export const optionalResource = <T extends Key>(key: T) => {
  return objectAssign(function Resolver(target: Injectable, property?: string | number, descriptor?: PropertyDescriptor | number) {
    DI.inject(Resolver)(target, property, descriptor);
  }, {
    $isResolver: true,
    resolve: (handler: IContainer, requestor: IContainer) =>
      requestor.has(key, false)
        ? requestor.get(key)
        : requestor.root.has(key, false)
          ? requestor.root.get(key)
          : void 0,
  }) as IOptionalResolver<T>;
};

/**
 * A resolver builder for resolving all registrations of a key
 * with resource semantic (leaf + root + ignore middle layer container)
 */
export const allResources = <T extends Key>(key: T) => {
  function Resolver(target: Constructable, property?: string | number, descriptor?: PropertyDescriptor | number) {
    DI.inject(Resolver)(target, property, descriptor);
  }
  Resolver.$isResolver = true;
  Resolver.resolve = function (handler: IContainer, requestor: IContainer) {
    if (/* is root? */requestor.root === requestor) {
      return requestor.getAll(key, false);
    }

    return requestor.has(key, false)
      ? requestor.getAll(key, false).concat(requestor.root.getAll(key, false))
      : requestor.root.getAll(key, false);
  };
  return Resolver as IAllResolver<T>;
};

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

export function registerAliases(aliases: readonly string[], resource: IResourceKind<Constructable, ResourceDefinition>, key: string, container: IContainer) {
  for (let i = 0, ii = aliases.length; i < ii; ++i) {
    Registration.aliasTo(key, resource.keyFrom(aliases[i])).register(container);
  }
}
