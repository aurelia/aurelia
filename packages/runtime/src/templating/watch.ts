import { Constructable, Protocol, Metadata, PLATFORM } from '@aurelia/kernel';
import type { IWatcher } from '../observation/subscriber-switcher';

export type IDepCollectionFn<T extends object = object, R = unknown> = (vm: T, watcher: IWatcher) => R;
export type IWatcherCallback<T extends object, TValue = unknown>
  = (this: T, newValue: TValue, oldValue: TValue, vm: T) => unknown;

export interface IWatchDefinition<T extends object = object> {
  expression: PropertyKey | ((vm: object) => any);
  callback: PropertyKey | IWatcherCallback<T>;
}

type AnyMethod<R = unknown> = (...args: unknown[]) => R;
type WatchClassDecorator<T extends object> = <K>(target: K extends Constructable<T> ? Constructable<T> : Function) => void;
type WatchMethodDecorator<T> = <R, K extends AnyMethod<R> = AnyMethod<R>>(target: T, key: string | symbol, descriptor: TypedPropertyDescriptor<K>) => TypedPropertyDescriptor<K>;

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
export function watch<T extends object = object, D = unknown>(
  expressionOrPropertyAccessFn: PropertyKey | IDepCollectionFn<T, D>,
  changeHandlerOrCallback: string | IWatcherCallback<T, D>,
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
  expressionOrPropertyAccessFn: PropertyKey | IDepCollectionFn<T>,
  changeHandlerOrCallback?: string | IWatcherCallback<T>,
): WatchClassDecorator<T> | WatchMethodDecorator<T> {
  if (!expressionOrPropertyAccessFn) {
    throw new Error('Invalid watch config. Expected an expression or a fn');
  }

  return function decorator(
    target: Constructable<T> | Constructable<T>['prototype'],
    key?: PropertyKey,
    descriptor?: PropertyDescriptor,
  ): void {
    const isClassDecorator = key == null;
    const Type = isClassDecorator ? target : target.constructor;

    // basic validation
    if (typeof changeHandlerOrCallback === 'string' && !(changeHandlerOrCallback in Type.prototype)) {
      throw new Error(`Invalid change handler config. Method not found in class ${Type.name}`);
    }

    if (!isClassDecorator && typeof descriptor?.value !== 'function') {
      throw new Error(`decorated target ${String(key)} is not a class method.`);
    }

    Watch.add(Type, {
      // @ts-ignore
      expression: expressionOrPropertyAccessFn,
      callback: isClassDecorator ? changeHandlerOrCallback : descriptor!.value,
    });
  }
}

const noDefinitions: IWatchDefinition[] = PLATFORM.emptyArray;
export const Watch = {
  name: Protocol.annotation.keyFor('@watch'),
  add(Type: Constructable, definition: IWatchDefinition): void {
    let watchDefinitions: IWatchDefinition[] = Metadata.getOwn(Watch.name, Type);
    if (watchDefinitions == null) {
      Metadata.define(Watch.name, watchDefinitions = [], Type);
    }
    watchDefinitions.push(definition);
  },
  getAnnotation(Type: Constructable): IWatchDefinition[] {
    return Metadata.getOwn(Watch.name, Type) ?? noDefinitions;
  },
};
