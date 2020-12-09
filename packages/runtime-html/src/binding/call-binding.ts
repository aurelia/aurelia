import { LifecycleFlags } from '@aurelia/runtime';

import type { IServiceLocator } from '@aurelia/kernel';
import type { IAccessor, IConnectableBinding, IObserverLocator, IsBindingBehavior, Scope } from '@aurelia/runtime';

export interface CallBinding extends IConnectableBinding {}
export class CallBinding {
  public interceptor: this = this;

  public isBound: boolean = false;
  public $scope?: Scope;
  public $hostScope: Scope | null = null;

  public targetObserver: IAccessor;

  public constructor(
    public sourceExpression: IsBindingBehavior,
    public readonly target: object,
    public readonly targetProperty: string,
    observerLocator: IObserverLocator,
    public locator: IServiceLocator,
  ) {
    this.targetObserver = observerLocator.getObserver(target, targetProperty);
  }

  public callSource(args: object): unknown {
    const overrideContext = this.$scope!.overrideContext;
    // really need to delete the following line
    // and the for..in loop below
    // convenience in the template won't outweight the draw back of such confusing feature
    // OR, at the very least, use getter/setter for each property in args to get/set original source
    // ---
    Object.assign(overrideContext, args);
    const result = this.sourceExpression.evaluate(LifecycleFlags.mustEvaluate, this.$scope!, this.$hostScope, this.locator, null);

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

    this.targetObserver.setValue(($args: object) => this.interceptor.callSource($args), flags, this.target, this.targetProperty);

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
    this.targetObserver.setValue(null, flags, this.target, this.targetProperty);

    this.isBound = false;
  }

  public observeProperty(obj: object, propertyName: string): void {
    return;
  }

  public handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void {
    return;
  }
}
