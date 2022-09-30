
import { type Writable, type IServiceLocator } from '@aurelia/kernel';
import {
  type IOverrideContext,
  Scope,
  type IsBindingBehavior,
  connectable,
  astEvaluate,
  astBind,
  astUnbind
} from '@aurelia/runtime';
import { implementAstEvaluator, mixingBindingLimited, type IAstBasedBinding } from '@aurelia/runtime-html';
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
  public locator: IServiceLocator;
  public scope?: Scope | undefined;
  public isBound: boolean = false;
  public ast: IsBindingBehavior;
  private readonly target: HTMLElement;
  private readonly targetProperty: string;

  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;
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
    const scope = this.scope!;
    scope.overrideContext.$event = e;
    const value = astEvaluate(this.ast, scope, this, null);
    delete scope.overrideContext.$event;
    if (!this.isAction(value)) {
      throw new Error(`Invalid dispatch value from expression on ${this.target} on event: "${e.type}"`);
    }
    void this._store.dispatch(value.type, ...(value.params instanceof Array ? value.params : []));
  }

  public handleEvent(e: Event) {
    this.callSource(e);
  }

  public $bind(scope: Scope): void {
    if (this.isBound) {
      return;
    }
    astBind(this.ast, scope, this);
    this.scope = createStateBindingScope(this._store.getState(), scope);
    this.target.addEventListener(this.targetProperty, this);
    this._store.subscribe(this);
    this.isBound = true;
  }

  public $unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;

    astUnbind(this.ast, this.scope!, this);
    this.scope = void 0;
    this.target.removeEventListener(this.targetProperty, this);
    this._store.unsubscribe(this);
  }

  public handleStateChange(state: object): void {
    const scope = this.scope!;
    const overrideContext = scope.overrideContext as Writable<IOverrideContext>;
    scope.bindingContext = overrideContext.bindingContext = state;
  }

  /** @internal */
  private isAction(value: unknown): value is IAction {
    return value != null
      && typeof value === 'object'
      && 'type' in value;
  }
}

connectable(StateDispatchBinding);
implementAstEvaluator(true)(StateDispatchBinding);
mixingBindingLimited(StateDispatchBinding, () => 'callSource');
