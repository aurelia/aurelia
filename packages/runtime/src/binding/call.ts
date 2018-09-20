import { IIndexable, IServiceLocator, Primitive } from '@aurelia/kernel';
import { INode } from '../dom';
import { IExpression } from './ast';
import { IBinding } from './binding';
import { IScope } from './binding-context';
import { BindingFlags } from './binding-flags';
import { IAccessor } from './observation';
import { IObserverLocator } from './observer-locator';

export class Call implements IBinding {
  public $isBound: boolean = false;
  public targetObserver: IAccessor;
  private $scope: IScope;

  constructor(
    public sourceExpression: IExpression,
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

    if (this.sourceExpression.bind) {
      this.sourceExpression.bind(flags, scope, this);
    }

    this.targetObserver.setValue($args => this.callSource($args), flags);
  }

  public $unbind(flags: BindingFlags): void {
    if (!this.$isBound) {
      return;
    }

    this.$isBound = false;

    if (this.sourceExpression.unbind) {
      this.sourceExpression.unbind(flags, this.$scope, this);
    }

    this.$scope = null;
    this.targetObserver.setValue(null, flags);
  }

  // tslint:disable-next-line:no-empty
  public observeProperty(): void { }
}
