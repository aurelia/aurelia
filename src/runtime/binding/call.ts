import { ObserverLocator } from "./observer-locator";
import { IExpression, ILookupFunctions } from "./ast";
import { IBindingTargetObserver, IScope } from "./binding-interfaces";
import { IBinding } from "./binding";

export class Call implements IBinding {
  targetObserver: IBindingTargetObserver;
  private source: IScope;
  private isBound = false;

  constructor(
    private sourceExpression: IExpression,
    private target: EventTarget,
    private targetProperty: string, 
    public lookupFunctions: ILookupFunctions, 
    observerLocator = ObserverLocator.instance) {
    this.targetObserver = observerLocator.getObserver(target, targetProperty);
  }

  callSource($event) {
    let overrideContext = <any>this.source.overrideContext;
    Object.assign(overrideContext, $event);
    overrideContext.$event = $event; // deprecate this?
    let mustEvaluate = true;
    let result = this.sourceExpression.evaluate(this.source, this.lookupFunctions, mustEvaluate);
    delete overrideContext.$event;

    for (let prop in $event) {
      delete overrideContext[prop];
    }

    return result;
  }

  bind(source: IScope) {
    if (this.isBound) {
      if (this.source === source) {
        return;
      }

      this.unbind();
    }

    this.isBound = true;
    this.source = source;

    if (this.sourceExpression.bind) {
      this.sourceExpression.bind(this, source);
    }

    this.targetObserver.setValue($event => this.callSource($event), this.target, this.targetProperty);
  }

  unbind() {
    if (!this.isBound) {
      return;
    }

    this.isBound = false;

    if (this.sourceExpression.unbind) {
      this.sourceExpression.unbind(this, this.source);
    }

    this.source = null;
    this.targetObserver.setValue(null, this.target, this.targetProperty);
  }

  observeProperty() { }
}
