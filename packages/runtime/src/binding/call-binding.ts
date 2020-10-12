import {
  IServiceLocator,
} from '@aurelia/kernel';
import {
  LifecycleFlags,
} from '../flags';
import {
  IAccessor,
} from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import {
  IsBindingBehavior,
} from './ast';
import { IConnectableBinding } from './connectable';
import type { Scope } from '../observation/binding-context';

export interface CallBinding extends IConnectableBinding {}
export class CallBinding {
  public interceptor: this = this;

  public isBound: boolean = false;
  public $scope?: Scope;
  public $hostScope: Scope | null = null;

  public targetObserver: IAccessor;

  public constructor(
    public sourceExpression: IsBindingBehavior,
    target: object,
    targetProperty: string,
    observerLocator: IObserverLocator,
    public locator: IServiceLocator,
  ) {
    this.targetObserver = observerLocator.getObserver(LifecycleFlags.none, target, targetProperty);
  }

  public callSource(args: object): unknown {
    const overrideContext = this.$scope!.overrideContext;
    Object.assign(overrideContext, args);
    const result = this.sourceExpression.evaluate(LifecycleFlags.mustEvaluate, this.$scope!, this.$hostScope, this.locator);

    for (const prop in args) {
      Reflect.deleteProperty(overrideContext, prop);
    }

    return result;
  }

  public $bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.interceptor.$unbind(flags | LifecycleFlags.fromBind);
    }

    this.$scope = scope;
    this.$hostScope = hostScope;

    if (this.sourceExpression.hasBind) {
      this.sourceExpression.bind(flags, scope, hostScope, this.interceptor);
    }

    this.targetObserver.setValue(($args: object) => this.interceptor.callSource($args), flags);

    // add isBound flag and remove isBinding flag
    this.isBound = true;
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    if (this.sourceExpression.hasUnbind) {
      this.sourceExpression.unbind(flags, this.$scope!, this.$hostScope, this.interceptor);
    }

    this.$scope = void 0;
    this.targetObserver.setValue(null, flags);

    this.isBound = false;
  }

  public observeProperty(flags: LifecycleFlags, obj: object, propertyName: string): void {
    return;
  }

  public handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void {
    return;
  }
}
