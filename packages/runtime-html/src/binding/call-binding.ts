import { LifecycleFlags } from '@aurelia/runtime';

import type { IServiceLocator } from '@aurelia/kernel';
import type { IAccessor, IObserverLocator, IsBindingBehavior, Scope } from '@aurelia/runtime';
import type { IAstBasedBinding } from './interfaces-bindings';
import { astEvaluator } from './binding-utils';

/**
 * A binding for handling .call syntax
 */
export interface CallBinding extends IAstBasedBinding {}
export class CallBinding implements IAstBasedBinding {
  public interceptor: this = this;

  public isBound: boolean = false;
  public $scope?: Scope;

  public targetObserver: IAccessor;

  public constructor(
    public locator: IServiceLocator,
    observerLocator: IObserverLocator,
    public ast: IsBindingBehavior,
    public readonly target: object,
    public readonly targetProperty: string,
  ) {
    this.targetObserver = observerLocator.getAccessor(target, targetProperty);
  }

  public callSource(args: object): unknown {
    const overrideContext = this.$scope!.overrideContext;
    overrideContext.$event = args;
    const result = this.ast.evaluate(this.$scope!, this, null);
    Reflect.deleteProperty(overrideContext, '$event');

    return result;
  }

  public $bind(flags: LifecycleFlags, scope: Scope): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.interceptor.$unbind(flags | LifecycleFlags.fromBind);
    }

    this.$scope = scope;

    if (this.ast.hasBind) {
      this.ast.bind(flags, scope, this.interceptor);
    }

    this.targetObserver.setValue(($args: object) => this.interceptor.callSource($args), flags, this.target, this.targetProperty);

    // add isBound flag and remove isBinding flag
    this.isBound = true;
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    if (this.ast.hasUnbind) {
      this.ast.unbind(flags, this.$scope!, this.interceptor);
    }

    this.$scope = void 0;
    this.targetObserver.setValue(null, flags, this.target, this.targetProperty);

    this.isBound = false;
  }

  public observe(_obj: object, _propertyName: string): void {
    return;
  }

  public handleChange(_newValue: unknown, _previousValue: unknown, _flags: LifecycleFlags): void {
    return;
  }
}

astEvaluator(true)(CallBinding);
