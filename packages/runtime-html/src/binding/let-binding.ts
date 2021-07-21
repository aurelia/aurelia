import { connectable, LifecycleFlags } from '@aurelia/runtime';

import type { ITask } from '@aurelia/platform';
import type { IIndexable, IServiceLocator } from '@aurelia/kernel';
import type {
  IConnectableBinding,
  IObservable,
  IObserverLocator,
  IObserverLocatorBasedConnectable,
  IsExpression,
  Scope,
} from '@aurelia/runtime';

export interface LetBinding extends IConnectableBinding {}

export class LetBinding implements IObserverLocatorBasedConnectable {
  public interceptor: this = this;

  public isBound: boolean = false;
  public $scope?: Scope = void 0;
  public task: ITask | null = null;

  public target: (IObservable & IIndexable) | null = null;
  /**
   * A semi-private property used by connectable mixin
   *
   * @internal
   */
  public readonly oL: IObserverLocator;

  public constructor(
    public sourceExpression: IsExpression,
    public targetProperty: string,
    observerLocator: IObserverLocator,
    public locator: IServiceLocator,
    private readonly toBindingContext: boolean = false,
  ) {
    this.oL = observerLocator;
  }

  public handleChange(newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    const target = this.target as IIndexable;
    const targetProperty = this.targetProperty as string;
    const previousValue: unknown = target[targetProperty];
    this.obs.version++;
    newValue = this.sourceExpression.evaluate(flags, this.$scope!, this.locator, this.interceptor);
    this.obs.clear(false);
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
    this.target = (this.toBindingContext ? scope.bindingContext : scope.overrideContext) as IIndexable;

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.hasBind) {
      sourceExpression.bind(flags, scope, this.interceptor);
    }
    // sourceExpression might have been changed during bind
    this.target[this.targetProperty]
      = this.sourceExpression.evaluate(flags | LifecycleFlags.fromBind, scope, this.locator, this.interceptor);

    // add isBound flag and remove isBinding flag
    this.isBound = true;
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.hasUnbind) {
      sourceExpression.unbind(flags, this.$scope!, this.interceptor);
    }
    this.$scope = void 0;
    this.obs.clear(true);

    // remove isBound and isUnbinding flags
    this.isBound = false;
  }
}

connectable(LetBinding);
