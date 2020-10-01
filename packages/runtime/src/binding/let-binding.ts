import {
  IIndexable,
  IServiceLocator,
  Reporter,
} from '@aurelia/kernel';
import { IExpression } from '../ast';
import {
  LifecycleFlags,
} from '../flags';
import {
  ILifecycle,
} from '../lifecycle';
import {
  IObservable,
  IScope,
} from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import {
  connectable,
  IConnectableBinding,
  IPartialConnectableBinding,
} from './connectable';

export interface LetBinding extends IConnectableBinding {}

@connectable()
export class LetBinding implements IPartialConnectableBinding {
  public interceptor: this = this;

  public id!: number;
  public isBound: boolean = false;
  public $lifecycle: ILifecycle;
  public $scope?: IScope = void 0;
  public $hostScope: IScope | null = null;

  public target: (IObservable & IIndexable) | null = null;

  public constructor(
    public sourceExpression: IExpression,
    public targetProperty: string,
    public observerLocator: IObserverLocator,
    public locator: IServiceLocator,
    private readonly toBindingContext: boolean = false,
  ) {
    connectable.assignIdTo(this);
    this.$lifecycle = locator.get(ILifecycle);
  }

  public handleChange(_newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    if (flags & LifecycleFlags.updateTargetInstance) {
      const { target, targetProperty } = this as {target: IIndexable; targetProperty: string};
      const previousValue: unknown = target[targetProperty];
      const newValue: unknown = this.sourceExpression.evaluate(flags, this.$scope!, this.$hostScope, this.locator);
      if (newValue !== previousValue) {
        target[targetProperty] = newValue;
      }
      return;
    }

    throw Reporter.error(15, flags);
  }

  public $bind(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null): void {
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
    if (sourceExpression.bind) {
      sourceExpression.bind(flags, scope, hostScope, this.interceptor);
    }
    // sourceExpression might have been changed during bind
    this.target[this.targetProperty] = this.sourceExpression.evaluate(flags | LifecycleFlags.fromBind, scope, hostScope, this.locator);
    this.sourceExpression.connect(flags, scope, hostScope, this.interceptor);

    // add isBound flag and remove isBinding flag
    this.isBound = true;
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.unbind) {
      sourceExpression.unbind(flags, this.$scope!, this.$hostScope, this.interceptor);
    }
    this.$scope = void 0;
    this.interceptor.unobserve(true);

    // remove isBound and isUnbinding flags
    this.isBound = false;
  }

  public dispose(): void {
    this.interceptor = (void 0)!;
    this.sourceExpression = (void 0)!;
    this.locator = (void 0)!;
    this.target = (void 0)!;
  }
}
