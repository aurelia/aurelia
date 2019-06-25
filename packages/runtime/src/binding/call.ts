import {
  IServiceLocator,
  Tracer,
} from '@aurelia/kernel';

import { IsBindingBehavior } from '../ast';
import {
  LifecycleFlags,
  State,
} from '../flags';
import { IBinding } from '../lifecycle';
import {
  IAccessor,
  IBindingContext,
  IObservable,
  IScope,
} from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import {
  hasBind,
  hasUnbind,
} from './ast';
import { IConnectableBinding } from './connectable';

const slice = Array.prototype.slice;

export interface Call extends IConnectableBinding {}
export class Call {
  public $state: State;
  public $scope?: IScope;
  public part?: string;

  public locator: IServiceLocator;
  public sourceExpression: IsBindingBehavior;
  public targetObserver: IAccessor;

  constructor(
    sourceExpression: IsBindingBehavior,
    target: object,
    targetProperty: string,
    observerLocator: IObserverLocator,
    locator: IServiceLocator,
  ) {
    this.$state = State.none;

    this.locator = locator;
    this.sourceExpression = sourceExpression;
    this.targetObserver = observerLocator.getObserver(LifecycleFlags.none, target, targetProperty);
  }

  public callSource(args: object): unknown {
    if (Tracer.enabled) { Tracer.enter('Call', 'callSource', slice.call(arguments)); }
    const overrideContext = this.$scope!.overrideContext;
    Object.assign(overrideContext, args);
    const result = this.sourceExpression.evaluate(LifecycleFlags.mustEvaluate, this.$scope!, this.locator, this.part);

    for (const prop in args) {
      Reflect.deleteProperty(overrideContext, prop);
    }

    if (Tracer.enabled) { Tracer.leave(); }
    return result;
  }

  public $bind(flags: LifecycleFlags, scope: IScope, part?: string): void {
    if (Tracer.enabled) { Tracer.enter('Call', '$bind', slice.call(arguments)); }
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
    this.part = part;

    if (hasBind(this.sourceExpression)) {
      this.sourceExpression.bind(flags, scope, this);
    }

    this.targetObserver.setValue(($args: object) => this.callSource($args), flags);

    // add isBound flag and remove isBinding flag
    this.$state |= State.isBound;
    this.$state &= ~State.isBinding;
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public $unbind(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Call', '$unbind', slice.call(arguments)); }
    if (!(this.$state & State.isBound)) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

    if (hasUnbind(this.sourceExpression)) {
      this.sourceExpression.unbind(flags, this.$scope!, this);
    }

    this.$scope = void 0;
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
