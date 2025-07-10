import { emptyArray, isFunction } from '@aurelia/kernel';
import { getAttributeDefinition, isAttributeType } from './resources/custom-attribute';
import { getElementDefinition, isElementType } from './resources/custom-element';
import { objectFreeze, safeString } from './utilities';

import type { Constructable } from '@aurelia/kernel';
import type { IConnectable } from '@aurelia/runtime';
import { ErrorNames, createMappedError } from './errors';

export type IDepCollectionFn<TType extends object, TReturn = unknown> = (vm: TType, watcher: IConnectable) => TReturn;
export type IWatcherCallback<TType extends object, TValue = unknown>
  = (this: TType, newValue: TValue, oldValue: TValue, vm: TType) => unknown;

export interface IWatchDefinition<T extends object = object> {
  expression: PropertyKey | IDepCollectionFn<T>;
  callback: keyof T | IWatcherCallback<T>;
  flush: 'async' | 'sync';
}

export type IWatchOptions = {
  flush?: 'async' | 'sync';
};

type AnyMethod<R = unknown> = (...args: unknown[]) => R;
type WatchClassDecorator<T extends object> = (target: Constructable<T>, context: ClassDecoratorContext<Constructable<T>>) => void;
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
  options?: IWatchOptions,
): WatchClassDecorator<T>;

export function watch<T extends object, D = unknown>(
  expressionOrPropertyAccessFn: IDepCollectionFn<T, D>,
  changeHandlerOrCallback: MethodsOf<T> | IWatcherCallback<T, D>,
  options?: IWatchOptions,
): WatchClassDecorator<T>;

// for
// class A {
//    @watch('some.expression')
//    @watch(Symbol)
//    @watch(a => ...)
//    method() {...}
// }
export function watch<T extends object = object, D = unknown, TV extends AnyMethod = AnyMethod>(
  expressionOrPropertyAccessFn: PropertyKey | IDepCollectionFn<T, D>,
  options?: IWatchOptions,
): WatchMethodDecorator<T, TV>;

export function watch<T extends object = object, TV extends AnyMethod = AnyMethod>(
  expressionOrPropertyAccessFn: PropertyKey | IDepCollectionFn<object>,
  changeHandlerOrCallbackOrOptions?: PropertyKey | IWatcherCallback<T> | IWatchOptions,
  optionsOrUndefined?: IWatchOptions,
): WatchClassDecorator<T> | WatchMethodDecorator<T, TV> {
  if (expressionOrPropertyAccessFn == null) {
    throw createMappedError(ErrorNames.watch_null_config);
  }

  return function decorator(
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: Function | IWatcherCallback<T>,
    context: ClassDecoratorContext<Constructable<T>> | ClassMethodDecoratorContext<T>
  ): void {
    const isClassDecorator = context.kind === 'class';
    let options: IWatchOptions | undefined;
    let changeHandler: IWatcherCallback<T>;

    // basic validation
    if (isClassDecorator) {
      if (!isFunction(changeHandlerOrCallbackOrOptions)
        && (changeHandlerOrCallbackOrOptions == null
          || !(changeHandlerOrCallbackOrOptions as PropertyKey in target.prototype)
        )
      ) {
        throw createMappedError(
          ErrorNames.watch_invalid_change_handler,
          `${safeString(changeHandlerOrCallbackOrOptions)}@${target.name}}`
        );
      }
      changeHandler = changeHandlerOrCallbackOrOptions as IWatcherCallback<T>;
      options = optionsOrUndefined ?? {};
    } else {
      if (!isFunction(target) || context.static) {
        throw createMappedError(ErrorNames.watch_non_method_decorator_usage, context.name);
      }
      changeHandler = target as IWatcherCallback<T>;
      options = changeHandlerOrCallbackOrOptions as IWatchOptions ?? {};
    }

    const watchDef = new WatchDefinition<T>(
      expressionOrPropertyAccessFn,
      changeHandler,
      options.flush,
    );

    if (isClassDecorator) {
      addDefinition(target as Constructable);
    } else {
      // instance method decorator initializer is called for each instance
      let added = false;
      context.addInitializer(function (this: T) {
        if (!added) {
          added = true;
          addDefinition(this.constructor as Constructable);
        }
      });
    }

    function addDefinition(type: Constructable) {
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
    public flush: 'async' | 'sync' = 'async',
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

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-member-access */
function testWatchDeco() {
  @watch('some.property', (_, __, vm) => vm.prop, { flush: 'sync' })
  @watch('some.property', (_, __, vm) => vm.prop, { flush: 'async' })
  // @ts-expect-error - typo
  @watch('some.property', (_, __, vm) => vm.prop, { flush: 'asyn' })
  @watch('some.property', (_, __, vm) => vm.prop)
  @watch(vm => vm.prop, (_, __, vm) => vm.prop)
  @watch(vm => vm.prop, (_, __, vm) => vm.prop, { flush: 'sync' })
  @watch(vm => vm.prop, (_, __, vm) => vm.prop, { flush: 'async' })
  // @ts-expect-error - typo
  @watch(vm => vm.prop, (_, __, vm) => vm.prop, { flush: 'asyn' })
  class MyClass {
    public prop = 1;

    @watch('some.property')
    @watch('some.property', { flush: 'sync' })
    @watch('some.property', { flush: 'async' })
    // @ts-expect-error - typo
    @watch('some.property', { flush: 'asyn' })
    public myMethod() {/*  */}

    @watch((vm) => vm.prop)
    public myMethod2() {/*  */}

    @watch((vm) => vm.prop, {  })
    @watch((vm) => vm.prop, { flush: 'sync' })
    @watch((vm) => vm.prop, { flush: 'async' })
    // @ts-expect-error - type
    @watch((vm) => vm.prop, { flush: 'asyn' })
    public myMethod3() {/*  */}
  }
}
