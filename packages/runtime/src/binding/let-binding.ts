import {
  IIndexable,
  IServiceLocator,
  Reporter,
} from '@aurelia/kernel';
import { IExpression } from '../ast';
import {
  LifecycleFlags,
  State,
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
  public $state: State = State.none;
  public $lifecycle: ILifecycle;
  public $scope?: IScope = void 0;
  public part?: string;

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
    if (!(this.$state & State.isBound)) {
      return;
    }

    if (flags & LifecycleFlags.updateTargetInstance) {
      const { target, targetProperty } = this as {target: IIndexable; targetProperty: string};
      const previousValue: unknown = target[targetProperty];
      const newValue: unknown = this.sourceExpression.evaluate(flags, this.$scope!, this.locator, this.part);
      if (newValue !== previousValue) {
        target[targetProperty] = newValue;
      }
      return;
    }

    throw Reporter.error(15, flags);
  }

  public $bind(flags: LifecycleFlags, scope: IScope, part?: string): void {
    if (this.$state & State.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind(flags | LifecycleFlags.fromBind);
    }
    // add isBinding flag
    this.$state |= State.isBinding;

    this.$scope = scope;
    this.part = part;
    this.target = (this.toBindingContext ? scope.bindingContext : scope.overrideContext) as IIndexable;

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.bind) {
      sourceExpression.bind(flags, scope, this.interceptor);
    }
    // sourceExpression might have been changed during bind
    this.target[this.targetProperty] = this.sourceExpression.evaluate(flags | LifecycleFlags.fromBind, scope, this.locator, part);
    this.sourceExpression.connect(flags, scope, this.interceptor, part);

    // add isBound flag and remove isBinding flag
    this.$state |= State.isBound;
    this.$state &= ~State.isBinding;
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!(this.$state & State.isBound)) {
      return;
    }
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.unbind) {
      sourceExpression.unbind(flags, this.$scope!, this.interceptor);
    }
    this.$scope = void 0;
    this.interceptor.unobserve(true);

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);
  }
}
