import { IEventTarget } from '../dom';
import { isFunction } from '../utilities';
import { astEvaluator } from './binding-utils';
import { DelegationStrategy } from '../renderer';

import type { IDisposable, IIndexable, IServiceLocator } from '@aurelia/kernel';
import type { IsBindingBehavior, Scope } from '@aurelia/runtime';
import type { IEventDelegator } from '../observation/event-delegator';
import type { IAstBasedBinding } from './interfaces-bindings';

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

  public callSource(event: Event): ReturnType<IsBindingBehavior['evaluate']> {
    const overrideContext = this.$scope.overrideContext;
    overrideContext.$event = event;

    let result = this.ast.evaluate(this.$scope, this, null);

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

    const ast = this.ast;
    if (ast.hasBind) {
      ast.bind(scope, this.interceptor);
    }

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

    // add isBound flag and remove isBinding flag
    this.isBound = true;
  }

  public $unbind(): void {
    if (!this.isBound) {
      return;
    }

    if (this.ast.hasUnbind) {
      this.ast.unbind(this.$scope, this.interceptor);
    }

    this.$scope = null!;
    if (this._options.strategy === DelegationStrategy.none) {
      this.target.removeEventListener(this.targetEvent, this);
    } else {
      this.handler.dispose();
      this.handler = null!;
    }

    // remove isBound and isUnbinding flags
    this.isBound = false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public observe(obj: IIndexable, propertyName: string): void {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public handleChange(newValue: unknown, previousValue: unknown): void {
    return;
  }
}

astEvaluator(true, true)(Listener);
