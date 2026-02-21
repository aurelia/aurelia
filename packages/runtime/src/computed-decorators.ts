import { AnyFunction, isFunction, isObject } from '@aurelia/kernel';
import { createMappedError, ErrorNames } from './errors';
import { type IObserver } from './interfaces';
import { type ComputedPropertyInfo } from './object-property-info';
import { type IObserverLocator } from './observer-locator';
import { rtObjectAssign } from './utilities';
import { getRaw } from './proxy-observation';
import { astTrackableMethodMarker } from './ast.eval';

type ClassGetterFunction<T> = (target: () => unknown, context: ClassGetterDecoratorContext<T>) => void;
// eslint-disable-next-line @typescript-eslint/ban-types
type ClassMethodFunction = (target: Function, context: ClassMethodDecoratorContext) => void;

export type ComputedDependencyFn<T = unknown> = (instance: T) => unknown;
export type ComputedDependency = string | symbol | ComputedDependencyFn;

export type ComputedMethodOptions = {
  deps?: string[] | ComputedDependencyFn;
};

/* eslint-disable @typescript-eslint/ban-types */
function isClassMethodDecoratorContext(value: unknown): value is ClassMethodDecoratorContext {
  return (value as ClassMethodDecoratorContext)?.kind === 'method';
}

/**
 * Decorate a getter to configure computed property observation,
 * or decorate a method to declare/track dependencies when called from an observation context
 * (e.g. a template binding or another computed observation).
 * A normal function call will not trigger any observation.
 *
 * Getter usage:
 * ```ts
 * class MyElement {
 *   \@computed({ deps: ['firstName', 'lastName'] })
 *   public get fullName(): string {
 *     return `${this.firstName} ${this.lastName}`;
 *   }
 * }
 * ```
 *
 * Method usage:
 * ```ts
 * class MyElement {
 *   \@computed
 *   public format() { return this.value; }
 *
 *   \@computed('nested.prop')
 *   public lookup() { return this.nested.prop; }
 *
 *   \@computed((vm: MyElement) => vm.a + vm.b)
 *   public calculate() { return this.a + this.b; }
 *
 *   \@computed({ deps: ['a', 'b'] })
 *   public sum() { return this.a + this.b; }
 * }
 * ```
 *
 * Behavior:
 * - Method observation only activates when called from an observation context
 *   (template binding, computed observation). Normal calls are unaffected.
 * - `deps` omitted (or `undefined`) falls back to proxy-based auto-tracking.
 * - `deps: []` explicitly disables tracking.
 * - `deps` with strings or a getter function enables explicit dependency tracking.
 * - Stacking `\@computed` overrides prior metadata (last applied wins).
 */
export function computed(target: Function, context: ClassMethodDecoratorContext): void;

// Universal overloads that work for both getters and methods
// TypeScript can't distinguish at compile time, but runtime checks context.kind
export function computed<T = unknown>(fn: ComputedDependencyFn<T>): any; // eslint-disable-line @typescript-eslint/no-explicit-any
export function computed(...dependencies: (string | symbol)[]): any; // eslint-disable-line @typescript-eslint/no-explicit-any
export function computed<T = unknown>(config: {
  deps?: (string | symbol)[] | ComputedDependencyFn<T>;
  flush?: 'sync' | 'async';
  deep?: boolean;
}): any; // eslint-disable-line @typescript-eslint/no-explicit-any

export function computed<TThis extends object>(
  targetOrOptionsOrDependency?: unknown,
  ...rest: unknown[]
): void | ClassGetterFunction<TThis> | ClassMethodFunction {
  // Direct method decoration: @computed
  if (isFunction(targetOrOptionsOrDependency) && isClassMethodDecoratorContext(rest[0])) {
    const trackableTarget = targetOrOptionsOrDependency as AnyFunction & { [astTrackableMethodMarker]?: ComputedMethodOptions };
    rtObjectAssign(trackableTarget, {
      [astTrackableMethodMarker]: {
        deps: void 0,
      }
    });
    return;
  }

  // Return a universal decorator that handles both getters and methods
  return function universalDecorator(
    target: Function | (() => unknown),
    context: ClassMethodDecoratorContext | ClassGetterDecoratorContext<TThis>
  ) {
    if (context.kind === 'method') {
      // Methods support: single function, string/symbol dependencies, or config object
      const methodOptions: ComputedMethodOptions = {};

      if (typeof targetOrOptionsOrDependency === 'string' || typeof targetOrOptionsOrDependency === 'symbol') {
        methodOptions.deps = [targetOrOptionsOrDependency, ...rest] as string[];
      } else if (isFunction(targetOrOptionsOrDependency)) {
        methodOptions.deps = targetOrOptionsOrDependency as ComputedDependencyFn;
      } else if (targetOrOptionsOrDependency != null && typeof targetOrOptionsOrDependency === 'object') {
        const configuredOptions = targetOrOptionsOrDependency as ComputedMethodOptions;
        if (Object.prototype.hasOwnProperty.call(configuredOptions, 'deps')) {
          methodOptions.deps = configuredOptions.deps;
        }
      }

      const trackableTarget = target as AnyFunction & { [astTrackableMethodMarker]?: ComputedMethodOptions };
      rtObjectAssign(trackableTarget, {
        [astTrackableMethodMarker]: {
          deps: methodOptions.deps,
        }
      });
      return;
    }

    const getterOptions: ComputedPropertyInfo = isObject(targetOrOptionsOrDependency)
      ? targetOrOptionsOrDependency as ComputedPropertyInfo
      : {};

    if (!isObject(targetOrOptionsOrDependency)) {
      getterOptions.deps = [targetOrOptionsOrDependency, ...rest] as (string | symbol)[];
    }

    const getterTarget = target as () => unknown;
    const getterContext = context;

    /* istanbul ignore next */
    if (getterContext.kind !== 'getter') {
      throw createMappedError(ErrorNames.computed_not_getter, getterContext.name);
    }

    const cache = new WeakMap<object, IObserver>();

    return rtObjectAssign(function computedGetter(this: TThis) {
      const observer = cache.get(getRaw(this));
      return observer == null ? getterTarget.call(getRaw(this)) : observer.getValue();
    }, {
      getObserver(obj: TThis, requestor: IObserverLocator): IObserver {
        let observer = cache.get(obj);
        if (observer == null) {
          observer = requestor.getComputedObserver(obj, getterContext.name, { get: getterTarget }, getterOptions);
          cache.set(obj, observer);
        }
        return observer;
      }
    });
  } as ClassGetterFunction<TThis> | ClassMethodFunction;
}
/* eslint-enable @typescript-eslint/ban-types */

/* eslint-disable @typescript-eslint/no-unused-vars */
function testComputed() {
  class MyClass {
    private readonly value = 1;
    public v = 1;
    public nested = { prop: 'test' };

    @computed('value')
    @computed('value', 'v')
    @computed({ deps: ['value'] })
    @computed({ flush: 'sync' })
    @computed({ deps: ['nested'], deep: true })
    public get getter5(): number {
      return this.nested.prop.length;
    }

    @computed
    @computed('value')
    @computed((vm: MyClass) => vm.value)
    @computed({ deps: ['value'] })
    @computed({ deps: ['value', 'v'] })
    @computed({ deps: ['nested.prop'] })
    @computed({ deps: [] })
    @computed({ deps: (vm: MyClass) => vm.value })
    public method() {
      return this.value;
    }
  }
}
