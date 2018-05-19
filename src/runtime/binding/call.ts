import { IObserverLocator } from "./observer-locator";
import { IExpression } from "./ast";
import { IBinding } from "./binding";
import { IContainer } from "../di";
import { IBindingTargetAccessor } from "./observation";
import { IScope } from "./binding-context";
import { INode } from "../dom";

export class Call implements IBinding {
  targetObserver: IBindingTargetAccessor;
  private $scope: IScope;
  private $isBound = false;

  constructor(
    private sourceExpression: IExpression,
    private target: INode,
    private targetProperty: string,
    private observerLocator: IObserverLocator, 
    public container: IContainer) {
    this.targetObserver = <any>observerLocator.getObserver(target, targetProperty);
  }

  callSource($event) {
    let overrideContext = <any>this.$scope.overrideContext;
    Object.assign(overrideContext, $event);
    overrideContext.$event = $event; // deprecate this?
    let mustEvaluate = true;
    let result = this.sourceExpression.evaluate(this.$scope, this.container, mustEvaluate);
    delete overrideContext.$event;

    for (let prop in $event) {
      delete overrideContext[prop];
    }

    return result;
  }

  $bind(scope: IScope) {
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.$unbind();
    }

    this.$isBound = true;
    this.$scope = scope;

    if (this.sourceExpression.bind) {
      this.sourceExpression.bind(this, scope);
    }

    this.targetObserver.setValue($event => this.callSource($event), this.target, this.targetProperty);
  }

  $unbind() {
    if (!this.$isBound) {
      return;
    }

    this.$isBound = false;

    if (this.sourceExpression.unbind) {
      this.sourceExpression.unbind(this, this.$scope);
    }

    this.$scope = null;
    this.targetObserver.setValue(null, this.target, this.targetProperty);
  }

  observeProperty() { }
}
