
import { type Writable, type IServiceLocator } from '@aurelia/kernel';
import {
  type IOverrideContext,
  LifecycleFlags,
  Scope,
  type IsBindingBehavior
} from '@aurelia/runtime';
import { connectableBinding, type IAstBasedBinding } from '@aurelia/runtime-html';
import {
  IAction,
  type IStore
} from './interfaces';
import { createStateBindingScope } from './state-utilities';

/**
 * A binding that handles the connection of the global state to a property of a target object
 */
export interface StateDispatchBinding extends IAstBasedBinding { }
export class StateDispatchBinding implements IAstBasedBinding {
  public interceptor: this = this;
  public locator: IServiceLocator;
  public $scope?: Scope | undefined;
  public isBound: boolean = false;
  public ast: IsBindingBehavior;
  private readonly target: HTMLElement;
  private readonly targetProperty: string;

  /** @internal */ private readonly _store: IStore<object>;

  public constructor(
    locator: IServiceLocator,
    expr: IsBindingBehavior,
    target: HTMLElement,
    prop: string,
    store: IStore<object>,
  ) {
    this.locator = locator;
    this._store = store;
    this.ast = expr;
    this.target = target;
    this.targetProperty = prop;
  }

  public callSource(e: Event) {
    const $scope = this.$scope!;
    $scope.overrideContext.$event = e;
    const value = this.ast.evaluate($scope, this, null);
    delete $scope.overrideContext.$event;
    if (!this.isAction(value)) {
      throw new Error(`Invalid dispatch value from expression on ${this.target} on event: "${e.type}"`);
    }
    void this._store.dispatch(value.type, ...(value.params instanceof Array ? value.params : []));
  }

  public handleEvent(e: Event) {
    this.interceptor.callSource(e);
  }

  public $bind(flags: LifecycleFlags, scope: Scope): void {
    if (this.isBound) {
      return;
    }
    this.isBound = true;
    this.$scope = createStateBindingScope(this._store.getState(), scope);
    this.target.addEventListener(this.targetProperty, this);
    this._store.subscribe(this);
  }

  public $unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    this.$scope = void 0;
    this.target.removeEventListener(this.targetProperty, this);
    this._store.unsubscribe(this);
  }

  public handleStateChange(state: object): void {
    const $scope = this.$scope!;
    const overrideContext = $scope.overrideContext as Writable<IOverrideContext>;
    $scope.bindingContext = overrideContext.bindingContext = state;
  }

  /** @internal */
  private isAction(value: unknown): value is IAction {
    return value != null
      && typeof value === 'object'
      && 'type' in value;
  }
}

connectableBinding(true, true)(StateDispatchBinding);
