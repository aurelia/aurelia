
import { IDisposable, IIndexable, type Writable } from '@aurelia/kernel';
import {
  connectable,
  Scope,
  type IConnectableBinding,
  type IOverrideContext,
} from '@aurelia/runtime';
import {
  IStore,
  type Unsubscribable,
  type IStoreSubscriber
} from './interfaces';
import { createStateBindingScope, isSubscribable } from './state-utilities';

/**
 * A binding that handles the connection of the global state to a property of a target object
 */
export interface StateGetterBinding extends IConnectableBinding { }
@connectable()
export class StateGetterBinding implements IConnectableBinding, IStoreSubscriber<object> {
  public scope?: Scope | undefined;
  public isBound: boolean = false;
  private readonly $get: (s: unknown) => unknown;
  private readonly target: IIndexable;
  private readonly key: PropertyKey;

  /** @internal */ private readonly _store: IStore<object>;
  /** @internal */ private _value: unknown = void 0;
  /** @internal */ private _sub?: IDisposable | Unsubscribable | (() => void) = void 0;
  /** @internal */ private _updateCount = 0;

  public constructor(
    target: object,
    prop: PropertyKey,
    store: IStore<object>,
    getValue: (s: unknown) => unknown,
  ) {
    this._store = store;
    this.$get = getValue;
    this.target = target as IIndexable;
    this.key = prop;
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

  public $bind(scope: Scope): void {
    if (this.isBound) {
      return;
    }
    const state = this._store.getState();
    this.scope = createStateBindingScope(state, scope);
    this._store.subscribe(this);
    this.updateTarget(this._value = this.$get(state));
    this.isBound = true;
  }

  public $unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    this._unsub();
    // also disregard incoming future value of promise resolution if any
    this._updateCount++;
    this.scope = void 0;
    this._store.unsubscribe(this);
  }

  public handleStateChange(state: object): void {
    const scope = this.scope!;
    const overrideContext = scope.overrideContext as Writable<IOverrideContext>;
    scope.bindingContext = overrideContext.bindingContext = overrideContext.$state = state;
    const value = this.$get(this._store.getState());

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
}
