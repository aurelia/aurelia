import { emptyArray } from '@aurelia/kernel';
import { getAttributeDefinition, isAttributeType } from './resources/custom-attribute';
import { getElementDefinition, isElementType } from './resources/custom-element';
import { isFunction, objectFreeze, safeString } from './utilities';

import type { Constructable } from '@aurelia/kernel';
import type { IConnectable } from '@aurelia/runtime';
import { ErrorNames, createMappedError } from './errors';

export type IDepCollectionFn<TType extends object, TReturn = unknown> = (vm: TType, watcher: IConnectable) => TReturn;
export type IWatcherCallback<TType extends object, TValue = unknown>
  = (this: TType, newValue: TValue, oldValue: TValue, vm: TType) => unknown;

export interface IWatchDefinition<T extends object = object> {
  expression: PropertyKey | IDepCollectionFn<T>;
  callback: keyof T | IWatcherCallback<T>;
}

type AnyMethod<R = unknown> = (...args: unknown[]) => R;
type WatchClassDecorator<T extends object> = <K extends Constructable<T>>(target: K, context: ClassDecoratorContext<K>) => void;
type WatchMethodDecorator<T, TV extends AnyMethod> = (target: TV, context: ClassMethodDecoratorContext<T, TV>) => void;
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
export function watch<T extends object = object, D = unknown, TV extends AnyMethod = AnyMethod>(
  expressionOrPropertyAccessFn: PropertyKey | IDepCollectionFn<T, D>
): WatchMethodDecorator<T, TV>;

export function watch<T extends object = object, TV extends AnyMethod = AnyMethod>(
  expressionOrPropertyAccessFn: PropertyKey | IDepCollectionFn<object>,
  changeHandlerOrCallback?: PropertyKey | IWatcherCallback<T>,
): WatchClassDecorator<T> | WatchMethodDecorator<T, TV> {
  if (expressionOrPropertyAccessFn == null) {
    throw createMappedError(ErrorNames.watch_null_config);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  return function decorator(target: Function | IWatcherCallback<T>, context: ClassDecoratorContext<Constructable<T>> | ClassMethodDecoratorContext<T>): void {
    const isClassDecorator = context.kind === 'class';

    // basic validation
    if (isClassDecorator) {
      if (!isFunction(changeHandlerOrCallback)
        && (changeHandlerOrCallback == null || !(changeHandlerOrCallback in target.prototype))
      ) {
        throw createMappedError(ErrorNames.watch_invalid_change_handler, `${safeString(changeHandlerOrCallback)}@${target.name}}`);
      }
    } else if (!isFunction(target)) {
      throw createMappedError(ErrorNames.watch_non_method_decorator_usage, context.name);
    }

    const watchDef = new WatchDefinition<T>(
      expressionOrPropertyAccessFn,
      (isClassDecorator ? changeHandlerOrCallback : target) as IWatcherCallback<T>
    );

    if (isClassDecorator) {
      core(target as Constructable);
    } else {
      context.addInitializer(function (this: T) {
        core(this.constructor as Constructable);
      });
    }

    function core(type: Constructable) {
      Watch.add(type, watchDef as IWatchDefinition);

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
      if (isAttributeType(type)) {
        getAttributeDefinition(type).watches.push(watchDef as IWatchDefinition);
      }
      if (isElementType(type)) {
        getElementDefinition(type).watches.push(watchDef as IWatchDefinition);
      }
    }
  };
}

class WatchDefinition<T extends object> implements IWatchDefinition<T> {
  public constructor(
    public expression: PropertyKey | IDepCollectionFn<T>,
    public callback: IWatcherCallback<T>,
  ) {}
}

export const Watch = /*@__PURE__*/(() => {
  const watches = new WeakMap<Constructable, IWatchDefinition[]>();
  return objectFreeze({
    add(Type: Constructable, definition: IWatchDefinition): void {
      let defs = watches.get(Type);
      if (defs == null) {
        watches.set(Type, defs = []);
      }
      defs.push(definition);
    },
    getDefinitions(Type: Constructable): IWatchDefinition[] {
      return watches.get(Type) ?? emptyArray;
    }
  });
})();
