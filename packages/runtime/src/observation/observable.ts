import { Constructable, IIndexable } from '@aurelia/kernel';
import { IBindingContext, ObserversLookup, PropertyObserver, ISubscriber } from '../observation';
import { SetterObserver, SetterNotifier } from './setter-observer';
import { LifecycleFlags } from '../flags';
import { InternalObserversLookup } from './binding-context';
import { InterceptorFunc } from '../templating/bindable';

// todo(bigopon): static obs here

type $Getter = PropertyDescriptor['get'] & {
  getObserver(obj: IIndexable): SetterObserver | SetterNotifier;
};

export interface IObservableDefinition {
  name?: PropertyKey;
  changeHandler?: PropertyKey;
  set?: InterceptorFunc;
}

function getObserversLookup(obj: IIndexable<{ $observers?: ObserversLookup }>): ObserversLookup {
  let $observers = obj.$observers;
  if ($observers == null) {
    $observers = new InternalObserversLookup();
    if (!Reflect.defineProperty(obj, '$observers', { configurable: false, value: $observers })) {
      // todo: define in a weakmap
    }
  }
  return $observers;
}

const noValue: unknown = {};

type SetterObserverOwningObject = IIndexable<IBindingContext, PropertyObserver>;

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
    //    @observable({ name: 'prop', changeHandler: ... })
    //    class {}
    //
    //    class {
    //      @observable() prop
    //      @observable({ changeHandler: ... }) prop2
    //    }
    return ((t: Constructable, k: PropertyKey, d: PropertyDescriptor) => deco(t, k, d, targetOrConfig)) as ClassDecorator;
  }
  // for:
  //    class {
  //      @observable prop
  //    }
  return deco(targetOrConfig as Constructable['prototype'], key, descriptor) as PropertyDecorator;

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
      : (config || {});

    if (isClassDecorator) {
      key = config.name;
    }

    if (key == null || key === '') {
      throw new Error('Invalid usage, cannot determine property name for @observable');
    }

    // determine callback name based on config or convention.
    const changeHandler = config.changeHandler || `${String(key)}Changed`;
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
    descriptor.get = function g(this: SetterObserverOwningObject) {
      return getNotifier(this, key!, changeHandler, initialValue, $set).getValue();
    };
    descriptor.set = function s(this: SetterObserverOwningObject, newValue: unknown) {
      getNotifier(this, key!, changeHandler, initialValue, $set).setValue(newValue, LifecycleFlags.none);
    };
    (descriptor.get as $Getter).getObserver = function gO(obj: SetterObserverOwningObject) {
      return getNotifier(obj, key!, changeHandler, initialValue, $set);
    };

    if (isClassDecorator) {
      Reflect.defineProperty((target as Constructable).prototype, key, descriptor);
    } else {
      return descriptor;
    }
  }
}

type ChangeHandlerCallback =
  (this: SetterObserverOwningObject, value: unknown, oldValue: unknown, key: PropertyKey) => void;

class CallbackSubscriber implements ISubscriber {
  public constructor(
    private readonly obj: SetterObserverOwningObject,
    private readonly key: PropertyKey,
    private readonly cb: ChangeHandlerCallback,
  ) {}

  public handleChange(value: unknown, oldValue: unknown): void {
    this.cb.call(this.obj, value, oldValue, this.key);
  }
}

function getNotifier(
  obj: SetterObserverOwningObject,
  key: PropertyKey,
  changeHandler: PropertyKey,
  initialValue: unknown,
  set?: InterceptorFunc,
): SetterNotifier {
  const lookup = getObserversLookup(obj) as unknown as Record<PropertyKey, SetterObserver | SetterNotifier>;
  let notifier = lookup[key as string] as SetterNotifier;
  if (notifier == null) {
    notifier = new SetterNotifier(set);
    lookup[key as string] = notifier;
    if (initialValue !== noValue) {
      notifier.setValue(initialValue, LifecycleFlags.none);
    }
    const callback = obj[changeHandler as string];
    if (typeof callback === 'function') {
      notifier.subscribe(new CallbackSubscriber(obj, key, callback));
    }
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
