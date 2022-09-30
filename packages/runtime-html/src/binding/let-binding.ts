import { astBind, astEvaluate, astUnbind, connectable } from '@aurelia/runtime';
import { implementAstEvaluator, mixinBindingUseScope, mixingBindingLimited } from './binding-utils';

import type { IIndexable, IServiceLocator } from '@aurelia/kernel';
import type { ITask } from '@aurelia/platform';
import type {
  IObservable,
  IObserverLocator,
  IsExpression,
  Scope
} from '@aurelia/runtime';
import type { IAstBasedBinding } from './interfaces-bindings';
export interface LetBinding extends IAstBasedBinding {}

export class LetBinding implements IAstBasedBinding {
  public interceptor: this = this;

  public isBound: boolean = false;
  public $scope?: Scope = void 0;
  public task: ITask | null = null;

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
  private _value: unknown;

  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  public constructor(
    public locator: IServiceLocator,
    observerLocator: IObserverLocator,
    public ast: IsExpression,
    public targetProperty: string,
    toBindingContext: boolean = false,
  ) {
    this.oL = observerLocator;
    this._toBindingContext = toBindingContext;
  }

  public updateTarget() {
    (this.target as IIndexable)[this.targetProperty] = this._value;
  }

  public handleChange(): void {
    if (!this.isBound) {
      return;
    }
    this.obs.version++;
    if ((nV = astEvaluate(this.ast, this.$scope!, this, this.interceptor)) !== this._value) {
      this._value = nV;
    }
    this.obs.clear();
    this.updateTarget();
  }

  public handleCollectionChange(): void {
    this.handleChange();
  }

  public $bind(scope: Scope): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind();
    }
    this.$scope = scope;
    this.target = (this._toBindingContext ? scope.bindingContext : scope.overrideContext) as IIndexable;

    astBind(this.ast, scope, this.interceptor);

    this.target[this.targetProperty]
      = astEvaluate(this.ast, this.$scope, this, this.interceptor);

    this.isBound = true;
  }

  public $unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;

    astUnbind(this.ast, this.$scope!, this.interceptor);

    this.$scope = void 0;
    this.obs.clearAll();
  }
}

mixinBindingUseScope(LetBinding);
mixingBindingLimited(LetBinding, () => 'updateTarget');
connectable(LetBinding);
implementAstEvaluator(true)(LetBinding);

let nV: unknown;
