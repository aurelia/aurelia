import { ObserverLocator } from "./observer-locator";
import { IExpression } from "./ast";
import { IBinding } from "./binding";
import { IContainer } from "../di";
import { IBindingTargetAccessor } from "./observation";
import { IScope } from "./binding-context";

export class Call implements IBinding {
  targetObserver: IBindingTargetAccessor;
  private source: IScope;
  private isBound = false;

  constructor(
    private sourceExpression: IExpression,
    private target: EventTarget,
    private targetProperty: string, 
    public container: IContainer, 
    observerLocator = ObserverLocator.instance) {
    this.targetObserver = <any>observerLocator.getObserver(target, targetProperty);
  }

  callSource($event) {
    let overrideContext = <any>this.source.overrideContext;
    Object.assign(overrideContext, $event);
    overrideContext.$event = $event; // deprecate this?
    let mustEvaluate = true;
    let result = this.sourceExpression.evaluate(this.source, this.container, mustEvaluate);
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
