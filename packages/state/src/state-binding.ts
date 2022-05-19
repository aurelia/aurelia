
import { IDisposable, type IServiceLocator, type Writable } from '@aurelia/kernel';
import {
  connectable, LifecycleFlags,
  Scope,
  type IAccessor,
  type IConnectableBinding,
  type IObserverLocator, type IOverrideContext, type IsBindingBehavior
} from '@aurelia/runtime';
import {
  IStateContainer,
  type IStateSubscriber
} from './interfaces';
import { createStateBindingScope } from './state-utilities';

/**
 * A binding that handles the connection of the global state to a property of a target object
 */
export interface StateBinding extends IConnectableBinding { }
@connectable()
export class StateBinding implements IConnectableBinding, IStateSubscriber<object> {
  /** @internal */ private readonly _observerLocator: IObserverLocator;
  public interceptor: this = this;
  public locator: IServiceLocator;
  public $scope?: Scope | undefined;
  public isBound: boolean = false;
  public sourceExpression: IsBindingBehavior;
  private readonly target: object;
  private readonly targetProperty: PropertyKey;

  /** @internal */ private readonly _stateContainer: IStateContainer<object>;
  /** @internal */ private _targetAccessor!: IAccessor;
  /** @internal */ private _value: unknown = void 0;
  /** @internal */ private _sub?: IDisposable | Unsubscribable | (() => void) = void 0;
  /** @internal */ private _updateCount = 0;

  public constructor(
    locator: IServiceLocator,
    stateContainer: IStateContainer<object>,
    observerLocator: IObserverLocator,
    expr: IsBindingBehavior,
    target: object,
    prop: PropertyKey,
  ) {
    this.locator = locator;
    this._stateContainer = stateContainer;
    this._observerLocator = observerLocator;
    this.sourceExpression = expr;
    this.target = target;
    this.targetProperty = prop;
  }

  public updateTarget(value: unknown) {
    const targetAccessor = this._targetAccessor;
    const target = this.target;
    const prop = this.targetProperty;
    const updateCount = this._updateCount++;
    const isCurrentValue = () => updateCount === this._updateCount - 1;
    this._unsub();

    if (isSubscribable(value)) {
      this._sub = value.subscribe($value => {
        if (isCurrentValue()) {
          targetAccessor.setValue($value, LifecycleFlags.none, target, prop);
        }
      });
      return;
    }

    if (value instanceof Promise) {
      void value.then($value => {
        if (isCurrentValue()) {
          targetAccessor.setValue($value, LifecycleFlags.none, target, prop);
        }
      }, () => {/* todo: don't ignore */});
      return;
    }

    targetAccessor.setValue(value, LifecycleFlags.none, target, prop);
  }

  public $bind(flags: LifecycleFlags, scope: Scope): void {
    if (this.isBound) {
      return;
    }
    this.isBound = true;
    this._targetAccessor = this._observerLocator.getAccessor(this.target, this.targetProperty);
    this.$scope = createStateBindingScope(this._stateContainer.getState(), scope);
    this._stateContainer.subscribe(this);
    this.updateTarget(this._value = this.sourceExpression.evaluate(LifecycleFlags.isStrictBindingStrategy, this.$scope, this.locator, null));
  }

  public $unbind(): void {
    if (!this.isBound) {
      return;
    }
    this._unsub();
    // also disregard incoming future value of promise resolution if any
    this._updateCount++;
    this.isBound = false;
    this.$scope = void 0;
    this._stateContainer.unsubscribe(this);
  }

  public handleStateChange(state: object): void {
    const $scope = this.$scope!;
    const overrideContext = $scope.overrideContext as Writable<IOverrideContext>;
    $scope.bindingContext = overrideContext.bindingContext = overrideContext.$state = state;
    const value = this.sourceExpression.evaluate(LifecycleFlags.isStrictBindingStrategy, $scope, this.locator, null);
    if (value !== this._value) {
      this._value = value;
      this.updateTarget(value);
    }
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
