import { IndexMap, LifecycleFlags } from '@aurelia/runtime';
import { connectableBinding } from './binding-utils';

import type { ITask } from '@aurelia/platform';
import type { IIndexable, IServiceLocator } from '@aurelia/kernel';
import type {
  IObservable,
  IObserverLocator,
  IsExpression,
  Scope,
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

  public handleChange(newValue: unknown, _previousValue: unknown, _flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    const target = this.target as IIndexable;
    const targetProperty = this.targetProperty;
    const previousValue: unknown = target[targetProperty];
    this.obs.version++;
    newValue = this.ast.evaluate(this.$scope!, this, this.interceptor);
    this.obs.clear();
    if (newValue !== previousValue) {
      target[targetProperty] = newValue;
    }
  }

  public handleCollectionChange(_indexMap: IndexMap, _flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    const target = this.target as IIndexable;
    const targetProperty = this.targetProperty;
    const previousValue: unknown = target[targetProperty];
    this.obs.version++;
    const newValue = this.ast.evaluate(this.$scope!, this, this.interceptor);
    this.obs.clear();
    if (newValue !== previousValue) {
      target[targetProperty] = newValue;
    }
  }

  public $bind(flags: LifecycleFlags, scope: Scope): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind(flags | LifecycleFlags.fromBind);
    }

    this.$scope = scope;
    this.target = (this._toBindingContext ? scope.bindingContext : scope.overrideContext) as IIndexable;

    const ast = this.ast;
    if (ast.hasBind) {
      ast.bind(flags, scope, this.interceptor);
    }
    // ast might have been changed during bind
    this.target[this.targetProperty]
      = this.ast.evaluate(scope, this, this.interceptor);

    // add isBound flag and remove isBinding flag
    this.isBound = true;
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    const ast = this.ast;
    if (ast.hasUnbind) {
      ast.unbind(flags, this.$scope!, this.interceptor);
    }
    this.$scope = void 0;
    this.obs.clearAll();

    // remove isBound and isUnbinding flags
    this.isBound = false;
  }
}

connectableBinding(true, true)(LetBinding);
