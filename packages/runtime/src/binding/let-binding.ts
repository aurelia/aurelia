import { IIndexable, IServiceLocator, Reporter } from '@aurelia/kernel';
import { IBindScope, ILifecycle, State } from '../lifecycle';
import { IScope, LifecycleFlags } from '../observation';
import { IExpression } from './ast';
import { IBindingTarget } from './binding';
import { connectable, IConnectableBinding, IPartialConnectableBinding } from './connectable';
import { IObserverLocator } from './observer-locator';

export interface LetBinding extends IConnectableBinding {}

@connectable()
export class LetBinding implements IPartialConnectableBinding {
  public $nextBind: IBindScope;
  public $prevBind: IBindScope;
  public $state: State;
  public $lifecycle: ILifecycle;
  public $scope: IScope;

  public locator: IServiceLocator;
  public observerLocator: IObserverLocator;
  public sourceExpression: IExpression;
  public target: IBindingTarget;
  public targetProperty: string;

  private toViewModel: boolean;

  constructor(sourceExpression: IExpression, targetProperty: string, observerLocator: IObserverLocator, locator: IServiceLocator, toViewModel: boolean = false) {
    this.$nextBind = null;
    this.$prevBind = null;
    this.$state = State.none;
    this.$lifecycle = locator.get(ILifecycle);
    this.$scope = null;

    this.locator = locator;
    this.observerLocator = observerLocator;
    this.sourceExpression = sourceExpression;
    this.target = null;
    this.targetProperty = targetProperty;

    this.toViewModel = toViewModel;
  }

  public handleChange(_newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void {
    if (!(this.$state & State.isBound)) {
      return;
    }

    if (flags & LifecycleFlags.updateTargetInstance) {
      const { target, targetProperty } = this as {target: IIndexable; targetProperty: string};
      const previousValue: unknown = target[targetProperty];
      const newValue: unknown = this.sourceExpression.evaluate(flags, this.$scope, this.locator);
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
    this.target = (this.toViewModel ? scope.bindingContext : scope.overrideContext) as IIndexable;

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
