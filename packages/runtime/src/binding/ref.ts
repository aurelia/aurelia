import { IIndexable, IServiceLocator } from '@aurelia/kernel';
import { IBindScope, State } from '../lifecycle';
import { IScope, LifecycleFlags } from '../observation';
import { hasBind, hasUnbind, IsBindingBehavior } from './ast';
import { IBinding, IBindingTarget } from './binding';
import { IConnectableBinding } from './connectable';

export interface Ref extends IConnectableBinding {}
export class Ref implements IBinding {
  public $nextBind: IBindScope;
  public $prevBind: IBindScope;
  public $state: State;
  public $scope: IScope;

  public locator: IServiceLocator;
  public sourceExpression: IsBindingBehavior;
  public target: IBindingTarget;

  constructor(sourceExpression: IsBindingBehavior, target: IBindingTarget, locator: IServiceLocator) {
    this.$nextBind = null;
    this.$prevBind = null;
    this.$state = State.none;

    this.locator = locator;
    this.sourceExpression = sourceExpression;
    this.target = target;
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

    const sourceExpression = this.sourceExpression;
    if (hasBind(sourceExpression)) {
      sourceExpression.bind(flags, scope, this);
    }

    this.sourceExpression.assign(flags, this.$scope, this.locator, this.target);

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

    if (this.sourceExpression.evaluate(flags, this.$scope, this.locator) === this.target) {
      this.sourceExpression.assign(flags, this.$scope, this.locator, null);
    }

    const sourceExpression = this.sourceExpression;
    if (hasUnbind(sourceExpression)) {
      sourceExpression.unbind(flags, this.$scope, this);
    }

    this.$scope = null;

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);
  }

  public observeProperty(obj: IIndexable, propertyName: string): void {
    return;
  }

  public handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void {
    return;
  }
}
