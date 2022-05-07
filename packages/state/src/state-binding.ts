
import { type IServiceLocator } from '@aurelia/kernel';
import {
  connectable, LifecycleFlags,
  Scope,
  type IAccessor,
  type IConnectableBinding,
  type IObserverLocator,
  type IsBindingBehavior
} from '@aurelia/runtime';
import {
  IStateContainer,
  type IStateSubscriber,
} from './state';

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
  public expr: IsBindingBehavior;
  private readonly target: object;
  private readonly prop: PropertyKey;

  /** @internal */ private readonly _stateContainer: IStateContainer<object>;
  /** @internal */ private _targetAccessor!: IAccessor;
  /** @internal */ private _value: unknown = void 0;

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
    this.expr = expr;
    this.target = target;
    this.prop = prop;
  }

  public updateTarget(value: unknown) {
    this._targetAccessor.setValue(value, LifecycleFlags.none, this.target, this.prop);
  }

  public $bind(flags: LifecycleFlags, scope: Scope): void {
    if (this.isBound) {
      return;
    }
    this.isBound = true;
    this._targetAccessor = this._observerLocator.getAccessor(this.target, this.prop);
    this.$scope = Scope.fromParent(scope, this._stateContainer.getState());
    this._stateContainer.subscribe(this);
    this.updateTarget(this._value = this.expr.evaluate(LifecycleFlags.isStrictBindingStrategy, this.$scope, this.locator, null));
  }

  public $unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    this._stateContainer.unsubscribe(this);
  }

  public handleStateChange(state: object): void {
    this.$scope!.bindingContext = state;
    const value = this.expr.evaluate(LifecycleFlags.isStrictBindingStrategy, this.$scope!, this.locator, null);
    if (value !== this._value) {
      this._value = value;
      this.updateTarget(value);
    }
  }
}
