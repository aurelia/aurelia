import { isObject } from '@aurelia/kernel';
import { createMappedError, ErrorNames } from './errors';
import { type IObserver } from './interfaces';
import { type ComputedPropertyInfo, computedPropInfo } from './object-property-info';
import { type IObserverLocator } from './observer-locator';
import { rtObjectAssign } from './utilities';
import { getRaw } from './proxy-observation';

type ClassGetterFunction<T> = (target: () => unknown, context: ClassGetterDecoratorContext<T>) => void;

/**
 * Decorate a getter to configure various aspects of the computed property created by the getter.
 *
 * Example usage:
 *
 * ```ts
 * export class MyElement {
 *  \@computed('value')
 *   private value = 1;
 *   public get prop(): number {
 *     return this.value;
 *   }
 * }
 * ```
 */
export function computed<TThis extends object>(...dependencies: (keyof TThis)[]): ClassGetterFunction<TThis>;
export function computed<TThis extends object>(...dependencies: (string | symbol)[]): ClassGetterFunction<TThis>;
export function computed<TThis extends object>(config: {
  deps?: (keyof TThis)[];
  flush?: 'sync' | 'async';
  deep?: boolean;
}): ClassGetterFunction<TThis>;
export function computed<TThis extends object>(config: {
  deps?: (string | symbol)[];
  flush?: 'sync' | 'async';
  deep?: boolean;
}): ClassGetterFunction<TThis>;
export function computed<
  TThis extends object
>(
  args: (keyof TThis) | (string | symbol) | {
    deps?: (keyof TThis | (string | symbol))[];
    flush?: 'sync' | 'async';
    deep?: boolean;
  },
  ...rest: (keyof TThis | string | symbol)[]
) {
  const options: ComputedPropertyInfo = isObject(args) ? args as ComputedPropertyInfo : {};
  if (!isObject(args)) {
    options.deps = [args, ...rest] as (string | symbol)[];
  }

  return function decorator(
    target: () => unknown,
    context: ClassGetterDecoratorContext<TThis>
  ) {
    // just be helpful for blind JS usages
    /* istanbul ignore next */
    if (context.kind !== 'getter') {
      throw createMappedError(ErrorNames.computed_not_getter, context.name);
    }

    context.addInitializer(function (this: object) {
      computedPropInfo.set(this, context.name, options);
    });

    // a bit of a leaked knowledge of the internals of observer locator computed observation here
    // when there's no deps, a standard computed observer is created
    // and it will override the property getter/setter on the instance
    // so we cant return a custom wrapper function that checks the cache first
    // if not, we can use a wrapper function that checks the cache first
    // doing this is just an optimization so we don't have to override the property descriptor
    // for some reason if this decorator is used with a different observer locator implementation
    // it'll likely behave incorrectly
    // in the worst case scenario, we can always override the property descriptor in the observer locator
    // and it'll still be fine
    if (options.deps == null) {
      return;
    }

    const cache = new WeakMap<object, IObserver>();

    return rtObjectAssign(function computedGetter(this: TThis) {
      const observer = cache.get(getRaw(this));
      return observer == null ? target.call(getRaw(this)) : observer.getValue();
    }, {
      getObserver(obj: TThis, requestor: IObserverLocator): IObserver {
        let observer = cache.get(obj);
        if (observer == null) {
          observer = requestor.getComputedObserver(obj, context.name, { get: target });
          cache.set(obj, observer);
        }
        return observer;
      }
    });
  };
}

/* eslint-disable @typescript-eslint/no-unused-vars */
function testComputed() {

  // normal usages
  class MyClass {
    private readonly value = 1;
    public v = 1;
    public valueee = 2;
    @computed('prop2')
    public get prop2(): number {
      return 2;
    }

    @computed({ deps: ['prop2', 'prop5'], flush: 'async' })
    public get prop3(): number {
      return 2;
    }
  }
}
