
import { type Writable, type IServiceLocator } from '@aurelia/kernel';
import {
  connectable,
  type IOverrideContext,
  LifecycleFlags,
  Scope,
  type IConnectableBinding,
  type IsBindingBehavior
} from '@aurelia/runtime';
import {
  IReducerAction,
  type IStore
} from './interfaces';
import { createStateBindingScope } from './state-utilities';

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

  /** @internal */ private readonly _stateContainer: IStore<object>;

  public constructor(
    locator: IServiceLocator,
    stateContainer: IStore<object>,
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
    if (!this.isDispatchable(value)) {
      throw new Error(`Invalid dispatch value from expression on ${this.target} on event: "${e.type}"`);
    }
    void this._stateContainer.dispatch(value.action, value.params instanceof Array ? value.params : []);
  }

  public handleEvent(e: Event) {
    this.interceptor.callSource(e);
  }

  public $bind(flags: LifecycleFlags, scope: Scope): void {
    if (this.isBound) {
      return;
    }
    this.isBound = true;
    this.$scope = createStateBindingScope(this._stateContainer.getState(), scope);
    this.target.addEventListener(this.prop, this);
    this._stateContainer.subscribe(this);
  }

  public $unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    this.$scope = void 0;
    this.target.removeEventListener(this.prop, this);
    this._stateContainer.unsubscribe(this);
  }

  public handleStateChange(state: object): void {
    const $scope = this.$scope!;
    const overrideContext = $scope.overrideContext as Writable<IOverrideContext>;
    $scope.bindingContext = overrideContext.bindingContext = state;
  }

  public isDispatchable(value: unknown): value is Dispatchable {
    return value != null
      && typeof value === 'object'
      && typeof (value as Dispatchable).action === 'string';
  }
}

export type Dispatchable = { action: string | IReducerAction; params?: unknown[] };
