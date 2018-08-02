import { IDisposable, IServiceLocator } from '@aurelia/kernel';
import { INode } from '../dom';
import { IExpression } from './ast';
import { IBinding } from './binding';
import { IScope } from './binding-context';
import { BindingFlags } from './binding-flags';
import { DelegationStrategy, IEventManager } from './event-manager';

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

  public callSource(event: Event) {
    let overrideContext = this.source.overrideContext as any;
    overrideContext['$event'] = event;

    let result = this.sourceExpression.evaluate(BindingFlags.mustEvaluate, this.source, this.locator);

    delete overrideContext['$event'];

    if (result !== true && this.preventDefault) {
      event.preventDefault();
    }

    return result;
  }

  public handleEvent(event: Event) {
    this.callSource(event);
  }

  public $bind(flags: BindingFlags, source: IScope) {
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

  public $unbind(flags: BindingFlags) {
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

  public observeProperty() { }
}
