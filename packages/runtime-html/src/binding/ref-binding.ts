import type { IServiceLocator } from '@aurelia/kernel';
import { astAssign, astBind, astEvaluate, astUnbind, IAstEvaluator, IBinding, IConnectableBinding, type IsBindingBehavior, type Scope } from '@aurelia/runtime';
import { mixinAstEvaluator } from './binding-utils';

export interface RefBinding extends IAstEvaluator, IConnectableBinding { }
export class RefBinding implements IBinding {
  public isBound: boolean = false;

  /** @internal */
  public _scope?: Scope = void 0;

  /** @internal */
  public l: IServiceLocator;

  public constructor(
    locator: IServiceLocator,
    public ast: IsBindingBehavior,
    public target: object,
  ) {
    this.l = locator;
  }

  public bind(_scope: Scope): void {
    if (this.isBound) {
      if (this._scope === _scope) {
        return;
      }

      this.unbind();
    }
    this._scope = _scope;

    astBind(this.ast, _scope, this);

    astAssign(this.ast, this._scope, this, this.target);

    // add isBound flag and remove isBinding flag
    this.isBound = true;
  }

  public unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;

    if (astEvaluate(this.ast, this._scope!, this, null) === this.target) {
      astAssign(this.ast, this._scope!, this, null);
    }

    astUnbind(this.ast, this._scope!, this);

    this._scope = void 0;
  }
}

mixinAstEvaluator(false)(RefBinding);
