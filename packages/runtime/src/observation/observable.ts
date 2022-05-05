import { IObserver, LifecycleFlags } from '../observation';
import { SetterNotifier } from './setter-observer';
import { def } from '../utilities-objects';
import { currentConnectable } from './connectable-switcher';

import type { Constructable, IIndexable } from '@aurelia/kernel';
import type { IBindingContext, InterceptorFunc, IObservable } from '../observation';
import type { ObservableGetter } from './observer-locator';
import type { SetterObserver } from './setter-observer';

export interface IObservableDefinition {
  name?: PropertyKey;
  callback?: PropertyKey;
  set?: InterceptorFunc;
}

function getObserversLookup(obj: IObservable): IIndexable<{}, SetterObserver | SetterNotifier> {
  if (obj.$observers === void 0) {
    def(obj, '$observers', { value: {} });
    // todo: define in a weakmap
  }
  return obj.$observers as IIndexable<{}, SetterObserver | SetterNotifier>;
}

const noValue: unknown = {};

type SetterObserverOwningObject = IIndexable<IBindingContext, IObserver>;

// for
//    class {
//      @observable prop
//    }
export function observable(target: Constructable['prototype'], key: PropertyKey, descriptor?: PropertyDescriptor & { initializer?: () => unknown }): void;
// for
//    @observable({...})
//    class {}
// and
//    class {
//      @observable({...}) prop
//    }
export function observable(config: IObservableDefinition): (target: Constructable | Constructable['prototype'], ...args: unknown[]) => void;
// for
//    @observable('') class {}
//    @observable(5) class {}
//    @observable(Symbol()) class {}
export function observable(key: PropertyKey): ClassDecorator;
// for:
//    class {
//      @observable() prop
//    }
export function observable(): PropertyDecorator;
// impl, wont be seen
export function observable(
  targetOrConfig?: Constructable | Constructable['prototype'] | PropertyKey | IObservableDefinition,
  key?: PropertyKey,
  descriptor?: PropertyDescriptor
): ClassDecorator | PropertyDecorator {
  // either this check, or arguments.length === 3
  // or could be both, so can throw against user error for better DX
  if (key == null) {
    // for:
    //    @observable('prop')
    //    class {}
    //
    //    @observable({ name: 'prop', callback: ... })
    //    class {}
    //
    //    class {
    //      @observable() prop
    //      @observable({ callback: ... }) prop2
    //    }
    return ((t: Constructable, k: PropertyKey, d: PropertyDescriptor) => deco(t, k, d, targetOrConfig as PropertyKey | IObservableDefinition)) as ClassDecorator;
  }
  // for:
  //    class {
  //      @observable prop
  //    }
  return deco(targetOrConfig, key, descriptor) as PropertyDecorator;

  function deco(
    target: Constructable | Constructable['prototype'],
    key?: PropertyKey,
    descriptor?: PropertyDescriptor & { initializer?: CallableFunction },
    config?: PropertyKey | IObservableDefinition,
  ): void | PropertyDescriptor {
    // class decorator?
    const isClassDecorator = key === void 0;
    config = typeof config !== 'object'
      ? { name: config }
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      : (config || {});

    if (isClassDecorator) {
      key = config.name;
    }

    if (key == null || key === '') {
      if (__DEV__)
        throw new Error('Invalid usage, cannot determine property name for @observable');
      else
        throw new Error('AUR0224');
    }

    // determine callback name based on config or convention.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/strict-boolean-expressions
    const callback = config.callback || `${String(key)}Changed`;
    let initialValue = noValue;
    if (descriptor) {
      // we're adding a getter and setter which means the property descriptor
      // cannot have a "value" or "writable" attribute
      delete descriptor.value;
      delete descriptor.writable;
      initialValue = descriptor.initializer?.();
      delete descriptor.initializer;
    } else {
      descriptor = { configurable: true };
    }

    // make the accessor enumerable by default, as fields are enumerable
    if (!('enumerable' in descriptor)) {
      descriptor.enumerable = true;
    }

    // todo(bigopon/fred): discuss string api for converter
    const $set = config.set;
    descriptor.get = function g(/* @observable */this: SetterObserverOwningObject) {
      const notifier = getNotifier(this, key!, callback, initialValue, $set);
      currentConnectable()?.subscribeTo(notifier);
      return notifier.getValue();
    };
    descriptor.set = function s(/* @observable */this: SetterObserverOwningObject, newValue: unknown) {
      getNotifier(this, key!, callback, initialValue, $set).setValue(newValue, LifecycleFlags.none);
    };
    (descriptor.get as ObservableGetter).getObserver = function gO(/* @observable */obj: SetterObserverOwningObject) {
      return getNotifier(obj, key!, callback, initialValue, $set);
    };

    if (isClassDecorator) {
      def((target as Constructable).prototype as object, key, descriptor);
    } else {
      return descriptor;
    }
  }
}

function getNotifier(
  obj: SetterObserverOwningObject,
  key: PropertyKey,
  callbackKey: PropertyKey,
  initialValue: unknown,
  set: InterceptorFunc | undefined,
): SetterNotifier {
  const lookup = getObserversLookup(obj) as unknown as Record<PropertyKey, SetterObserver | SetterNotifier>;
  let notifier = lookup[key as string] as SetterNotifier;
  if (notifier == null) {
    notifier = new SetterNotifier(obj, callbackKey, set, initialValue === noValue ? void 0 : initialValue);
    lookup[key as string] = notifier;
  }
  return notifier;
}

/*
          | typescript       | babel
----------|------------------|-------------------------
property  | config           | config
w/parens  | target, key      | target, key, descriptor
----------|------------------|-------------------------
property  | target, key      | target, key, descriptor
no parens | n/a              | n/a
----------|------------------|-------------------------
class     | config           | config
          | target           | target
*/
