import { IServiceLocator, Tracer } from '@aurelia/kernel';
import { IsBindingBehavior } from '../ast';
import { LifecycleFlags, State } from '../flags';
import { IBinding } from '../lifecycle';
import { IAccessor, IBindingContext, IObservable, IScope } from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import { hasBind, hasUnbind } from './ast';
import { IConnectableBinding } from './connectable';

const slice = Array.prototype.slice;

export interface Call extends IConnectableBinding {}
export class Call {
  public $nextBinding: IBinding;
  public $prevBinding: IBinding;
  public $state: State;
  public $scope: IScope;

  public locator: IServiceLocator;
  public sourceExpression: IsBindingBehavior;
  public targetObserver: IAccessor;

  constructor(sourceExpression: IsBindingBehavior, target: IObservable | IBindingContext, targetProperty: string, observerLocator: IObserverLocator, locator: IServiceLocator) {
    this.$nextBinding = null;
    this.$prevBinding = null;
    this.$state = State.none;

    this.locator = locator;
    this.sourceExpression = sourceExpression;
    this.targetObserver = observerLocator.getObserver(LifecycleFlags.none, target, targetProperty);
  }

  public callSource(args: object): unknown {
    if (Tracer.enabled) { Tracer.enter('Call.callSource', slice.call(arguments)); }
    const overrideContext = this.$scope.overrideContext;
    Object.assign(overrideContext, args);
    const result = this.sourceExpression.evaluate(LifecycleFlags.mustEvaluate, this.$scope, this.locator);

    for (const prop in args) {
      // tslint:disable-next-line:no-dynamic-delete
      delete overrideContext[prop];
    }

    if (Tracer.enabled) { Tracer.leave(); }
    return result;
  }

  public $bind(flags: LifecycleFlags, scope: IScope): void {
    if (Tracer.enabled) { Tracer.enter('Call.$bind', slice.call(arguments)); }
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

    const sourceExpression = this.sourceExpression;
    if (hasBind(sourceExpression)) {
      sourceExpression.bind(flags, scope, this);
    }

    this.targetObserver.setValue($args => this.callSource($args), flags);

    // add isBound flag and remove isBinding flag
    this.$state |= State.isBound;
    this.$state &= ~State.isBinding;
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public $unbind(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Call.$unbind', slice.call(arguments)); }
    if (!(this.$state & State.isBound)) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

    const sourceExpression = this.sourceExpression;
    if (hasUnbind(sourceExpression)) {
      sourceExpression.unbind(flags, this.$scope, this);
    }

    this.$scope = null;
    this.targetObserver.setValue(null, flags);

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public observeProperty(flags: LifecycleFlags, obj: object, propertyName: string): void {
    return;
  }

  public handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void {
    return;
  }
}
