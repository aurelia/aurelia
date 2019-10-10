import {
  IServiceLocator,
} from '@aurelia/kernel';
import { IsBindingBehavior } from '../ast';
import {
  LifecycleFlags,
  State,
} from '../flags';
import {
  IAccessor,
  IScope,
} from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import {
  hasBind,
  hasUnbind,
} from './ast';
import { IConnectableBinding } from './connectable';

const slice = Array.prototype.slice;

export interface CallBinding extends IConnectableBinding {}
export class CallBinding {
  public $state: State;
  public $scope?: IScope;
  public part?: string;

  public locator: IServiceLocator;
  public sourceExpression: IsBindingBehavior;
  public targetObserver: IAccessor;

  public constructor(
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
    const overrideContext = this.$scope!.overrideContext;
    Object.assign(overrideContext, args);
    const result = this.sourceExpression.evaluate(LifecycleFlags.mustEvaluate, this.$scope!, this.locator, this.part);

    for (const prop in args) {
      Reflect.deleteProperty(overrideContext, prop);
    }

    return result;
  }

  public $bind(flags: LifecycleFlags, scope: IScope, part?: string): void {
    if (this.$state & State.isBound) {
      if (this.$scope === scope) {
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
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!(this.$state & State.isBound)) {
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
  }

  public observeProperty(flags: LifecycleFlags, obj: object, propertyName: string): void {
    return;
  }

  public handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void {
    return;
  }
}
