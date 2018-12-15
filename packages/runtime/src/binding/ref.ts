import { IServiceLocator } from '../../kernel';
import { IBindScope, State } from '../lifecycle';
import { IScope, LifecycleFlags } from '../observation';
import { hasBind, hasUnbind, IsBindingBehavior, StrictAny } from './ast';
import { IBinding, IBindingTarget } from './binding';
import { IConnectableBinding } from './connectable';
import { I3VNode } from 'runtime/three-vnode';

export interface Ref extends IConnectableBinding {}
export class Ref implements IBinding {
  public $nextBind: IBindScope = null;
  public $prevBind: IBindScope = null;

  public $state: State = State.none;

  public $scope: IScope;

  constructor(
    public sourceExpression: IsBindingBehavior,
    public target: I3VNode,
    public locator: IServiceLocator) { }

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

    this.sourceExpression.assign(flags, this.$scope, this.locator, this.target.nativeObject);

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
  // tslint:disable:no-empty no-any
  public observeProperty(obj: StrictAny, propertyName: StrictAny): void { }
  public handleChange(newValue: any, previousValue: any, flags: LifecycleFlags): void { }
  // tslint:enable:no-empty no-any
}
