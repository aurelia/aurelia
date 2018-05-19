import { IEventManager, DelegationStrategy } from "./event-manager";
import { IExpression } from "./ast";
import { IBinding } from "./binding";
import { IContainer } from "../di";
import { IDisposable } from "../interfaces";
import { IScope } from "./binding-context";
import { INode } from "../dom";

export class Listener implements IBinding {
  private source: IScope;
  private $isBound = false;
  private handler: IDisposable;

  constructor(
    public targetEvent: string,
    private delegationStrategy: DelegationStrategy,
    private sourceExpression: IExpression,
    private target: INode,
    private preventDefault: boolean,
    private eventManager: IEventManager,
    public container: IContainer
  ) {
    this.targetEvent = targetEvent;
    this.delegationStrategy = delegationStrategy;
    this.sourceExpression = sourceExpression;
    this.target = target;
    this.preventDefault = preventDefault;
    this.container = container;
  }

  callSource(event: Event) {
    let overrideContext = this.source.overrideContext as any;
    overrideContext['$event'] = event;

    let mustEvaluate = true;
    let result = this.sourceExpression.evaluate(this.source, this.container, mustEvaluate);

    delete overrideContext['$event'];

    if (result !== true && this.preventDefault) {
      event.preventDefault();
    }

    return result;
  }

  handleEvent(event: Event) {
    this.callSource(event);
  }

  $bind(source: IScope) {
    if (this.$isBound) {
      if (this.source === source) {
        return;
      }

      this.$unbind();
    }

    this.$isBound = true;
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

  $unbind() {
    if (!this.$isBound) {
      return;
    }

    this.$isBound = false;

    if (this.sourceExpression.unbind) {
      this.sourceExpression.unbind(this, this.source);
    }

    this.source = null;
    this.handler.dispose();
    this.handler = null;
  }

  observeProperty() { }
}
