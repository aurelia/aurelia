import { IIndexable, IServiceLocator, Primitive } from '@aurelia/kernel';
import { INode } from '../dom';
import { hasBind, hasUnbind, IsBindingBehavior, StrictAny } from './ast';
import { IScope } from './binding-context';
import { BindingFlags } from './binding-flags';
import { IConnectableBinding } from './connectable';
import { IAccessor } from './observation';
import { IObserverLocator } from './observer-locator';

export interface Call extends IConnectableBinding {}
export class Call {
  public $isBound: boolean = false;
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
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.$unbind(flags);
    }

    this.$isBound = true;
    this.$scope = scope;

    const sourceExpression = this.sourceExpression;
    if (hasBind(sourceExpression)) {
      sourceExpression.bind(flags, scope, this);
    }

    this.targetObserver.setValue($args => this.callSource($args), flags);
  }

  public $unbind(flags: BindingFlags): void {
    if (!this.$isBound) {
      return;
    }

    this.$isBound = false;

    const sourceExpression = this.sourceExpression;
    if (hasUnbind(sourceExpression)) {
      sourceExpression.unbind(flags, this.$scope, this);
    }

    this.$scope = null;
    this.targetObserver.setValue(null, flags);
  }
  // tslint:disable:no-empty no-any
  public observeProperty(obj: StrictAny, propertyName: StrictAny): void { }
  public handleChange(newValue: any, previousValue: any, flags: BindingFlags): void { }
  // tslint:enable:no-empty no-any
}
