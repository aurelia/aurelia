import { IDisposable, IIndexable, IServiceLocator } from '@aurelia/kernel';
import {
  DelegationStrategy,
  hasBind,
  hasUnbind,
  IBinding,
  IConnectableBinding,
  IDOM,
  IsBindingBehavior,
  IScope,
  LifecycleFlags,
  State,
  IHookableCallBinding,
  IBindingMiddleware,
  registerMiddleware,
  deregisterMiddleware,
  ICallSourceMiddlewareContext,
  IScheduler,
  ITaskQueue
} from '@aurelia/runtime';
import { IEventManager } from '../observation/event-manager';

export interface Listener extends IConnectableBinding { }
/**
 * Listener binding. Handle event binding between view and view model
 */
export class Listener implements IBinding, IHookableCallBinding {
  public $state: State = State.none;
  public $scope!: IScope;
  public part?: string;

  private handler!: IDisposable;

  // TODO need better way to avoid repetition
  public readonly middlewares: IBindingMiddleware[] = [];
  public readonly registerMiddleware: typeof registerMiddleware = registerMiddleware;
  public readonly deregisterMiddleware: typeof deregisterMiddleware = deregisterMiddleware;
  public readonly postRenderTaskQueue: ITaskQueue;

  public constructor(
    public dom: IDOM,
    public targetEvent: string,
    public delegationStrategy: DelegationStrategy,
    public sourceExpression: IsBindingBehavior,
    public target: Node,
    public preventDefault: boolean,
    public eventManager: IEventManager,
    public locator: IServiceLocator
  ) {
    this.postRenderTaskQueue = locator.get(IScheduler).getPostRenderTaskQueue();
  }

  public callSource(event: Event): ReturnType<IsBindingBehavior['evaluate']> {
    const overrideContext = this.$scope.overrideContext;
    overrideContext.$event = event;

    const result = this.sourceExpression.evaluate(LifecycleFlags.mustEvaluate, this.$scope, this.locator, this.part);

    Reflect.deleteProperty(overrideContext, '$event');

    if (result !== true && this.preventDefault) {
      event.preventDefault();
    }

    return result;
  }

  public handleEvent(event: Event): void {
    if (this.middlewares.length > 0) {
      this.runMiddlewares(event);
    } else {
      this.callSource(event!);
    }
  }

  public $bind(flags: LifecycleFlags, scope: IScope, part?: string): void {
    if (this.$state & State.isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.$unbind(flags | LifecycleFlags.fromBind);
    }
    // add isBinding flag
    this.$state |= State.isBinding;

    this.$scope = scope;
    this.part = part;

    const sourceExpression = this.sourceExpression;
    if (hasBind(sourceExpression)) {
      sourceExpression.bind(flags, scope, this);
    }

    this.handler = this.eventManager.addEventListener(
      this.dom,
      this.target,
      this.targetEvent,
      this,
      this.delegationStrategy
    );

    // add isBound flag and remove isBinding flag
    this.$state |= State.isBound;
    this.$state &= ~State.isBinding;
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!(this.$state & State.isBound)) {
      return;
    }
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

    const sourceExpression = this.sourceExpression;
    if (hasUnbind(sourceExpression)) {
      sourceExpression.unbind(flags, this.$scope, this);
    }

    this.$scope = null!;
    this.handler.dispose();
    this.handler = null!;

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);
  }

  public observeProperty(flags: LifecycleFlags, obj: IIndexable, propertyName: string): void {
    return;
  }

  public handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void {
    return;
  }

  private runMiddlewares(event: Event) {
    this.postRenderTaskQueue.queueTask(async () =>
      this.middlewares.reduce(async (acc, middleware) => {
        const ctx = await acc;
        return !ctx.done ? middleware.runCallSource!(ctx) : acc;
      }, Promise.resolve<ICallSourceMiddlewareContext>({ done: false, event })));
  }
}
