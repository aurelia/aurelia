import { astAssign, astBind, astEvaluate, astUnbind, type IsBindingBehavior, type Scope } from '@aurelia/runtime';
import type { IServiceLocator } from '@aurelia/kernel';
import type { IAstBasedBinding } from './interfaces-bindings';
import { mixinAstEvaluator } from './binding-utils';

export interface RefBinding extends IAstBasedBinding {}
export class RefBinding implements IAstBasedBinding {
  /** @internal */
  public l: IServiceLocator;
  public isBound: boolean = false;
  public scope?: Scope = void 0;

  public constructor(
    locator: IServiceLocator,
    public ast: IsBindingBehavior,
    public target: object,
  ) {
    this.l = locator;
  }

  public $bind(scope: Scope): void {
    if (this.isBound) {
      if (this.scope === scope) {
        return;
      }

      this.$unbind();
    }
    this.scope = scope;

    astBind(this.ast, scope, this);

    astAssign(this.ast, this.scope, this, this.target);

    // add isBound flag and remove isBinding flag
    this.isBound = true;
  }

  public $unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;

    if (astEvaluate(this.ast, this.scope!, this, null) === this.target) {
      astAssign(this.ast, this.scope!, this, null);
    }

    astUnbind(this.ast, this.scope!, this);

    this.scope = void 0;
  }
}

mixinAstEvaluator(false)(RefBinding);
