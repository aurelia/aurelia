import { IEventManager, DelegationStrategy } from './event-manager';
import { IExpression } from './ast';
import { IBinding } from './binding';
import { IServiceLocator } from '@aurelia/kernel';
import { IDisposable } from '@aurelia/kernel';
import { IScope } from './binding-context';
import { INode } from '../dom';
import { BindingFlags } from './binding-flags';

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
    public locator: IServiceLocator
  ) { }

  callSource(event: Event) {
    let overrideContext = this.source.overrideContext as any;
    overrideContext['$event'] = event;

    let result = this.sourceExpression.evaluate(BindingFlags.mustEvaluate, this.source, this.locator);

    delete overrideContext['$event'];

    if (result !== true && this.preventDefault) {
      event.preventDefault();
    }

    return result;
  }

  handleEvent(event: Event) {
    this.callSource(event);
  }

  $bind(flags: BindingFlags, source: IScope) {
    if (this.$isBound) {
      if (this.source === source) {
        return;
      }

      this.$unbind(flags);
    }

    this.$isBound = true;
    this.source = source;

    if (this.sourceExpression.bind) {
      this.sourceExpression.bind(flags, source, this);
    }

    this.handler = this.eventManager.addEventListener(
      this.target,
      this.targetEvent,
      this,
      this.delegationStrategy
    );
  }

  $unbind(flags: BindingFlags) {
    if (!this.$isBound) {
      return;
    }

    this.$isBound = false;

    if (this.sourceExpression.unbind) {
      this.sourceExpression.unbind(flags, this.source, this);
    }

    this.source = null;
    this.handler.dispose();
    this.handler = null;
  }

  observeProperty() { }
}
