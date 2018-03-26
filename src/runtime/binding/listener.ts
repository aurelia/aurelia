import { EventManager } from "./event-manager";
import { IExpression, ILookupFunctions } from "./ast";
import { IBinding } from "./binding";
import { Scope, IDisposable, IDelegationStrategy, IEventManager } from "./binding-interfaces";

export class Listener implements IBinding {
  private source: Scope;
  private isBound = false;
  private handler: IDisposable;

  constructor(
    private targetEvent: string,
    private delegationStrategy: IDelegationStrategy[keyof IDelegationStrategy],
    private sourceExpression: IExpression,
    private target: EventTarget,
    private preventDefault: boolean,
    public lookupFunctions: ILookupFunctions,
    private eventManager: IEventManager = EventManager.instance
  ) {
    this.targetEvent = targetEvent;
    this.delegationStrategy = delegationStrategy;
    this.sourceExpression = sourceExpression;
    this.target = target;
    this.preventDefault = preventDefault;
    this.lookupFunctions = lookupFunctions;
  }

  callSource(event: Event) {
    let overrideContext = this.source.overrideContext as any;
    overrideContext['$event'] = event;

    let mustEvaluate = true;
    let result = this.sourceExpression.evaluate(this.source, this.lookupFunctions, mustEvaluate);

    delete overrideContext['$event'];

    if (result !== true && this.preventDefault) {
      event.preventDefault();
    }

    return result;
  }

  handleEvent(event: Event) {
    this.callSource(event);
  }

  bind(source: Scope) {
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

    this.handler = this.eventManager.addEventListener(
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
      this.sourceExpression.unbind(this, this.source);
    }

    this.source = null;
    this.handler.dispose();
    this.handler = null;
  }

  observeProperty() { }
}
