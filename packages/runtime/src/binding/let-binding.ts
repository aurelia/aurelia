import { IServiceLocator, Reporter } from '../../kernel';
import { IBindScope, ILifecycle, State } from '../lifecycle';
import { IScope, LifecycleFlags } from '../observation';
import { IExpression, StrictAny } from './ast';
import { IBindingTarget } from './binding';
import { connectable, IConnectableBinding, IPartialConnectableBinding } from './connectable';
import { IObserverLocator } from './observer-locator';

export interface LetBinding extends IConnectableBinding {}

@connectable()
export class LetBinding implements IPartialConnectableBinding {
  public $nextBind: IBindScope = null;
  public $prevBind: IBindScope = null;

  public $state: State = State.none;
  public $scope: IScope = null;
  public $lifecycle: ILifecycle;

  public target: IBindingTarget = null;

  constructor(
    public sourceExpression: IExpression,
    public targetProperty: string,
    public observerLocator: IObserverLocator,
    public locator: IServiceLocator,
    private toViewModel: boolean = false) {
    this.$lifecycle = locator.get(ILifecycle);
  }

  public handleChange(newValue: StrictAny, previousValue: StrictAny, flags: LifecycleFlags): void {
    if (!(this.$state & State.isBound)) {
      return;
    }

    if (flags & LifecycleFlags.updateTargetInstance) {
      const { target, targetProperty } = this;
      previousValue = target[targetProperty];
      newValue = this.sourceExpression.evaluate(flags, this.$scope, this.locator);
      if (newValue !== previousValue) {
        target[targetProperty] = newValue;
      }
      return;
    }

    throw Reporter.error(15, flags);
  }

  public $bind(flags: LifecycleFlags, scope: IScope): void {
    if (this.$state & State.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.$unbind(flags | LifecycleFlags.fromBind);
    }
    // add isBinding flag
    this.$state |= State.isBinding;

    this.$scope = scope;
    this.target = this.toViewModel ? scope.bindingContext : scope.overrideContext;

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.bind) {
      sourceExpression.bind(flags, scope, this);
    }
    // sourceExpression might have been changed during bind
    this.target[this.targetProperty] = this.sourceExpression.evaluate(LifecycleFlags.fromBind, scope, this.locator);
    this.sourceExpression.connect(flags, scope, this);

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
      sourceExpression.unbind(flags, this.$scope, this);
    }
    this.$scope = null;
    this.unobserve(true);

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);
  }
}
