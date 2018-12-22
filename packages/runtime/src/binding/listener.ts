import { IDisposable, IIndexable, IServiceLocator, Tracer } from '@aurelia/kernel';
import { IEvent, INode } from '../dom.interfaces';
import { IBindScope, State } from '../lifecycle';
import { IScope, LifecycleFlags } from '../observation';
import { DelegationStrategy, IEventManager } from '../observation//event-manager';
import { hasBind, hasUnbind, IsBindingBehavior } from './ast';
import { IBinding } from './binding';
import { IConnectableBinding } from './connectable';

const slice = Array.prototype.slice;

export interface Listener extends IConnectableBinding {}
export class Listener implements IBinding {
  public $nextBind: IBindScope;
  public $prevBind: IBindScope;
  public $state: State;
  public $scope: IScope;

  public delegationStrategy: DelegationStrategy;
  public locator: IServiceLocator;
  public preventDefault: boolean;
  public sourceExpression: IsBindingBehavior;
  public target: INode;
  public targetEvent: string;

  private eventManager: IEventManager;
  private handler: IDisposable;

  constructor(targetEvent: string, delegationStrategy: DelegationStrategy, sourceExpression: IsBindingBehavior, target: INode, preventDefault: boolean, eventManager: IEventManager, locator: IServiceLocator) {
    this.$nextBind = null;
    this.$prevBind = null;
    this.$state = State.none;

    this.delegationStrategy = delegationStrategy;
    this.locator = locator;
    this.preventDefault = preventDefault;
    this.sourceExpression = sourceExpression;
    this.target = target;
    this.targetEvent = targetEvent;

    this.eventManager = eventManager;
  }

  public callSource(event: IEvent): ReturnType<IsBindingBehavior['evaluate']> {
    if (Tracer.enabled) { Tracer.enter('Listener.callSource', slice.call(arguments)); }
    const overrideContext = this.$scope.overrideContext;
    overrideContext['$event'] = event;

    const result = this.sourceExpression.evaluate(LifecycleFlags.mustEvaluate, this.$scope, this.locator);

    delete overrideContext['$event'];

    if (result !== true && this.preventDefault) {
      event.preventDefault();
    }

    if (Tracer.enabled) { Tracer.leave(); }
    return result;
  }

  public handleEvent(event: IEvent): void {
    this.callSource(event);
  }

  public $bind(flags: LifecycleFlags, scope: IScope): void {
    if (Tracer.enabled) { Tracer.enter('Listener.$bind', slice.call(arguments)); }
    if (this.$state & State.isBound) {
      if (this.$scope === scope) {
        if (Tracer.enabled) { Tracer.leave(); }
        return;
      }

      this.$unbind(flags | LifecycleFlags.fromBind);
    }
    // add isBinding flag
    this.$state |= State.isBinding;

    this.$scope = scope;

    const sourceExpression = this.sourceExpression;
    if (hasBind(sourceExpression)) {
      sourceExpression.bind(flags, scope, this);
    }

    this.handler = this.eventManager.addEventListener(
      this.target,
      this.targetEvent,
      this,
      this.delegationStrategy
    );

    // add isBound flag and remove isBinding flag
    this.$state |= State.isBound;
    this.$state &= ~State.isBinding;
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public $unbind(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Listener.$unbind', slice.call(arguments)); }
    if (!(this.$state & State.isBound)) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

    const sourceExpression = this.sourceExpression;
    if (hasUnbind(sourceExpression)) {
      sourceExpression.unbind(flags, this.$scope, this);
    }

    this.$scope = null;
    this.handler.dispose();
    this.handler = null;

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public observeProperty(obj: IIndexable, propertyName: string): void {
    return;
  }

  public handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void {
    return;
  }
}
