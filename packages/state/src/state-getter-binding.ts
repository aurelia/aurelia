import { IDisposable, IIndexable, type Writable } from '@aurelia/kernel';
import type { IsAssign, IsBindingBehavior } from '@aurelia/expression-parser';
import {
  connectable,
  IObserverLocatorBasedConnectable,
  Scope,
  type IOverrideContext,
  astEvaluate,
} from '@aurelia/runtime';
import { IBinding } from '@aurelia/runtime-html';
import {
  type IStore,
  type Unsubscribable,
  type IStoreSubscriber,
  type StoreLocator,
  IStoreManager,
} from './interfaces';
import { createStateBindingScope, isSubscribable } from './state-utilities';
import { isStoreInstance } from './store-manager';

/**
 * A binding that handles the connection of the global state to a property of a target object
 */
export interface StateGetterBinding extends IObserverLocatorBasedConnectable { }
export class StateGetterBinding implements IBinding, IStoreSubscriber<object> {
  public isBound: boolean = false;

  /** @internal */
  private _scope?: Scope | undefined;

  private readonly $get: (s: unknown) => unknown;
  private readonly target: IIndexable;
  private readonly key: PropertyKey;

  /** @internal */ private readonly _storeManager: IStoreManager;
  /** @internal */ private readonly _staticStoreLocator?: StoreLocator;
  /** @internal */ private readonly _storeLocatorExpression?: IsAssign;
  /** @internal */ private _store?: IStore<object>;
  /** @internal */ private _value: unknown = void 0;
  /** @internal */ private _sub?: IDisposable | Unsubscribable | (() => void) = void 0;
  /** @internal */ private _updateCount = 0;

  public constructor(
    target: object,
    prop: PropertyKey,
    storeManager: IStoreManager,
    storeLocator: StoreLocator | IsAssign | undefined,
    getValue: (s: unknown) => unknown,
  ) {
    this._storeManager = storeManager;
    this.$get = getValue;
    this.target = target as IIndexable;
    this.key = prop;
    if (storeLocator != null && typeof storeLocator === 'object' && '$kind' in storeLocator) {
      this._storeLocatorExpression = storeLocator as IsAssign;
    } else if (storeLocator != null) {
      this._staticStoreLocator = storeLocator as StoreLocator;
    }
  }

  private updateTarget(value: unknown) {
    const target = this.target;
    const prop = this.key;
    const updateCount = this._updateCount++;
    const isCurrentValue = () => updateCount === this._updateCount - 1;
    this._unsub();

    if (isSubscribable(value)) {
      this._sub = value.subscribe($value => {
        if (isCurrentValue()) {
          target[prop] = $value;
        }
      });
      return;
    }

    if (value instanceof Promise) {
      void value.then($value => {
        if (isCurrentValue()) {
            target[prop] = $value;
        }
      }, () => {/* todo: don't ignore */});
      return;
    }

    target[prop] = value;
  }

  public bind(_scope: Scope): void {
    if (this.isBound) {
      return;
    }
    const store = this._store = this._resolveStore(_scope);
    const state = store.getState();
    this._scope = createStateBindingScope(state, _scope);
    store.subscribe(this);
    this.updateTarget(this._value = this.$get(state));
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
    if (store != null) {
      store.unsubscribe(this);
      this._store = void 0;
    }
  }

  public handleStateChange(state: object): void {
    const _scope = this._scope!;
    const overrideContext = _scope.overrideContext as Writable<IOverrideContext>;
    _scope.bindingContext = overrideContext.bindingContext = state;
    const store = this._store ?? this._resolveStore(_scope);
    const value = this.$get(store.getState());

    if (value === this._value) {
      return;
    }
    this._value = value;
    this.updateTarget(value);
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

  /** @internal */
  private _resolveStore(scope: Scope): IStore<object> {
    if (this._storeLocatorExpression != null) {
      const evaluatedLocator = astEvaluate(this._storeLocatorExpression, scope, null, null);
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
}
connectable(StateGetterBinding, null!);
