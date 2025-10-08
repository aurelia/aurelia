
import { IDisposable, type IServiceLocator, type Writable } from '@aurelia/kernel';
import { IsBindingBehavior } from '@aurelia/expression-parser';
import {
  connectable,
  type IAccessor,
  type IObserverLocator,
  type IObserverLocatorBasedConnectable,
  ISubscriber,
  type IAstEvaluator,
  type Scope,
  astEvaluate,
  type IOverrideContext,
} from '@aurelia/runtime';
import {
  BindingMode,
  type IBindingController,
  mixinAstEvaluator,
  mixingBindingLimited,
  type IBinding,
} from '@aurelia/runtime-html';
import {
  type IStore,
  type IStoreSubscriber,
  type StoreLocator,
  IStoreManager
} from './interfaces';
import { isStoreInstance } from './store-manager';
import type { IsAssign } from '@aurelia/expression-parser';
import { createStateBindingScope } from './state-utilities';

/**
 * A binding that handles the connection of the global state to a property of a target object
 */
export interface StateBinding extends IAstEvaluator, IObserverLocatorBasedConnectable, IServiceLocator { }
export class StateBinding implements IBinding, ISubscriber, IStoreSubscriber<object> {
  static {
    connectable(StateBinding, null!);
    mixinAstEvaluator(StateBinding);
    mixingBindingLimited(StateBinding, () => 'updateTarget');
  }

  public isBound: boolean = false;

  /** @internal */
  public readonly oL: IObserverLocator;

  /** @internal */
  public l: IServiceLocator;

  /** @internal */
  public _scope?: Scope | undefined;

  public ast: IsBindingBehavior;
  private readonly target: object;
  private readonly targetProperty: PropertyKey;

  /** @internal */ private readonly _storeManager: IStoreManager;
  /** @internal */ private readonly _staticStoreLocator?: StoreLocator;
  /** @internal */ private readonly _storeLocatorExpression?: IsAssign;
  /** @internal */ private _store?: IStore<object>;
  /** @internal */ private _targetObserver!: IAccessor;
  /** @internal */ private _value: unknown = void 0;
  /** @internal */ private _sub?: IDisposable | Unsubscribable | (() => void) = void 0;
  /** @internal */ private _updateCount = 0;
  /** @internal */ private readonly _controller: IBindingController;

  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  public strict: boolean;

  public mode: BindingMode = BindingMode.toView;

  public constructor(
    controller: IBindingController,
    locator: IServiceLocator,
    observerLocator: IObserverLocator,
    ast: IsBindingBehavior,
    target: object,
    prop: PropertyKey,
    storeManager: IStoreManager,
    storeLocator: StoreLocator | IsAssign | undefined,
    strict: boolean,
  ) {
    this._controller = controller;
    this.l = locator;
    this._storeManager = storeManager;
    this.oL = observerLocator;
    this.ast = ast;
    this.target = target;
    this.targetProperty = prop;
    this.strict = strict;
    if (storeLocator != null) {
      if (typeof storeLocator === 'object' && '$kind' in storeLocator) {
        this._storeLocatorExpression = storeLocator as IsAssign;
      } else {
        this._staticStoreLocator = storeLocator as StoreLocator;
      }
    }
  }

  public updateTarget(value: unknown) {
    const targetAccessor = this._targetObserver;

    const target = this.target;
    const prop = this.targetProperty;
    const updateCount = this._updateCount++;
    const isCurrentValue = () => updateCount === this._updateCount - 1;
    this._unsub();

    if (isSubscribable(value)) {
      this._sub = value.subscribe($value => {
        if (isCurrentValue()) {
          targetAccessor.setValue($value, target, prop);
        }
      });
      return;
    }

    if (value instanceof Promise) {
      void value.then($value => {
        if (isCurrentValue()) {
          targetAccessor.setValue($value, target, prop);
        }
      }, () => {/* todo: don't ignore */});
      return;
    }

    targetAccessor.setValue(value, target, prop);
  }

  public bind(_scope: Scope): void {
    if (this.isBound) {
      return;
    }
    this._targetObserver = this.oL.getAccessor(this.target, this.targetProperty);
    const store = this._store = this._resolveStore(_scope);
    this.updateTarget(this._value = astEvaluate(
      this.ast,
      this._scope = createStateBindingScope(store.getState(), _scope),
      this,
      this.mode > BindingMode.oneTime ? this : null),
    );
    store.subscribe(this);
    this.isBound = true;
  }

  public unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    this._unsub();
    // also disregard incoming future value of promise resolution if any
    this._updateCount++;
    this._scope = void 0;
    const store = this._store;
    this._store?.unsubscribe(this);
    this._store = void 0;
  }

  public handleChange(newValue: unknown): void {
    if (!this.isBound) return;

    const obsRecord = this.obs;
    obsRecord.version++;
    newValue = astEvaluate(this.ast, this._scope!, this, this);
    obsRecord.clear();

    this.updateTarget(newValue);
  }

  public handleStateChange(): void {
    if (!this.isBound) return;

    const store = this._store ?? this._resolveStore(this._scope!);
    const state = store.getState();
    const _scope = this._scope!;
    const overrideContext = _scope.overrideContext as Writable<IOverrideContext>;
    _scope.bindingContext = overrideContext.bindingContext = state;
    const value = astEvaluate(
      this.ast,
      _scope,
      this,
      this.mode > BindingMode.oneTime ? this : null
    );

    if (value === this._value) {
      return;
    }
    this._value = value;
    this.updateTarget(value);
  }

  /** @internal */
  private _resolveStore(scope: Scope): IStore<object> {
    if (this._storeLocatorExpression != null) {
      const evaluatedLocator = astEvaluate(this._storeLocatorExpression, scope, this, null);
      if (isStoreInstance(evaluatedLocator)) {
        return evaluatedLocator;
      }
      return this._storeManager.getStore(evaluatedLocator as StoreLocator);
    }

    const locator = this._staticStoreLocator;
    if (locator == null) {
      return this._storeManager.getStore();
    }
    if (isStoreInstance(locator)) {
      return locator;
    }
    return this._storeManager.getStore(locator);
  }

  /** @internal */
  private _unsub() {
    if (typeof this._sub === 'function') {
      this._sub();
    } else if (this._sub !== void 0) {
      (this._sub as IDisposable).dispose?.();
      (this._sub as Unsubscribable).unsubscribe?.();
    }
    this._sub = void 0;
  }
}

function isSubscribable(v: unknown): v is SubscribableValue {
  return v instanceof Object && 'subscribe' in (v as SubscribableValue);
}

type SubscribableValue = {
  subscribe(cb: (res: unknown) => void): IDisposable | Unsubscribable | (() => void);
};

type Unsubscribable = {
  unsubscribe(): void;
};
