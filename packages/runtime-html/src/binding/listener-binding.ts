import { isFunction } from '../utilities';
import { mixinAstEvaluator, mixinUseScope, mixingBindingLimited } from './binding-utils';

import type { IServiceLocator } from '@aurelia/kernel';
import { astBind, astEvaluate, astUnbind, IAstEvaluator, IBinding, IConnectableBinding, Scope, type IsBindingBehavior } from '@aurelia/runtime';

export class ListenerBindingOptions {
  public constructor(
    public readonly prevent: boolean,
    public readonly capture: boolean = false,
  ) {}
}

export interface ListenerBinding extends IAstEvaluator, IConnectableBinding {}
/**
 * Listener binding. Handle event binding between view and view model
 */
export class ListenerBinding implements IBinding {
  public isBound: boolean = false;

  /** @internal */
  public _scope?: Scope;

  /** @internal */
  private readonly _options: ListenerBindingOptions;

  /** @internal */
  public l: IServiceLocator;

  /**
   * Whether this binding only handles events originate from the target this binding is bound to
   */
  public self: boolean = false;

  /**
   * Indicates if this binding evaluates an ast and get a function, that function should be bound
   * to the instance it is on
   *
   * @internal
   */
  public readonly boundFn = true;

  public constructor(
    locator: IServiceLocator,
    public ast: IsBindingBehavior,
    public target: Node,
    public targetEvent: string,
    options: ListenerBindingOptions,
  ) {
    this.l = locator;
    this._options = options;
  }

  public callSource(event: Event): unknown {
    const overrideContext = this._scope!.overrideContext;
    overrideContext.$event = event;

    let result = astEvaluate(this.ast, this._scope!, this, null);

    delete overrideContext.$event;

    if (isFunction(result)) {
      result = result(event);
    }

    if (result !== true && this._options.prevent) {
      event.preventDefault();
    }

    return result;
  }

  public handleEvent(event: Event): void {
    if (this.self) {
      if (this.target !== event.composedPath()[0]) {
        return;
      }
    }
    this.callSource(event);
  }

  public bind(scope: Scope): void {
    if (this.isBound) {
      if (this._scope === scope) {
        return;
      }
      this.unbind();
    }
    this._scope = scope;

    astBind(this.ast, scope, this);

    this.target.addEventListener(this.targetEvent, this, this._options);

    this.isBound = true;
  }

  public unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;

    astUnbind(this.ast, this._scope!, this);

    this._scope = void 0;
    this.target.removeEventListener(this.targetEvent, this, this._options);
  }
}

mixinUseScope(ListenerBinding);
mixingBindingLimited(ListenerBinding, () => 'callSource');
mixinAstEvaluator(true, true)(ListenerBinding);
