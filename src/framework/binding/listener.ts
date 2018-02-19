import { EventManager } from "./event-manager";
import { Expression, ILookupFunctions } from "./ast";
import { Scope } from "./scope";
import { IBinding } from "./binding";

export class Listener implements IBinding {
  private source: Scope;
  private isBound: boolean;
  private disposeListener: () => void;

  constructor(
    private targetEvent: string, 
    private delegationStrategy, 
    private sourceExpression: Expression, 
    private target, 
    private preventDefault: boolean, 
    private lookupFunctions: ILookupFunctions, 
    private eventManager: EventManager = EventManager.instance
  ) {
    this.targetEvent = targetEvent;
    this.delegationStrategy = delegationStrategy;
    this.sourceExpression = sourceExpression;
    this.target = target;
    this.preventDefault = preventDefault;
    this.lookupFunctions = lookupFunctions;
  }

  callSource(event) {
    let overrideContext = this.source.overrideContext;
    overrideContext['$event'] = event;
    
    let mustEvaluate = true;
    let result = this.sourceExpression.evaluate(this.source, this.lookupFunctions, mustEvaluate);
    
    delete overrideContext['$event'];
    
    if (result !== true && this.preventDefault) {
      event.preventDefault();
    }

    return result;
  }

  handleEvent(event) {
    this.callSource(event);
  }

  bind(source) {
    if (this.isBound) {
      if (this.source === source) {
        return;
      }

      this.unbind();
    }

    this.isBound = true;
    this.source = source;

    if (this.sourceExpression.bind) {
      this.sourceExpression.bind(this, source, this.lookupFunctions);
    }

    this.disposeListener = this.eventManager.addEventListener(
      this.target,
      this.targetEvent,
      this,
      this.delegationStrategy
    );
  }

  unbind() {
    if (!this.isBound) {
      return;
    }

    this.isBound = false;

    if (this.sourceExpression.unbind) {
      this.sourceExpression.unbind(this, this.source, this.lookupFunctions);
    }

    this.source = null;
    this.disposeListener();
    this.disposeListener = null;
  }

  observeProperty() { }
}
