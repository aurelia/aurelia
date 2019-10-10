import { IDisposable, IIndexable, IServiceLocator } from '@aurelia/kernel';
import {
  DelegationStrategy,
  hasBind,
  hasUnbind,
  IBinding,
  IConnectableBinding,
  IDOM,
  IsBindingBehavior,
  IScope,
  LifecycleFlags,
  State
} from '@aurelia/runtime';
import { IEventManager } from '../observation/event-manager';

const slice = Array.prototype.slice;

export interface Listener extends IConnectableBinding {}
/**
 * Listener binding. Handle event binding between view and view model
 */
export class Listener implements IBinding {
  public dom: IDOM;

  public $state: State;
  public $scope!: IScope;
  public part?: string;

  public delegationStrategy: DelegationStrategy;
  public locator: IServiceLocator;
  public preventDefault: boolean;
  public sourceExpression: IsBindingBehavior;
  public target: Node;
  public targetEvent: string;

  private readonly eventManager: IEventManager;
  private handler!: IDisposable;

  public constructor(
    dom: IDOM,
    targetEvent: string,
    delegationStrategy: DelegationStrategy,
    sourceExpression: IsBindingBehavior,
    target: Node,
    preventDefault: boolean,
    eventManager: IEventManager,
    locator: IServiceLocator
  ) {
    this.dom = dom;
    this.$state = State.none;

    this.delegationStrategy = delegationStrategy;
    this.locator = locator;
    this.preventDefault = preventDefault;
    this.sourceExpression = sourceExpression;
    this.target = target;
    this.targetEvent = targetEvent;

    this.eventManager = eventManager;
  }

  public callSource(event: Event): ReturnType<IsBindingBehavior['evaluate']> {
    const overrideContext = this.$scope.overrideContext;
    overrideContext.$event = event;

    const result = this.sourceExpression.evaluate(LifecycleFlags.mustEvaluate, this.$scope, this.locator, this.part);

    Reflect.deleteProperty(overrideContext, '$event');

    if (result !== true && this.preventDefault) {
      event.preventDefault();
    }

    return result;
  }

  public handleEvent(event: Event): void {
    this.callSource(event);
  }

  public $bind(flags: LifecycleFlags, scope: IScope, part?: string): void {
    if (this.$state & State.isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.$unbind(flags | LifecycleFlags.fromBind);
    }
    // add isBinding flag
    this.$state |= State.isBinding;

    this.$scope = scope;
    this.part = part;

    const sourceExpression = this.sourceExpression;
    if (hasBind(sourceExpression)) {
      sourceExpression.bind(flags, scope, this);
    }

    this.handler = this.eventManager.addEventListener(
      this.dom,
      this.target,
      this.targetEvent,
      this,
      this.delegationStrategy
    );

    // add isBound flag and remove isBinding flag
    this.$state |= State.isBound;
    this.$state &= ~State.isBinding;
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!(this.$state & State.isBound)) {
      return;
    }
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

    const sourceExpression = this.sourceExpression;
    if (hasUnbind(sourceExpression)) {
      sourceExpression.unbind(flags, this.$scope, this);
    }

    this.$scope = null!;
    this.handler.dispose();
    this.handler = null!;

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);
  }

  public observeProperty(flags: LifecycleFlags, obj: IIndexable, propertyName: string): void {
    return;
  }

  public handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void {
    return;
  }
}
