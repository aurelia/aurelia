import { LifecycleFlags } from '@aurelia/runtime';

import type { IIndexable, IServiceLocator } from '@aurelia/kernel';
import type { IsBindingBehavior, Scope } from '@aurelia/runtime';
import type { IAstBasedBinding } from './interfaces-bindings.js';

export interface RefBinding extends IAstBasedBinding {}
export class RefBinding implements IAstBasedBinding {
  public interceptor: this = this;

  public isBound: boolean = false;
  public $scope?: Scope = void 0;

  public constructor(
    public sourceExpression: IsBindingBehavior,
    public target: object,
    public locator: IServiceLocator,
  ) {}

  public $bind(flags: LifecycleFlags, scope: Scope): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.interceptor.$unbind(flags | LifecycleFlags.fromBind);
    }

    this.$scope = scope;

    if (this.sourceExpression.hasBind) {
      this.sourceExpression.bind(flags, scope, this);
    }

    this.sourceExpression.assign(flags, this.$scope, this.locator, this.target);

    // add isBound flag and remove isBinding flag
    this.isBound = true;
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    let sourceExpression = this.sourceExpression;
    if (sourceExpression.evaluate(flags, this.$scope!, this.locator, null) === this.target) {
      sourceExpression.assign(flags, this.$scope!, this.locator, null);
    }

    // source expression might have been modified durring assign, via a BB
    // deepscan-disable-next-line
    sourceExpression = this.sourceExpression;
    if (sourceExpression.hasUnbind) {
      sourceExpression.unbind(flags, this.$scope!, this.interceptor);
    }

    this.$scope = void 0;

    this.isBound = false;
  }

  public observe(_obj: IIndexable, _propertyName: string): void {
    return;
  }

  public handleChange(_newValue: unknown, _previousValue: unknown, _flags: LifecycleFlags): void {
    return;
  }
}
