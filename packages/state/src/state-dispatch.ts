
import { type IServiceLocator } from '@aurelia/kernel';
import {
  connectable, LifecycleFlags,
  Scope, type IConnectableBinding,
  type IsBindingBehavior
} from '@aurelia/runtime';
import {
  type IStateContainer
} from './interfaces';

/**
 * A binding that handles the connection of the global state to a property of a target object
 */
export interface StateDispatchActionBinding extends IConnectableBinding { }
@connectable()
export class StateDispatchActionBinding implements IConnectableBinding {
  public interceptor: this = this;
  public locator: IServiceLocator;
  public $scope?: Scope | undefined;
  public isBound: boolean = false;
  public expr: IsBindingBehavior;
  private readonly target: HTMLElement;
  private readonly prop: string;

  /** @internal */ private readonly _stateContainer: IStateContainer<object>;

  public constructor(
    locator: IServiceLocator,
    stateContainer: IStateContainer<object>,
    expr: IsBindingBehavior,
    target: HTMLElement,
    prop: string,
  ) {
    this.locator = locator;
    this._stateContainer = stateContainer;
    this.expr = expr;
    this.target = target;
    this.prop = prop;
  }

  public callSource(e: Event) {
    const $scope = this.$scope!;
    $scope.overrideContext.$event = e;
    const value = this.expr.evaluate(LifecycleFlags.isStrictBindingStrategy, $scope, this.locator, null);
    delete $scope.overrideContext.$event;
    void this._stateContainer.dispatch('event', { target: this.target, event: this.prop, value });
  }

  public handleEvent(e: Event) {
    this.interceptor.callSource(e);
  }

  public $bind(flags: LifecycleFlags, scope: Scope): void {
    if (this.isBound) {
      return;
    }
    this.isBound = true;
    const state = this._stateContainer.getState();
    const overrideContext = { bindingContext: state, $state: state, $store: this._stateContainer };
    (this.$scope = Scope.fromOverride(overrideContext)).parentScope = scope;
    this.target.addEventListener(this.prop, this);
  }

  public $unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    this.$scope = void 0;
    this.target.removeEventListener(this.prop, this);
  }
}
