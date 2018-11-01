import { IIndexable, IServiceLocator, Primitive } from '@aurelia/kernel';
import { INode } from '../dom';
import { IBindScope, State } from '../lifecycle';
import { BindingFlags, IAccessor, IScope } from '../observation';
import { hasBind, hasUnbind, IsBindingBehavior, StrictAny } from './ast';
import { IConnectableBinding } from './connectable';
import { IObserverLocator } from './observer-locator';

export interface Call extends IConnectableBinding {}
export class Call {
  public $nextBind: IBindScope = null;
  public $prevBind: IBindScope = null;

  public $state: State = State.none;
  public $scope: IScope;

  public targetObserver: IAccessor;

  constructor(
    public sourceExpression: IsBindingBehavior,
    target: INode,
    targetProperty: string,
    observerLocator: IObserverLocator,
    public locator: IServiceLocator) {
    this.targetObserver = observerLocator.getObserver(target, targetProperty);
  }

  public callSource(args: IIndexable): Primitive | IIndexable {
    const overrideContext = this.$scope.overrideContext;
    Object.assign(overrideContext, args);
    const result = this.sourceExpression.evaluate(BindingFlags.mustEvaluate, this.$scope, this.locator);

    for (const prop in args) {
      delete overrideContext[prop];
    }

    return result;
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

    this.targetObserver.setValue($args => this.callSource($args), flags);

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
    this.targetObserver.setValue(null, flags);

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);
  }
  // tslint:disable:no-empty no-any
  public observeProperty(obj: StrictAny, propertyName: StrictAny): void { }
  public handleChange(newValue: any, previousValue: any, flags: BindingFlags): void { }
  // tslint:enable:no-empty no-any
}
