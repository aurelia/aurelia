
import { type Writable, type IServiceLocator } from '@aurelia/kernel';
import type { IsAssign, IsBindingBehavior } from '@aurelia/expression-parser';
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
  type IStore,
  type StoreLocator,
  IStoreRegistry,
} from './interfaces';
import { createStateBindingScope, isStoreInstance } from './state-utilities';

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

  /** @internal */ private readonly _storeRegistry: IStoreRegistry;
  /** @internal */ private readonly _staticStoreLocator?: StoreLocator;
  /** @internal */ private readonly _storeLocatorExpression?: IsAssign;
  /** @internal */ private _store?: IStore<object>;

  public constructor(
    locator: IServiceLocator,
    expr: IsBindingBehavior,
    target: HTMLElement,
    prop: string,
    storeRegistry: IStoreRegistry,
    storeLocator: StoreLocator | IsAssign | undefined,
    strict: boolean,
  ) {
    this.l = locator;
    this._storeRegistry = storeRegistry;
    this.ast = expr;
    this._target = target;
    this._targetProperty = prop;
    this.strict = strict;
    if (storeLocator != null && typeof storeLocator === 'object' && '$kind' in storeLocator) {
      this._storeLocatorExpression = storeLocator as IsAssign;
    } else if (storeLocator != null) {
      this._staticStoreLocator = storeLocator as StoreLocator;
    }
  }

  public callSource(e: Event) {
    const scope = this._scope!;
    scope.overrideContext.$event = e;
    const value = astEvaluate(this.ast, scope, this, null);
    delete scope.overrideContext.$event;
    void this._store!.dispatch(value);
  }

  public handleEvent(e: Event) {
    this.callSource(e);
  }

  public bind(_scope: Scope): void {
    if (this.isBound) {
      return;
    }
    astBind(this.ast, _scope, this);
    const store = this._store = this._resolveStore(_scope);
    this._scope = createStateBindingScope(store.getState(), _scope);
    this._target.addEventListener(this._targetProperty, this);
    store.subscribe(this);
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
    const store = this._store;
    if (store != null) {
      store.unsubscribe(this);
      this._store = void 0;
    }
  }

  public handleStateChange(state: object): void {
    const scope = this._scope!;
    const overrideContext = scope.overrideContext as Writable<IOverrideContext>;
    scope.bindingContext = overrideContext.bindingContext = state;
  }

  /** @internal */
  private _resolveStore(scope: Scope): IStore<object> {
    if (this._storeLocatorExpression != null) {
      const evaluatedLocator = astEvaluate(this._storeLocatorExpression, scope, this, null);
      if (isStoreInstance(evaluatedLocator)) {
        return evaluatedLocator;
      }
      return this._storeRegistry.getStore(evaluatedLocator as StoreLocator);
    }

    const locator = this._staticStoreLocator;
    if (locator == null) {
      return this._storeRegistry.getStore();
    }
    if (isStoreInstance(locator)) {
      return locator;
    }
    return this._storeRegistry.getStore(locator);
  }
}
