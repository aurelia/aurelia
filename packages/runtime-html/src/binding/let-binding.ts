import {
  astBind,
  astEvaluate,
  astUnbind,
  connectable,
  type IAstEvaluator,
  type IBinding,
  type IConnectableBinding,
  type IObservable,
  type IObserverLocator,
  type IsExpression,
  type Scope
} from '@aurelia/runtime';
import { mixinAstEvaluator, mixinUseScope, mixingBindingLimited } from './binding-utils';

import type { IIndexable, IServiceLocator } from '@aurelia/kernel';
export interface LetBinding extends IAstEvaluator, IConnectableBinding {}

export class LetBinding implements IBinding {
  public isBound: boolean = false;

  /** @internal */
  public _scope?: Scope = void 0;

  public target: (IObservable & IIndexable) | null = null;
  /** @internal */
  private readonly _toBindingContext: boolean;

  /**
   * A semi-private property used by connectable mixin
   *
   * @internal
   */
  public readonly oL: IObserverLocator;

  /** @internal */
  public l: IServiceLocator;

  /** @internal */
  private _value: unknown;

  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  public constructor(
    locator: IServiceLocator,
    observerLocator: IObserverLocator,
    public ast: IsExpression,
    public targetProperty: string,
    toBindingContext: boolean = false,
  ) {
    this.l = locator;
    this.oL = observerLocator;
    this._toBindingContext = toBindingContext;
  }

  public updateTarget() {
    this.target![this.targetProperty] = this._value;
  }

  public handleChange(): void {
    if (!this.isBound) {
      return;
    }
    this.obs.version++;
    this._value = astEvaluate(this.ast, this._scope!, this, this);
    this.obs.clear();
    this.updateTarget();
  }

  public handleCollectionChange(): void {
    this.handleChange();
  }

  public bind(_scope: Scope): void {
    if (this.isBound) {
      if (this._scope === _scope) {
        return;
      }
      this.unbind();
    }
    this._scope = _scope;
    this.target = (this._toBindingContext ? _scope.bindingContext : _scope.overrideContext) as IIndexable;

    astBind(this.ast, _scope, this);

    this._value = astEvaluate(this.ast, this._scope, this, this);
    this.updateTarget();

    this.isBound = true;
  }

  public unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;

    astUnbind(this.ast, this._scope!, this);

    this._scope = void 0;
    this.obs.clearAll();
  }
}

mixinUseScope(LetBinding);
mixingBindingLimited(LetBinding, () => 'updateTarget');
connectable(LetBinding);
mixinAstEvaluator(true)(LetBinding);
