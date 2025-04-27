import type { IServiceLocator } from '@aurelia/kernel';
import {
  type ICollectionSubscriber,
  type IObserverLocatorBasedConnectable,
  type ISubscriber,
  type Scope,
  astAssign,
  astBind,
  astEvaluate,
  astUnbind,
  type IAstEvaluator,
  connectable,
  IObserverLocator,
} from '@aurelia/runtime';
import { createPrototypeMixer, mixinAstEvaluator, mixingBindingLimited, mixinUseScope } from './binding-utils';
import { type IsBindingBehavior } from '@aurelia/expression-parser';
import { IBinding } from './interfaces-bindings';

export interface RefBinding extends IAstEvaluator, IObserverLocatorBasedConnectable, IServiceLocator { }
export class RefBinding implements IBinding, ISubscriber, ICollectionSubscriber {
  public static mix = /*@__PURE__*/ createPrototypeMixer(() => {
    connectable(RefBinding, null!);
    mixingBindingLimited(RefBinding, () => 'updateSource');
    mixinUseScope(RefBinding);
    mixinAstEvaluator(RefBinding);
  });

  public isBound: boolean = false;

  /** @internal */
  public _scope?: Scope = void 0;

  /** @internal */
  public l: IServiceLocator;

  public constructor(
    locator: IServiceLocator,
    public oL: IObserverLocator,
    public ast: IsBindingBehavior,
    public target: object,
    public strict: boolean,
  ) {
    this.l = locator;
  }

  public updateSource() {
    if (this.isBound) {
      this.obs.version++;
      astAssign(this.ast, this._scope!, this, this, this.target);
      this.obs.clear();
    } else {
      astAssign(this.ast, this._scope!, this, null, null);
    }
  }

  public handleChange(): void {
    if (this.isBound) {
      this.updateSource();
    }
  }

  public handleCollectionChange(): void {
    if (this.isBound) {
      this.updateSource();
    }
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
    this.isBound = true;

    this.updateSource();
  }

  public unbind(): void {
    if (!this.isBound) {
      /* istanbul-ignore-next */
      return;
    }
    this.isBound = false;
    this.obs.clearAll();

    if (astEvaluate(this.ast, this._scope!, this, null) === this.target) {
      this.updateSource();
    }

    astUnbind(this.ast, this._scope!, this);

    this._scope = void 0;
  }
}
