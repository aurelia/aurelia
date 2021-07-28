import { Protocol, Metadata, emptyArray } from '@aurelia/kernel';
import type { Constructable } from '@aurelia/kernel';
import type { IConnectable } from '@aurelia/runtime';

import { CustomAttribute } from './resources/custom-attribute.js';
import { CustomElement } from './resources/custom-element.js';

export type IDepCollectionFn<TType extends object, TReturn = unknown> = (vm: TType, watcher: IConnectable) => TReturn;
export type IWatcherCallback<TType extends object, TValue = unknown>
  = (this: TType, newValue: TValue, oldValue: TValue, vm: TType) => unknown;

export interface IWatchDefinition<T extends object = object> {
  expression: PropertyKey | IDepCollectionFn<T>;
  callback: keyof T | IWatcherCallback<T>;
}

type AnyMethod<R = unknown> = (...args: unknown[]) => R;
type WatchClassDecorator<T extends object> = <K extends Constructable<T>>(target: K) => void;
type WatchMethodDecorator<T> = <R, K extends AnyMethod<R> = AnyMethod<R>>(target: T, key: string | symbol, descriptor: PropertyDescriptor) => PropertyDescriptor;
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
  if (!expressionOrPropertyAccessFn) {
    if (__DEV__)
      throw new Error('Invalid watch config. Expected an expression or a fn');
    else
      throw new Error('AUR0772');
  }

  return function decorator(
    target: Constructable<T> | Constructable<T>['prototype'],
    key?: PropertyKey,
    descriptor?: PropertyDescriptor,
  ): void {
    const isClassDecorator = key == null;
    const Type = isClassDecorator ? target : target.constructor;
    const watchDef = new WatchDefinition(expressionOrPropertyAccessFn, isClassDecorator ? changeHandlerOrCallback : descriptor!.value);

    // basic validation
    if (isClassDecorator) {
      if (typeof changeHandlerOrCallback !== 'function'
        && (changeHandlerOrCallback == null || !(changeHandlerOrCallback in Type.prototype))
      ) {
        if (__DEV__)
          throw new Error(`Invalid change handler config. Method "${String(changeHandlerOrCallback)}" not found in class ${Type.name}`);
        else
          throw new Error(`AUR0773:${String(changeHandlerOrCallback)}@${Type.name}}`);
      }
    } else if (typeof descriptor?.value !== 'function') {
      if (__DEV__)
        throw new Error(`decorated target ${String(key)} is not a class method.`);
      else
        throw new Error(`AUR0774:${String(key)}`);
    }

    Watch.add(Type, watchDef);

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
    if (CustomAttribute.isType(Type)) {
      CustomAttribute.getDefinition(Type).watches.push(watchDef);
    }
    if (CustomElement.isType(Type)) {
      CustomElement.getDefinition(Type).watches.push(watchDef);
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
const watchBaseName = Protocol.annotation.keyFor('watch');
export const Watch = {
  name: watchBaseName,
  add(Type: Constructable, definition: IWatchDefinition): void {
    let watchDefinitions: IWatchDefinition[] = Metadata.getOwn(watchBaseName, Type);
    if (watchDefinitions == null) {
      Metadata.define(watchBaseName, watchDefinitions = [], Type);
    }
    watchDefinitions.push(definition);
  },
  getAnnotation(Type: Constructable): IWatchDefinition[] {
    return Metadata.getOwn(watchBaseName, Type) ?? noDefinitions;
  },
};
