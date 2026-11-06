import { emptyArray, getPrototypeChain, isFunction } from '@aurelia/kernel';
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

type AnyMethod<R = unknown> = (...args: any[]) => R;
type WatchClassDecorator<T extends object> = (target: Constructable<T>, context: ClassDecoratorContext<Constructable<T>>) => void;
type WatchableMethod<T extends object, D, R = unknown>
  = (() => R)
  | ((newValue: D) => R)
  | ((newValue: D, oldValue: D) => R)
  | ((newValue: D, oldValue: D, vm: T) => R);
type WatchMethodDecorator<T extends object, D> = <TV extends WatchableMethod<T, D>>(target: TV, context: ClassMethodDecoratorContext<T, TV>) => void;
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
export function watch<T extends object = object, D = unknown>(
  expressionOrPropertyAccessFn: PropertyKey | IDepCollectionFn<T, D>,
  options?: IWatchOptions,
): WatchMethodDecorator<T, D>;

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

    // context.metadata belongs to the class that declares the decorator, even for a method decorator,
    // so recording against it now (rather than against this.constructor of the first instance) keeps
    // the watch on its declaring class, where subclasses can inherit it without writing into it.
    addWatch(context.metadata, watchDef as IWatchDefinition);
  };
}

class WatchDefinition<T extends object> implements IWatchDefinition<T> {
  public constructor(
    public expression: PropertyKey | IDepCollectionFn<T>,
    public callback: IWatcherCallback<T>,
    public flush: 'async' | 'sync' = 'async',
  ) {}
}

// Keyed by constructor for Watch.add, and by the declaring class's own decorator metadata object for @watch.
const watches = /*@__PURE__*/new WeakMap<object, IWatchDefinition[]>();

const addWatch = (owner: object, definition: IWatchDefinition): void => {
  let defs = watches.get(owner);
  if (defs == null) {
    watches.set(owner, defs = []);
  }
  defs.push(definition);
};

export const Watch = /*@__PURE__*/objectFreeze({
  add(Type: Constructable, definition: IWatchDefinition): void {
    addWatch(Type, definition);
  },
  /**
   * Returns the watch definitions declared on the type and on its base classes, base class first.
   */
  getDefinitions(Type: Constructable): IWatchDefinition[] {
    const prototypeChain = getPrototypeChain(Type);
    let defs: IWatchDefinition[] | undefined;
    let Class: Constructable;
    let own: IWatchDefinition[] | undefined;
    let i = prototypeChain.length;
    while (--i >= 0) {
      Class = prototypeChain[i];
      own = watches.get(Class);
      if (own !== void 0) {
        (defs ??= []).push(...own);
      }
      // Only an own metadata object counts: a class without one reads its parent's through the
      // constructor's prototype chain, and that parent is already visited separately.
      if (Object.prototype.hasOwnProperty.call(Class, Symbol.metadata)) {
        own = watches.get((Class as { [Symbol.metadata]: object })[Symbol.metadata]);
        if (own !== void 0) {
          (defs ??= []).push(...own);
        }
      }
    }
    return defs ?? emptyArray;
  }
});

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
    public ctrl = { confirmUrl: '' };

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

    @watch((vm) => vm.ctrl.confirmUrl)
    public onConfirmUrlChanged(url: string) {/*  */}

    @watch((vm) => vm.ctrl.confirmUrl)
    public onConfirmUrlChanged2() {/*  */}
  }
}
