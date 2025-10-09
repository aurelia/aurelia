
import { type Writable, type IServiceLocator } from '@aurelia/kernel';
import type { IsBindingBehavior } from '@aurelia/expression-parser';
import {
  connectable,
  type IObserverLocatorBasedConnectable,
  astEvaluate,
  astBind,
  astUnbind,
  type Scope,
  type IOverrideContext,
  type IAstEvaluator,
} from '@aurelia/runtime';
import {
  mixinAstEvaluator,
  mixingBindingLimited,
  type IBinding,
} from '@aurelia/runtime-html';
import {
  type IStoreSubscriber,
  type IStore
} from './interfaces';
import { createStateBindingScope } from './state-utilities';

/**
 * A binding that handles the connection of the global state to a property of a target object
 */
export interface StateDispatchBinding extends IAstEvaluator, IObserverLocatorBasedConnectable, IServiceLocator { }
export class StateDispatchBinding implements IBinding, IStoreSubscriber<object> {
  static {
    connectable(StateDispatchBinding, null!);
    mixinAstEvaluator(StateDispatchBinding);
    mixingBindingLimited(StateDispatchBinding, () => 'callSource');
  }

  public isBound: boolean = false;

  /** @internal */
  public readonly l: IServiceLocator;

  /** @internal */
  public _scope?: Scope | undefined;
  public ast: IsBindingBehavior;

  /** @internal */ private readonly _target: HTMLElement;
  /** @internal */ private readonly _targetProperty: string;

  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  public strict: boolean;

  /** @internal */ private _store: IStore<object>;
  /** @internal */ private _parentScope?: Scope;

  public constructor(
    locator: IServiceLocator,
    expr: IsBindingBehavior,
    target: HTMLElement,
    prop: string,
    store: IStore<object>,
    strict: boolean,
  ) {
    this.l = locator;
    this._store = store;
    this.ast = expr;
    this._target = target;
    this._targetProperty = prop;
    this.strict = strict;
  }

  public callSource(e: Event) {
    const scope = this._scope!;
    scope.overrideContext.$event = e;
    const value = astEvaluate(this.ast, scope, this, null);
    delete scope.overrideContext.$event;
    void this._store.dispatch(value);
  }

  public handleEvent(e: Event) {
    this.callSource(e);
  }

  public bind(_scope: Scope): void {
    if (this.isBound) {
      return;
    }
    astBind(this.ast, _scope, this);
    this._scope = createStateBindingScope(this._store.getState(), _scope);
    this._parentScope = _scope;
    this._target.addEventListener(this._targetProperty, this);
    this._store.subscribe(this);
    this.isBound = true;
  }

  public unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;

    astUnbind(this.ast, this._scope!, this);
    this._scope = void 0;
    this._target.removeEventListener(this._targetProperty, this);
    this._store.unsubscribe(this);
    this._parentScope = void 0;
  }

  public handleStateChange(state: object): void {
    const scope = this._scope!;
    const overrideContext = scope.overrideContext as Writable<IOverrideContext>;
    scope.bindingContext = overrideContext.bindingContext = state;
  }

  public useStore(store: IStore<object>): void {
    if (this._store === store) {
      return;
    }
    if (this.isBound) {
      this._store.unsubscribe(this);
      this._store = store;
      const parent = this._parentScope!;
      this._scope = createStateBindingScope(store.getState(), parent);
      this._store.subscribe(this);
      this.handleStateChange(store.getState());
      return;
    }
    this._store = store;
  }
}
