import type { IServiceLocator } from '@aurelia/kernel';
import { ICollectionSubscriber, IObserverLocatorBasedConnectable, ISubscriber } from '@aurelia/runtime';
import { type Scope } from './scope';
import { astAssign, astBind, astEvaluate, astUnbind, IAstEvaluator } from '../ast.eval';
import { mixinAstEvaluator } from './binding-utils';
import { type IsBindingBehavior } from '@aurelia/expression-parser';
import { IBinding } from './interfaces-bindings';

export interface RefBinding extends IAstEvaluator, IObserverLocatorBasedConnectable, IServiceLocator { }
export class RefBinding implements IBinding, ISubscriber, ICollectionSubscriber {
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
      /* istanbul-ignore-next */
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
      /* istanbul-ignore-next */
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
