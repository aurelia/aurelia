import { IDisposable, IServiceLocator } from '../../kernel';
import { INode } from '../dom';
import { IBindScope, State } from '../lifecycle';
import { IScope, LifecycleFlags } from '../observation';
import { hasBind, hasUnbind, IsBindingBehavior, StrictAny } from './ast';
import { IBinding } from './binding';
import { IConnectableBinding } from './connectable';
import { DelegationStrategy, IEventManager } from './event-manager';
import { IFabricNode } from '../three-dom';
import { I3VNode } from '../three-vnode';

const validMouseEvents = [
  ''
];

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
    public target: I3VNode,
    public preventDefault: boolean,
    private eventManager: IEventManager,
    public locator: IServiceLocator) {
      
    this.handleEvent = this.handleEvent.bind(this);
  }

  public callSource(...args: any[]): ReturnType<IsBindingBehavior['evaluate']> {
    const overrideContext = this.$scope.overrideContext;
    overrideContext['$event'] = args;

    const result = this.sourceExpression.evaluate(LifecycleFlags.mustEvaluate, this.$scope, this.locator);

    delete overrideContext['$event'];

    // if (result !== true && this.preventDefault) {
    //   event.preventDefault();
    // }

    return result;
  }

  public handleEvent(...args: any[]): void {
    this.callSource(...args);
  }

  public $bind(flags: LifecycleFlags, scope: IScope): void {
    if (this.$state & State.isBound) {
      if (this.$scope === scope) {
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

    // this.target.nativeObject.on(this.targetEvent, this.handleEvent);

    // should it be normalized in uicontrol
    // (this.target as any).onChanged(this.handleEvent);
    // this.target.addListener(this.targetEvent, this.handleEvent);

    // this.handler = this.eventManager.addEventListener(
    //   this.target,
    //   this.targetEvent,
    //   this,
    //   this.delegationStrategy
    // );

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

    this.$scope = null;
    // this.target.nativeObject.off(this.targetEvent, this.handleEvent);
    // this.handler.dispose();
    this.handler = null;

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);
  }
  // tslint:disable:no-empty no-any
  public observeProperty(obj: StrictAny, propertyName: StrictAny): void { }
  public handleChange(newValue: any, previousValue: any, flags: LifecycleFlags): void { }
  // tslint:enable:no-empty no-any
}
