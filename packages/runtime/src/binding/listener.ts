import { IDisposable, IServiceLocator } from '@aurelia/kernel';
import { INode } from '../dom';
import { IBindScope, State } from '../lifecycle';
import { BindingFlags, IScope } from '../observation';
import { hasBind, hasUnbind, IsBindingBehavior, StrictAny } from './ast';
import { IBinding } from './binding';
import { IConnectableBinding } from './connectable';
import { DelegationStrategy, IEventManager } from './event-manager';

export interface Listener extends IConnectableBinding {}
export class Listener implements IBinding {
  public $nextBind: IBindScope = null;
  public $prevBind: IBindScope = null;

  public $state: State = State.none;

  public $scope: IScope;

  private handler: IDisposable;

  constructor(
    public targetEvent: string,
    public delegationStrategy: DelegationStrategy,
    public sourceExpression: IsBindingBehavior,
    public target: INode,
    public preventDefault: boolean,
    private eventManager: IEventManager,
    public locator: IServiceLocator
  ) { }

  public callSource(event: Event): ReturnType<IsBindingBehavior['evaluate']> {
    const overrideContext = this.$scope.overrideContext;
    overrideContext['$event'] = event;

    const result = this.sourceExpression.evaluate(BindingFlags.mustEvaluate, this.$scope, this.locator);

    delete overrideContext['$event'];

    if (result !== true && this.preventDefault) {
      event.preventDefault();
    }

    return result;
  }

  public handleEvent(event: Event): void {
    this.callSource(event);
  }

  public $bind(flags: BindingFlags, scope: IScope): void {
    if (this.$state & State.isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.$unbind(flags | BindingFlags.fromBind);
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
  }

  public $unbind(flags: BindingFlags): void {
    if (!(this.$state & State.isBound)) {
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
  }
  // tslint:disable:no-empty no-any
  public observeProperty(obj: StrictAny, propertyName: StrictAny): void { }
  public handleChange(newValue: any, previousValue: any, flags: BindingFlags): void { }
  // tslint:enable:no-empty no-any
}
