import { Constructable, IIndexable } from '@aurelia/kernel';
import { IObservable, IBindingContext, IBindingTargetObserver, ObserversLookup, PropertyObserver, ISubscriber } from '../observation';
import { SetterObserver } from './setter-observer';
import { LifecycleFlags } from '../flags';
import { InternalObserversLookup } from './binding-context';

// todo(bigopon): static obs here

type $Getter = PropertyDescriptor['get'] & {
  getObserver(obj: IIndexable): IBindingTargetObserver;
};

export interface IObservableDecoratorDefinition {
  name?: PropertyKey;
  changeHandler?: string;
}

/**
 * To be expanded into getObserver of ObserverLocator.getObserver
 */
function getSetterObserver(
  obj: IIndexable<{ $observers?: ObserversLookup }, PropertyObserver>,
  key: PropertyKey
): SetterObserver {
  let $observers = obj.$observers;
  if ($observers == null) {
    $observers = new InternalObserversLookup();
    if (!Reflect.defineProperty(obj, '$observers', { configurable: false, value: $observers })) {
      // todo: define in a weakmap
    }
  }
  return $observers[key as string] as SetterObserver
    || ($observers[key as string] = new SetterObserver(LifecycleFlags.none, obj, key as string));
}

const noValue: unknown = {};

type SetterObserverOwningObject = IIndexable<IBindingContext, PropertyObserver>;

// for
//    class {
//      @observable prop
//    }
export function observable(target: Object, key: PropertyKey, descriptor?: PropertyDescriptor): void;
// for
//    @observable({...})
//    class {}
// and
//    class {
//      @observable({...}) prop
//    }
export function observable(config: IObservableDecoratorDefinition): (target: Function | Object, ...args: unknown[]) => void;
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
  targetOrConfig?: Function | PropertyKey | IObservableDecoratorDefinition,
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
    //    @observable({ name: 'prop', changeHandler: ... })
    //    class {}
    //
    //    class {
    //      @observable() prop
    //      @observable({ changeHandler: ... }) prop2
    //    }
    return ((t: Function, k: PropertyKey, d: PropertyDescriptor) => deco(t, k, d, targetOrConfig)) as ClassDecorator;
  }
  // for:
  //    class {
  //      @observable prop
  //    }
  return deco(targetOrConfig as Function, key, descriptor) as PropertyDecorator;

  function deco(
    target: Function,
    key?: PropertyKey,
    descriptor?: PropertyDescriptor & { initializer?: CallableFunction },
    config?: PropertyKey | IObservableDecoratorDefinition,
  ): void | PropertyDescriptor {
    // class decorator?
    const isClassDecorator = key === void 0;
    config = typeof config !== 'object'
      ? { name: config }
      : (config || {});

    if (isClassDecorator) {
      target = target.prototype;
      key = config ? config.name : '';
    }

    if (key == null || key === '') {
      throw new Error('Invalid usage, cannot determine property name for @observable');
    }
    const $key = key as PropertyKey;

    // determine callback name based on config or convention.
    const changeHandler = (config && config.changeHandler) || `${String($key)}Changed`;
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

    // in the following getter/setter/getter.getObserver
    // also force start observation
    // after the first interaction (get/set/get observer), the getter/setter here will be disposed

    descriptor.get = function g(this: SetterObserverOwningObject) {
      return startObserver(this, $key, changeHandler, initialValue).getValue();
    };
    descriptor.set = function s(this: SetterObserverOwningObject, newValue: unknown) {
      startObserver(this, $key, changeHandler, initialValue).setValue(newValue, LifecycleFlags.none);
    };
    (descriptor.get as $Getter).getObserver = function gO(obj: SetterObserverOwningObject) {
      return startObserver(obj, $key, changeHandler, initialValue);
    };

    if (isClassDecorator) {
      Reflect.defineProperty(target, key!, descriptor);
    } else {
      return descriptor;
    }
  }
}

class CallbackSubscriber implements ISubscriber {
  public constructor(
    private readonly obj: SetterObserverOwningObject,
    private readonly key: PropertyKey,
    private readonly cb: Function,
  ) {}

  public handleChange(value: unknown, oldValue: unknown): void {
    this.cb.call(this.obj, value, oldValue, this.key);
  }
}

function startObserver(obj: SetterObserverOwningObject, key: PropertyKey, changeHandler: PropertyKey, initialValue: unknown): SetterObserver {
  const observer = getSetterObserver(obj, key).start();
  if (initialValue !== noValue) {
    observer.currentValue = initialValue;
  }
  const callback = obj[changeHandler as string];
  if (typeof callback === 'function') {
    observer.subscribe(new CallbackSubscriber(obj, key, callback));
  }
  return observer;
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