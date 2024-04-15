import {
  DI,
  Registration,
  type IResolver,
  type Key,
  type Constructable,
  type IContainer,
} from '@aurelia/kernel';
import { defineMetadata, getAnnotationKeyFor, getMetadata } from './utilities-metadata';
import { IResourceKind } from './resources/resources-shared';

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
  return function (target: Constructable, context: ClassDecoratorContext) {
    context.addInitializer(function (this) {
      const key = getAnnotationKeyFor('aliases');
      const existing = getMetadata<string[] | undefined>(key, this);
      if (existing === void 0) {
        defineMetadata(aliases, this, key);
      } else {
        existing.push(...aliases);
      }
    });
  };
}

export function registerAliases(aliases: readonly string[], resource: IResourceKind, key: string, container: IContainer) {
  for (let i = 0, ii = aliases.length; i < ii; ++i) {
    Registration.aliasTo(key, resource.keyFrom(aliases[i])).register(container);
  }
}
