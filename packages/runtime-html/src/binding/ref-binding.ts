import { LifecycleFlags } from '@aurelia/runtime';

import type { IIndexable, IServiceLocator } from '@aurelia/kernel';
import type { IsBindingBehavior, Scope } from '@aurelia/runtime';
import type { IAstBasedBinding } from './interfaces-bindings';

export interface RefBinding extends IAstBasedBinding {}
export class RefBinding implements IAstBasedBinding {
  public interceptor: this = this;

  public isBound: boolean = false;
  public $scope?: Scope = void 0;

  public constructor(
    public ast: IsBindingBehavior,
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

    if (this.ast.hasBind) {
      this.ast.bind(flags, scope, this);
    }

    this.ast.assign(this.$scope, this, this.target);

    // add isBound flag and remove isBinding flag
    this.isBound = true;
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    let ast = this.ast;
    if (ast.evaluate(this.$scope!, this, null) === this.target) {
      ast.assign(this.$scope!, this, null);
    }

    // source expression might have been modified durring assign, via a BB
    // deepscan-disable-next-line
    ast = this.ast;
    if (ast.hasUnbind) {
      ast.unbind(flags, this.$scope!, this.interceptor);
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
