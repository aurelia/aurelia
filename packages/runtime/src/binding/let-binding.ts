import { IServiceLocator, Reporter } from '@aurelia/kernel';
import { LifecycleState } from '../lifecycle-state';
import { IExpression } from './ast';
import { IBindingTarget } from './binding';
import { IScope } from './binding-context';
import { BindingFlags } from './binding-flags';
import { connectable, IConnectableBinding, IPartialConnectableBinding } from './connectable';
import { IBindScope } from './observation';
import { IObserverLocator } from './observer-locator';

// tslint:disable:no-any

export interface LetBinding extends IConnectableBinding {}

@connectable()
export class LetBinding implements IPartialConnectableBinding {
  public $nextBindable: IBindScope = null;
  public $prevBindable: IBindScope = null;

  public $state: LifecycleState = LifecycleState.none;

  public $scope: IScope = null;
  public target: IBindingTarget = null;

  constructor(
    public sourceExpression: IExpression,
    public targetProperty: string,
    public observerLocator: IObserverLocator,
    public locator: IServiceLocator,
    private toViewModel: boolean = false
  ) { }

  public handleChange(newValue: any, previousValue: any, flags: BindingFlags): void {
    if (!(this.$state & LifecycleState.isBound)) {
      return;
    }

    if (flags & BindingFlags.updateTargetInstance) {
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

  public $bind(flags: BindingFlags, scope: IScope): void {
    if (this.$state & LifecycleState.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.$unbind(flags | BindingFlags.fromBind);
    }
    // add isBinding flag
    this.$state |= LifecycleState.isBinding;

    this.$scope = scope;
    this.target = this.toViewModel ? scope.bindingContext : scope.overrideContext;

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.bind) {
      sourceExpression.bind(flags, scope, this);
    }
    // sourceExpression might have been changed during bind
    this.target[this.targetProperty] = this.sourceExpression.evaluate(BindingFlags.fromBind, scope, this.locator);
    this.sourceExpression.connect(flags, scope, this);

    // add isBound flag and remove isBinding flag
    this.$state |= LifecycleState.isBound;
    this.$state &= ~LifecycleState.isBinding;
  }

  public $unbind(flags: BindingFlags): void {
    if (!(this.$state & LifecycleState.isBound)) {
      return;
    }
    // add isUnbinding flag
    this.$state |= LifecycleState.isUnbinding;

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.unbind) {
      sourceExpression.unbind(flags, this.$scope, this);
    }
    this.$scope = null;
    this.unobserve(true);

    // remove isBound and isUnbinding flags
    this.$state &= ~(LifecycleState.isBound | LifecycleState.isUnbinding);
  }
}
