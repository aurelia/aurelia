import {
  DelegationStrategy,
  LifecycleFlags,
} from '@aurelia/runtime';

import { IEventTarget } from '../dom';
import { isFunction } from '../utilities';

import type { IDisposable, IIndexable, IServiceLocator } from '@aurelia/kernel';
import type { IsBindingBehavior, Scope } from '@aurelia/runtime';
import type { IEventDelegator } from '../observation/event-delegator';
import type { IPlatform } from '../platform';
import type { IAstBasedBinding } from './interfaces-bindings';
import { connectableBinding } from './binding-utils';

const addListenerOptions = {
  [DelegationStrategy.capturing]: { capture: true },
  [DelegationStrategy.bubbling]: { capture: false },
} as const;

export class ListenerOptions {
  public constructor(
    public readonly prevent: boolean,
    public readonly strategy: DelegationStrategy,
    public readonly expAsHandler: boolean,
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
    public platform: IPlatform,
    public targetEvent: string,
    public sourceExpression: IsBindingBehavior,
    public target: Node,
    public eventDelegator: IEventDelegator,
    public locator: IServiceLocator,
    options: ListenerOptions,
  ) {
    this._options = options;
  }

  public callSource(event: Event): ReturnType<IsBindingBehavior['evaluate']> {
    const overrideContext = this.$scope.overrideContext;
    overrideContext.$event = event;

    let result = this.sourceExpression.evaluate(this.$scope, this, null);

    delete overrideContext.$event;

    if (this._options.expAsHandler) {
      if (!isFunction(result)) {
        throw new Error(`Handler of "${this.targetEvent}" event is not a function.`);
      }
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

  public $bind(flags: LifecycleFlags, scope: Scope): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.interceptor.$unbind(flags | LifecycleFlags.fromBind);
    }

    this.$scope = scope;

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.hasBind) {
      sourceExpression.bind(flags, scope, this.interceptor);
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

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.hasUnbind) {
      sourceExpression.unbind(flags, this.$scope, this.interceptor);
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
  public handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void {
    return;
  }
}

connectableBinding(true, true, false);
