import type { IServiceLocator } from '@aurelia/kernel';
import { astBind, astEvaluate, astUnbind, IAccessor, IObserverLocator, IsBindingBehavior, Scope } from '@aurelia/runtime';
import { implementAstEvaluator, mixinBindingUseScope, mixingBindingLimited } from './binding-utils';
import type { IAstBasedBinding } from './interfaces-bindings';

/**
 * A binding for handling .call syntax
 */
export interface CallBinding extends IAstBasedBinding { }
export class CallBinding implements IAstBasedBinding {
  public isBound: boolean = false;
  public scope?: Scope;

  public targetObserver: IAccessor;

  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

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
    const overrideContext = this.scope!.overrideContext;
    overrideContext.$event = args;
    const result = astEvaluate(this.ast, this.scope!, this, null);
    Reflect.deleteProperty(overrideContext, '$event');

    return result;
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

    this.targetObserver.setValue(($args: object) => this.callSource($args), this.target, this.targetProperty);
    this.isBound = true;
  }

  public $unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;

    astUnbind(this.ast, this.scope!, this);

    this.scope = void 0;
    this.targetObserver.setValue(null, this.target, this.targetProperty);
  }
}

mixinBindingUseScope(CallBinding);
mixingBindingLimited(CallBinding, () => 'callSource');
implementAstEvaluator(true)(CallBinding);
