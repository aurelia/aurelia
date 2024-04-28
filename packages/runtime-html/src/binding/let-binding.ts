import {
  ICollectionSubscriber,
  IObserverLocatorBasedConnectable,
  ISubscriber,
  connectable,
  type IObservable,
  type IObserverLocator,
} from '@aurelia/runtime';
import { type Scope } from './scope';
import {
  astBind,
  astEvaluate,
  astUnbind,
  type IAstEvaluator,
} from '../ast.eval';
import { createPrototypeMixer, mixinAstEvaluator, mixinUseScope, mixingBindingLimited } from './binding-utils';

import type { IIndexable, IServiceLocator } from '@aurelia/kernel';
import { IsExpression } from '@aurelia/expression-parser';
import { IBinding } from './interfaces-bindings';
export interface LetBinding extends IAstEvaluator, IObserverLocatorBasedConnectable, IServiceLocator {}

export class LetBinding implements IBinding, ISubscriber, ICollectionSubscriber {
  /**
   * The renderer can call this method to prepare the prototype,
   * so that it can be effectively tree shaken before decorator can be officially applied with tree shaking.
   * @internal
   */
  public static mix = /*@__PURE__*/ createPrototypeMixer(() => {
    mixinUseScope(LetBinding);
    mixingBindingLimited(LetBinding, () => 'updateTarget');
    connectable(LetBinding, null!);
    mixinAstEvaluator(true)(LetBinding);
  });

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
      /* istanbul-ignore-next */
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
      /* istanbul-ignore-next */
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
      /* istanbul-ignore-next */
      return;
    }
    this.isBound = false;

    astUnbind(this.ast, this._scope!, this);

    this._scope = void 0;
    this.obs.clearAll();
  }
}
