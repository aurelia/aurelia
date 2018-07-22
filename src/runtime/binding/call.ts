import { IObserverLocator } from './observer-locator';
import { IExpression } from './ast';
import { IBinding, BindingFlags } from './binding';
import { IServiceLocator } from '../../kernel/di';
import { IScope } from './binding-context';
import { INode } from '../dom';
import { IAccessor } from './observation';

export class Call implements IBinding {
  targetObserver: IAccessor;
  private $scope: IScope;
  private $isBound = false;

  constructor(
    private sourceExpression: IExpression,
    private target: INode,
    private targetProperty: string,
    private observerLocator: IObserverLocator, 
    public locator: IServiceLocator) {
    this.targetObserver = <any>observerLocator.getObserver(target, targetProperty);
  }

  callSource($event) {
    let overrideContext = <any>this.$scope.overrideContext;
    Object.assign(overrideContext, $event);
    overrideContext.$event = $event; // deprecate this?
    let result = this.sourceExpression.evaluate(BindingFlags.mustEvaluate, this.$scope, this.locator);
    delete overrideContext.$event;

    for (let prop in $event) {
      delete overrideContext[prop];
    }

    return result;
  }

  $bind(flags: BindingFlags, scope: IScope) {
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

    this.targetObserver.setValue($event => this.callSource($event));
  }

  $unbind(flags: BindingFlags) {
    if (!this.$isBound) {
      return;
    }

    this.$isBound = false;

    if (this.sourceExpression.unbind) {
      this.sourceExpression.unbind(flags, this.$scope, this);
    }

    this.$scope = null;
    this.targetObserver.setValue(null);
  }

  observeProperty() { }
}
