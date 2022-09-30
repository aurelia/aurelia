import { IEventTarget } from '../dom';
import { DelegationStrategy } from '../renderer';
import { isFunction } from '../utilities';
import { implementAstEvaluator, mixinBindingUseScope, mixingBindingLimited } from './binding-utils';

import type { IDisposable, IServiceLocator } from '@aurelia/kernel';
import { astBind, astEvaluate, astUnbind, Scope, type IsBindingBehavior } from '@aurelia/runtime';
import { type IEventDelegator } from '../observation/event-delegator';
import { type IAstBasedBinding } from './interfaces-bindings';

const addListenerOptions = {
  [DelegationStrategy.capturing]: { capture: true },
  [DelegationStrategy.bubbling]: { capture: false },
} as const;

export class ListenerOptions {
  public constructor(
    public readonly prevent: boolean,
    public readonly strategy: DelegationStrategy,
  ) {}
}

export interface Listener extends IAstBasedBinding {}
/**
 * Listener binding. Handle event binding between view and view model
 */
export class Listener implements IAstBasedBinding {
  public interceptor: this = this;

  public isBound: boolean = false;
  public $scope!: Scope;

  private handler: IDisposable = null!;
  /** @internal */
  private readonly _options: ListenerOptions;

  /**
   * Indicates if this binding evaluates an ast and get a function, that function should be bound
   * to the instance it is on
   *
   * @internal
   */
  public readonly boundFn = true;

  public constructor(
    public locator: IServiceLocator,
    public ast: IsBindingBehavior,
    public target: Node,
    public targetEvent: string,
    public eventDelegator: IEventDelegator,
    options: ListenerOptions,
  ) {
    this._options = options;
  }

  public callSource(event: Event): unknown {
    const overrideContext = this.$scope.overrideContext;
    overrideContext.$event = event;

    let result = astEvaluate(this.ast, this.$scope, this, null);

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
    this.interceptor.callSource(event);
  }

  public $bind(scope: Scope): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind();
    }
    this.$scope = scope;

    astBind(this.ast, scope, this.interceptor);

    if (this._options.strategy === DelegationStrategy.none) {
      this.target.addEventListener(this.targetEvent, this);
    } else {
      this.handler = this.eventDelegator.addEventListener(
        this.locator.get(IEventTarget),
        this.target,
        this.targetEvent,
        this,
        addListenerOptions[this._options.strategy],
      );
    }

    this.isBound = true;
  }

  public $unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;

    astUnbind(this.ast, this.$scope, this.interceptor);

    this.$scope = null!;
    if (this._options.strategy === DelegationStrategy.none) {
      this.target.removeEventListener(this.targetEvent, this);
    } else {
      this.handler.dispose();
      this.handler = null!;
    }
  }
}

mixinBindingUseScope(Listener);
mixingBindingLimited(Listener, () => 'callSource');
implementAstEvaluator(true, true)(Listener);
