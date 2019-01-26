import { IIndexable, IServiceLocator, Tracer } from '@aurelia/kernel';
import { IsBindingBehavior } from '../ast';
import { LifecycleFlags, State } from '../flags';
import { IBinding } from '../lifecycle';
import { IObservable, IScope } from '../observation';
import { hasBind, hasUnbind } from './ast';
import { IConnectableBinding } from './connectable';

const slice = Array.prototype.slice;

export interface Ref extends IConnectableBinding {}
export class Ref implements IBinding {
  public $nextBinding: IBinding;
  public $prevBinding: IBinding;
  public $state: State;
  public $scope: IScope;

  public locator: IServiceLocator;
  public sourceExpression: IsBindingBehavior;
  public target: IObservable;

  constructor(sourceExpression: IsBindingBehavior, target: IObservable, locator: IServiceLocator) {
    this.$nextBinding = null;
    this.$prevBinding = null;
    this.$state = State.none;

    this.locator = locator;
    this.sourceExpression = sourceExpression;
    this.target = target;
  }

  public $bind(flags: LifecycleFlags, scope: IScope): void {
    if (Tracer.enabled) { Tracer.enter('Ref.$bind', slice.call(arguments)); }
    if (this.$state & State.isBound) {
      if (this.$scope === scope) {
        if (Tracer.enabled) { Tracer.leave(); }
        return;
      }

      this.$unbind(flags | LifecycleFlags.fromBind);
    }
    // add isBinding flag
    this.$state |= State.isBinding;

    this.$scope = scope;

    if (hasBind(this.sourceExpression)) {
      this.sourceExpression.bind(flags, scope, this);
    }

    this.sourceExpression.assign(flags, this.$scope, this.locator, this.target);

    // add isBound flag and remove isBinding flag
    this.$state |= State.isBound;
    this.$state &= ~State.isBinding;
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public $unbind(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Ref.$unbind', slice.call(arguments)); }
    if (!(this.$state & State.isBound)) {
      if (Tracer.enabled) { Tracer.leave(); }
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
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public observeProperty(flags: LifecycleFlags, obj: IIndexable, propertyName: string): void {
    return;
  }

  public handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void {
    return;
  }
}
