/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { emptyArray } from '@aurelia/kernel';
import { getAttributeDefinition, isAttributeType } from './resources/custom-attribute';
import { getElementDefinition, isElementType } from './resources/custom-element';
import { defineMetadata, getAnnotationKeyFor, getOwnMetadata } from './utilities-metadata';
import { createError, isFunction, objectFreeze } from './utilities';

import type { Constructable } from '@aurelia/kernel';
import type { IConnectable } from '@aurelia/runtime';

export type IDepCollectionFn<TType extends object, TReturn = unknown> = (vm: TType, watcher: IConnectable) => TReturn;
export type IWatcherCallback<TType extends object, TValue = unknown>
  = (this: TType, newValue: TValue, oldValue: TValue, vm: TType) => unknown;

export interface IWatchDefinition<T extends object = object> {
  expression: PropertyKey | IDepCollectionFn<T>;
  callback: keyof T | IWatcherCallback<T>;
}

type AnyMethod<R = unknown> = (...args: unknown[]) => R;
type WatchClassDecorator<T extends object> = <K extends Constructable<T>>(target: K) => void;
type WatchMethodDecorator<T> = (target: T, key: string | symbol, descriptor: PropertyDescriptor) => PropertyDescriptor;
type MethodsOf<Type> = {
  [Key in keyof Type]: Type[Key] extends AnyMethod ? Key : never
}[keyof Type];

// for
//    @watch('some.expression', (v) => ...)
//    @watch('some.expression', 'method')
//    @watch(Symbol, (v) => ...)
//    @watch(Symbol, 'method')
//    @watch(a => ..., 'method')
//    @watch(a => ..., v => ...)
//    class A {
//      method() {...}
//    }
export function watch<T extends object, D = unknown>(
  expressionOrPropertyAccessFn: PropertyKey,
  changeHandlerOrCallback: MethodsOf<T> | IWatcherCallback<T, D>,
): WatchClassDecorator<T>;

export function watch<T extends object, D = unknown>(
  expressionOrPropertyAccessFn: IDepCollectionFn<T, D>,
  changeHandlerOrCallback: MethodsOf<T> | IWatcherCallback<T, D>,
): WatchClassDecorator<T>;

// for
// class A {
//    @watch('some.expression')
//    @watch(Symbol)
//    @watch(a => ...)
//    method() {...}
// }
export function watch<T extends object = object, D = unknown>(
  expressionOrPropertyAccessFn: PropertyKey | IDepCollectionFn<T, D>
): WatchMethodDecorator<T>;

export function watch<T extends object = object>(
  expressionOrPropertyAccessFn: PropertyKey | IDepCollectionFn<object>,
  changeHandlerOrCallback?: PropertyKey | IWatcherCallback<T>,
): WatchClassDecorator<T> | WatchMethodDecorator<T> {
  if (expressionOrPropertyAccessFn == null) {
    if (__DEV__)
      throw createError(`AUR0772: Invalid watch config. Expected an expression or a fn`);
    else
      throw createError(`AUR0772`);
  }

  return function decorator(
    target: Constructable<T> | Constructable<T>['prototype'],
    key?: PropertyKey,
    descriptor?: PropertyDescriptor,
  ): void {
    const isClassDecorator = key == null;
    const Type = isClassDecorator ? target : target.constructor;
    const watchDef = new WatchDefinition<T>(
      expressionOrPropertyAccessFn,
      isClassDecorator ? changeHandlerOrCallback : descriptor!.value
    );

    // basic validation
    if (isClassDecorator) {
      if (!isFunction(changeHandlerOrCallback)
        && (changeHandlerOrCallback == null || !(changeHandlerOrCallback in Type.prototype))
      ) {
        if (__DEV__)
          throw createError(`AUR0773: Invalid change handler config. Method "${String(changeHandlerOrCallback)}" not found in class ${Type.name}`);
        else
          throw createError(`AUR0773:${String(changeHandlerOrCallback)}@${Type.name}}`);
      }
    } else if (!isFunction(descriptor?.value)) {
      if (__DEV__)
        throw createError(`AUR0774: decorated target ${String(key)} is not a class method.`);
      else
        throw createError(`AUR0774:${String(key)}`);
    }

    Watch.add(Type, watchDef as IWatchDefinition);

    // if the code looks like this:
    // @watch(...)
    // @customAttribute(...)
    // class Abc {}
    //
    // then @watch is called after @customAttribute
    // which means the attribute definition won't have the watch definition
    //
    // temporarily works around this order sensitivity by manually add the watch def
    // manual
    if (isAttributeType(Type)) {
      getAttributeDefinition(Type).watches.push(watchDef as IWatchDefinition);
    }
    if (isElementType(Type)) {
      getElementDefinition(Type).watches.push(watchDef as IWatchDefinition);
    }
  };
}

class WatchDefinition<T extends object> implements IWatchDefinition<T> {
  public constructor(
    public expression: PropertyKey | IDepCollectionFn<T>,
    public callback: IWatcherCallback<T>,
  ) {}
}

const noDefinitions: IWatchDefinition[] = emptyArray;
const watchBaseName = getAnnotationKeyFor('watch');

export const Watch = objectFreeze({
  name: watchBaseName,
  add(Type: Constructable, definition: IWatchDefinition): void {
    let watchDefinitions: IWatchDefinition[] = getOwnMetadata(watchBaseName, Type);
    if (watchDefinitions == null) {
      defineMetadata(watchBaseName, watchDefinitions = [], Type);
    }
    watchDefinitions.push(definition);
  },
  getAnnotation(Type: Constructable): IWatchDefinition[] {
    return getOwnMetadata(watchBaseName, Type) ?? noDefinitions;
  },
});
