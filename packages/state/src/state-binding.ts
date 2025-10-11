
import { IDisposable, type IServiceLocator, type Writable } from '@aurelia/kernel';
import { IsBindingBehavior } from '@aurelia/expression-parser';
import {
  connectable,
  type IAccessor,
  type IObserverLocator,
  type IObserverLocatorBasedConnectable,
  ISubscriber,
  type IAstEvaluator,
  type Scope,
  astEvaluate,
  astBind,
  astUnbind,
  type IOverrideContext,
} from '@aurelia/runtime';
import {
  BindingMode,
  type IBindingController,
  mixinAstEvaluator,
  mixingBindingLimited,
  type IBinding,
} from '@aurelia/runtime-html';
import {
  IStore,
  type IStoreSubscriber
} from './interfaces';
import { createStateBindingScope } from './state-utilities';

/**
 * A binding that handles the connection of the global state to a property of a target object
 */
export interface StateBinding extends IAstEvaluator, IObserverLocatorBasedConnectable, IServiceLocator { }
export class StateBinding implements IBinding, ISubscriber, IStoreSubscriber<object> {
  static {
    connectable(StateBinding, null!);
    mixinAstEvaluator(StateBinding);
    mixingBindingLimited(StateBinding, () => 'updateTarget');
  }

  public isBound: boolean = false;

  /** @internal */
  public readonly oL: IObserverLocator;

  /** @internal */
  public l: IServiceLocator;

  /** @internal */
  public _scope?: Scope | undefined;

  public ast: IsBindingBehavior;
  private readonly target: object;
  private readonly targetProperty: PropertyKey;

  /** @internal */ private _store: IStore<object>;
  /** @internal */ private _targetObserver!: IAccessor;
  /** @internal */ private _value: unknown = void 0;
  /** @internal */ private _sub?: IDisposable | Unsubscribable | (() => void) = void 0;
  /** @internal */ private _updateCount = 0;
  /** @internal */ private readonly _controller: IBindingController;
  /** @internal */ private _parentScope?: Scope;

  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  public strict: boolean;

  public mode: BindingMode = BindingMode.toView;

  public constructor(
    controller: IBindingController,
    locator: IServiceLocator,
    observerLocator: IObserverLocator,
    ast: IsBindingBehavior,
    target: object,
    prop: PropertyKey,
    store: IStore<object>,
    strict: boolean,
  ) {
    this._controller = controller;
    this.l = locator;
    this._store = store;
    this.oL = observerLocator;
    this.ast = ast;
    this.target = target;
    this.targetProperty = prop;
    this.strict = strict;
  }

  public updateTarget(value: unknown) {
    const targetAccessor = this._targetObserver;

    const target = this.target;
    const prop = this.targetProperty;
    const updateCount = this._updateCount++;
    const isCurrentValue = () => updateCount === this._updateCount - 1;
    this._unsub();

    if (isSubscribable(value)) {
      this._sub = value.subscribe($value => {
        if (isCurrentValue()) {
          targetAccessor.setValue($value, target, prop);
        }
      });
      return;
    }

    if (value instanceof Promise) {
      void value.then($value => {
        if (isCurrentValue()) {
          targetAccessor.setValue($value, target, prop);
        }
      }, () => {/* todo: don't ignore */});
      return;
    }

    targetAccessor.setValue(value, target, prop);
  }

  public bind(_scope: Scope): void {
    if (this.isBound) {
      return;
    }
    this._targetObserver = this.oL.getAccessor(this.target, this.targetProperty);
    this._parentScope = _scope;
    const bindingScope = this._scope = createStateBindingScope(this._store.getState(), _scope);
    astBind(this.ast, bindingScope, this);
    this._store.subscribe(this);
    this.isBound = true;
    this.handleStateChange();
  }

  public unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    this._unsub();
    // also disregard incoming future value of promise resolution if any
    this._updateCount++;
    const bindingScope = this._scope;
    if (bindingScope != null) {
      astUnbind(this.ast, bindingScope, this);
    }
    this._scope = void 0;
    this._store.unsubscribe(this);
    this._parentScope = void 0;
  }

  public handleChange(newValue: unknown): void {
    if (!this.isBound) return;

    const obsRecord = this.obs;
    obsRecord.version++;
    newValue = astEvaluate(this.ast, this._scope!, this, this);
    obsRecord.clear();

    this.updateTarget(newValue);
  }

  public handleStateChange(): void {
    if (!this.isBound) return;

    const state = this._store.getState();
    const _scope = this._scope!;
    const overrideContext = _scope.overrideContext as Writable<IOverrideContext>;
    _scope.bindingContext = overrideContext.bindingContext = state;
    const value = astEvaluate(
      this.ast,
      _scope,
      this,
      this.mode > BindingMode.oneTime ? this : null
    );

    if (value === this._value) {
      return;
    }
    this._value = value;
    this.updateTarget(value);
  }

  public useStore(store: IStore<object>): void {
    if (this._store === store) {
      return;
    }
    if (this.isBound) {
      this._store.unsubscribe(this);
      this._store = store;
      const parent = this._parentScope!;
      const previousScope = this._scope!;
      astUnbind(this.ast, previousScope, this);
      const bindingScope = this._scope = createStateBindingScope(store.getState(), parent);
      astBind(this.ast, bindingScope, this);
      this._store.subscribe(this);
      this.handleStateChange();
      return;
    }
    this._store = store;
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
