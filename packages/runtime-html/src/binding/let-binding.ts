import { connectable, LifecycleFlags } from '@aurelia/runtime';

import type { ITask } from '@aurelia/platform';
import type { IIndexable, IServiceLocator } from '@aurelia/kernel';
import type {
  IConnectableBinding,
  IObservable,
  IObserverLocator,
  IPartialConnectableBinding,
  IsExpression,
  Scope,
} from '@aurelia/runtime';

export interface LetBinding extends IConnectableBinding {}

export class LetBinding implements IPartialConnectableBinding {
  public interceptor: this = this;

  public id!: number;
  public isBound: boolean = false;
  public $scope?: Scope = void 0;
  public $hostScope: Scope | null = null;

  public task: ITask | null = null;

  public target: (IObservable & IIndexable) | null = null;

  public constructor(
    public sourceExpression: IsExpression,
    public targetProperty: string,
    public observerLocator: IObserverLocator,
    public locator: IServiceLocator,
    private readonly toBindingContext: boolean = false,
  ) {
    connectable.assignIdTo(this);
  }

  public handleChange(_newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    if (flags & LifecycleFlags.updateTarget) {
      const target = this.target as IIndexable;
      const targetProperty = this.targetProperty as string;
      const previousValue: unknown = target[targetProperty];
      this.obs.version++;
      const newValue: unknown = this.sourceExpression.evaluate(flags, this.$scope!, this.$hostScope, this.locator, this.interceptor);
      this.obs.clear(false);
      if (newValue !== previousValue) {
        target[targetProperty] = newValue;
      }
      return;
    }

    throw new Error('Unexpected handleChange context in LetBinding');
  }

  public $bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind(flags | LifecycleFlags.fromBind);
    }

    this.$scope = scope;
    this.$hostScope = hostScope;
    this.target = (this.toBindingContext ? (hostScope ?? scope).bindingContext : (hostScope ?? scope).overrideContext) as IIndexable;

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.hasBind) {
      sourceExpression.bind(flags, scope, hostScope, this.interceptor);
    }
    // sourceExpression might have been changed during bind
    this.target[this.targetProperty]
      = this.sourceExpression.evaluate(flags | LifecycleFlags.fromBind, scope, hostScope, this.locator, this.interceptor);

    // add isBound flag and remove isBinding flag
    this.isBound = true;
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.hasUnbind) {
      sourceExpression.unbind(flags, this.$scope!, this.$hostScope, this.interceptor);
    }
    this.$scope = void 0;
    this.$hostScope = null;
    this.obs.clear(true);

    // remove isBound and isUnbinding flags
    this.isBound = false;
  }
}

connectable(LetBinding);
