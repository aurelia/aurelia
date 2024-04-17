import { AccessorType, IAccessor, ISubscriberCollection, atObserver } from '../observation';
import { safeString, def, isFunction, areEqual } from '../utilities';
import { currentConnectable } from './connectable-switcher';

import { emptyObject, type Constructable, type IIndexable } from '@aurelia/kernel';
import type { InterceptorFunc, IObservable } from '../observation';
import type { ObservableGetter } from './observer-locator';
import type { SetterObserver } from './setter-observer';
import { subscriberCollection } from './subscriber-collection';
import { ErrorNames, createMappedError } from '../errors';

export interface IObservableDefinition {
  name?: PropertyKey;
  callback?: PropertyKey;
  set?: InterceptorFunc;
}

type FieldInitializer<TFThis, TValue> = (this: TFThis, initialValue: TValue) => TValue;
type ObservableFieldDecorator<TFThis, TValue> = (target: undefined, context: ClassFieldDecoratorContext<TFThis, TValue>) => FieldInitializer<TFThis, TValue>;
type ObservableClassDecorator<TCThis extends Constructable> = (target: TCThis, context: ClassDecoratorContext<TCThis>) => void;

export const observable = /*@__PURE__*/(() => {

  function getObserversLookup(obj: IObservable): IIndexable<{}, SetterObserver | SetterNotifier> {
    if (obj.$observers === void 0) {
      def(obj, '$observers', { value: {} });
      // todo: define in a weakmap
    }
    return obj.$observers as IIndexable<{}, SetterObserver | SetterNotifier>;
  }

  const noValue: unknown = {};
  // for
  //    class {
  //      @observable prop
  //    }
  function observable<TFThis, TValue>(target: undefined, context: ClassFieldDecoratorContext<TFThis, TValue>): FieldInitializer<TFThis, TValue>;
  // for
  //    @observable({...})
  //    class {}
  // and
  //    class {
  //      @observable({...}) prop
  //    }
  function observable<TCThis extends Constructable, TFThis, TValue>(config: IObservableDefinition): (target: TCThis | undefined, context: ClassDecoratorContext<TCThis> | ClassFieldDecoratorContext<TFThis, TValue>) => FieldInitializer<TFThis, TValue> | void;
  // for
  //    @observable('') class {}
  //    @observable(5) class {}
  //    @observable(Symbol()) class {}
  function observable<TCThis extends Constructable>(key: PropertyKey): ObservableClassDecorator<TCThis>;
  // for:
  //    class {
  //      @observable() prop
  //    }
  function observable<TFThis, TValue>(): ObservableFieldDecorator<TFThis, TValue>;
  // impl, wont be seen
  function observable<TCThis extends Constructable, TFThis, TValue>(targetOrConfig?: undefined | IObservableDefinition | PropertyKey, context?: ClassFieldDecoratorContext): ObservableClassDecorator<TCThis> | ObservableFieldDecorator<TFThis, TValue> | FieldInitializer<TFThis, TValue> {
    if (!SetterNotifier.mixed) {
      SetterNotifier.mixed = true;
      subscriberCollection(SetterNotifier, null!);
    }

    let isClassDecorator = false;
    let config: IObservableDefinition;
    if (typeof targetOrConfig === 'object') {
      config = targetOrConfig;
    } else if (targetOrConfig != null) {
      config = { name: targetOrConfig };
      isClassDecorator = true;
    } else {
      config = emptyObject;
    }

    // case: @observable() prop
    if (arguments.length === 0) {
      return function (target: unknown, context: DecoratorContext) {
        if (context.kind !== 'field') throw createMappedError(ErrorNames.invalid_observable_decorator_usage);
        return createFieldInitializer(context);
      };
    }

    // case: @observable prop
    if (context?.kind === 'field') return createFieldInitializer(context);

    // case:  @observable(PropertyKey) class
    if (isClassDecorator) {
      return function (target: TCThis, _context: ClassDecoratorContext<TCThis>) {
        createDescriptor(target, config.name!, () => noValue, true);
      };
    }

    // case: @observable({...}) class | @observable({...}) prop
    return function (target: Constructable | undefined, context: ClassFieldDecoratorContext | ClassDecoratorContext) {
      switch (context.kind) {
        case 'field': return createFieldInitializer(context);
        case 'class': return createDescriptor(target, config.name!, () => noValue, true);
        default: throw createMappedError(ErrorNames.invalid_observable_decorator_usage);
      }
    };

    function createFieldInitializer(context: ClassFieldDecoratorContext): FieldInitializer<TFThis, TValue> {
      let $initialValue: TValue;
      context.addInitializer(function (this: unknown) {
        createDescriptor(this, context.name, () => $initialValue, false);
      });
      return function (this: TFThis, initialValue: TValue) {
        return $initialValue = initialValue;
      };
    }
    function createDescriptor(target: unknown, property: PropertyKey, initialValue: () => unknown, targetIsClass: boolean): void {
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/strict-boolean-expressions
      const callback = config.callback || `${safeString(property)}Changed`;
      const $set = config.set;
      const observableGetter: ObservableGetter = function (this: IObservable) {
        const notifier = getNotifier(this, property, callback, initialValue, $set);
        currentConnectable()?.subscribeTo(notifier);
        return notifier.getValue();
      };
      observableGetter.getObserver = function (obj: IObservable) {
        return getNotifier(obj, property, callback, initialValue, $set);
      };

      const descriptor = {
        enumerable: true,
        configurable: true,
        get: observableGetter,
        set(this: IObservable, newValue: TValue) {
          getNotifier(this, property, callback, initialValue, $set).setValue(newValue);
        }
      };
      if (targetIsClass) def((target as Constructable).prototype as object, property, descriptor);
      else def(target as object, property, descriptor);
    }
  }

  function getNotifier(
    obj: IObservable,
    key: PropertyKey,
    callbackKey: PropertyKey,
    initialValue: () => unknown,
    set: InterceptorFunc | undefined,
  ): SetterNotifier {
    const lookup = getObserversLookup(obj) as unknown as Record<PropertyKey, SetterObserver | SetterNotifier>;
    let notifier = lookup[key as string] as SetterNotifier;
    if (notifier == null) {
      const $initialValue = initialValue();
      notifier = new SetterNotifier(obj, callbackKey, set, $initialValue === noValue ? void 0 : $initialValue);
      lookup[key as string] = notifier;
    }
    return notifier;
  }

  type ChangeHandlerCallback = (this: object, value: unknown, oldValue: unknown) => void;

  interface SetterNotifier extends IAccessor, ISubscriberCollection { }

  class SetterNotifier implements IAccessor {
    public static mixed = false;
    public readonly type: AccessorType = atObserver;

    /** @internal */
    private _value: unknown = void 0;
    /** @internal */
    private _oldValue: unknown = void 0;
    /** @internal */
    private readonly cb?: ChangeHandlerCallback;
    /** @internal */
    private readonly _obj: object;
    /** @internal */
    private readonly _setter: InterceptorFunc | undefined;
    /** @internal */
    private readonly _hasSetter: boolean;

    public constructor(
      obj: object,
      callbackKey: PropertyKey,
      set: InterceptorFunc | undefined,
      initialValue: unknown,
    ) {
      this._obj = obj;
      this._setter = set;
      this._hasSetter = isFunction(set);
      const callback = (obj as IIndexable)[callbackKey as string];
      this.cb = isFunction(callback) ? callback as ChangeHandlerCallback : void 0;
      this._value = initialValue;
    }

    public getValue(): unknown {
      return this._value;
    }

    public setValue(value: unknown): void {
      if (this._hasSetter) {
        value = this._setter!(value);
      }
      if (!areEqual(value, this._value)) {
        this._oldValue = this._value;
        this._value = value;
        this.cb?.call(this._obj, this._value, this._oldValue);
        // this._value might have been updated during the callback
        // we only want to notify subscribers with the latest values
        value = this._oldValue;
        this._oldValue = this._value;
        this.subs.notify(this._value, value);
      }
    }
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

  return observable;
})();
