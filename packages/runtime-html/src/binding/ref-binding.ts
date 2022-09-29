import { astAssign, astBind, astEvaluate, astUnbind, type IsBindingBehavior, type Scope } from '@aurelia/runtime';
import type { IIndexable, IServiceLocator } from '@aurelia/kernel';
import type { IAstBasedBinding } from './interfaces-bindings';

export interface RefBinding extends IAstBasedBinding {}
export class RefBinding implements IAstBasedBinding {
  public interceptor: this = this;

  public isBound: boolean = false;
  public $scope?: Scope = void 0;

  public constructor(
    public locator: IServiceLocator,
    public ast: IsBindingBehavior,
    public target: object,
  ) {}

  public $bind(scope: Scope): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.interceptor.$unbind();
    }

    this.$scope = scope;

    astBind(this.ast, scope, this);

    astAssign(this.ast, this.$scope, this, this.target);

    // add isBound flag and remove isBinding flag
    this.isBound = true;
  }

  public $unbind(): void {
    if (!this.isBound) {
      return;
    }

    if (astEvaluate(this.ast, this.$scope!, this, null) === this.target) {
      astAssign(this.ast, this.$scope!, this, null);
    }

    astUnbind(this.ast, this.$scope!, this.interceptor);

    this.$scope = void 0;

    this.isBound = false;
  }

  public observe(_obj: IIndexable, _propertyName: string): void {
    return;
  }

  public handleChange(_newValue: unknown, _previousValue: unknown): void {
    return;
  }
}
