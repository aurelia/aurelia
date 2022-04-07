import {
  DelegationStrategy,
  LifecycleFlags,
} from '@aurelia/runtime';

import { IEventTarget } from '../dom.js';

import type { IDisposable, IIndexable, IServiceLocator } from '@aurelia/kernel';
import type { IsBindingBehavior, Scope } from '@aurelia/runtime';
import type { IEventDelegator } from '../observation/event-delegator.js';
import type { IPlatform } from '../platform.js';
import { IAstBasedBinding } from './interfaces-bindings.js';

const options = {
  [DelegationStrategy.capturing]: { capture: true } as const,
  [DelegationStrategy.bubbling]: { capture: false } as const,
} as const;

export interface Listener extends IAstBasedBinding {}
/**
 * Listener binding. Handle event binding between view and view model
 */
export class Listener implements IAstBasedBinding {
  public interceptor: this = this;

  public isBound: boolean = false;
  public $scope!: Scope;

  private handler: IDisposable = null!;

  public constructor(
    public platform: IPlatform,
    public targetEvent: string,
    public delegationStrategy: DelegationStrategy,
    public sourceExpression: IsBindingBehavior,
    public target: Node,
    public preventDefault: boolean,
    public eventDelegator: IEventDelegator,
    public locator: IServiceLocator,
  ) {}

  public callSource(event: Event): ReturnType<IsBindingBehavior['evaluate']> {
    const overrideContext = this.$scope.overrideContext;
    overrideContext.$event = event;

    const result = this.sourceExpression.evaluate(LifecycleFlags.mustEvaluate, this.$scope, this.locator, null);

    Reflect.deleteProperty(overrideContext, '$event');

    if (result !== true && this.preventDefault) {
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

    if (this.delegationStrategy === DelegationStrategy.none) {
      this.target.addEventListener(this.targetEvent, this);
    } else {
      this.handler = this.eventDelegator.addEventListener(
        this.locator.get(IEventTarget),
        this.target,
        this.targetEvent,
        this,
        options[this.delegationStrategy],
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
    if (this.delegationStrategy === DelegationStrategy.none) {
      this.target.removeEventListener(this.targetEvent, this);
    } else {
      this.handler.dispose();
      this.handler = null!;
    }

    // remove isBound and isUnbinding flags
    this.isBound = false;
  }

  public observe(obj: IIndexable, propertyName: string): void {
    return;
  }

  public handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void {
    return;
  }
}
