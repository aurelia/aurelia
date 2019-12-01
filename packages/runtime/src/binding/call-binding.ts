import {
  IServiceLocator,
} from '@aurelia/kernel';
import { IsBindingBehavior } from '../ast';
import {
  LifecycleFlags,
  State,
} from '../flags';
import {
  IAccessor,
  IScope,
} from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import {
  hasBind,
  hasUnbind,
} from './ast';
import { IConnectableBinding } from './connectable';
import { IBindingMiddleware, IHookableCallBinding, registerMiddleware, ICallSourceMiddlewareContext, deregisterMiddleware } from './binding-middleware';
import { ITaskQueue, IScheduler } from '../scheduler';

export interface CallBinding extends IConnectableBinding { }
export class CallBinding implements IHookableCallBinding {
  public $state: State = State.none;
  public $scope?: IScope;
  public part?: string;

  public targetObserver: IAccessor;

  // TODO need better way to avoid repetition
  public readonly middlewares: IBindingMiddleware[] = [];
  public readonly registerMiddleware: typeof registerMiddleware = registerMiddleware;
  public readonly deregisterMiddleware: typeof deregisterMiddleware = deregisterMiddleware;
  public readonly postRenderTaskQueue: ITaskQueue;

  public constructor(
    public sourceExpression: IsBindingBehavior,
    target: object,
    targetProperty: string,
    observerLocator: IObserverLocator,
    public locator: IServiceLocator,
  ) {
    this.targetObserver = observerLocator.getObserver(LifecycleFlags.none, target, targetProperty);
    this.postRenderTaskQueue = locator.get(IScheduler).getPostRenderTaskQueue();
  }

  public callSource(args: object): unknown {
    const overrideContext = this.$scope!.overrideContext;
    Object.assign(overrideContext, args);
    const result = this.sourceExpression.evaluate(LifecycleFlags.mustEvaluate, this.$scope!, this.locator, this.part);

    for (const prop in args) {
      Reflect.deleteProperty(overrideContext, prop);
    }

    return result;
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

    if (hasBind(this.sourceExpression)) {
      this.sourceExpression.bind(flags, scope, this);
    }

    this.targetObserver.setValue(($args: object) => {
      if (this.middlewares.length > 0) {
        this.runMiddlewares($args);
      } else {
        this.callSource($args as object);
      }
    }, flags);

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

    if (hasUnbind(this.sourceExpression)) {
      this.sourceExpression.unbind(flags, this.$scope!, this);
    }

    this.$scope = void 0;
    this.targetObserver.setValue(null, flags);

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);
  }

  public observeProperty(flags: LifecycleFlags, obj: object, propertyName: string): void {
    return;
  }

  public handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void {
    return;
  }

  private runMiddlewares(args: object) {
    this.postRenderTaskQueue.queueTask(async () => {
      await this.middlewares.reduce(async (acc, middleware) => {
        const ctx = await acc;
        return !ctx.done ? middleware.runCallSource!(ctx) : acc;
      }, Promise.resolve<ICallSourceMiddlewareContext>({ done: false, arguments: args }));
    });
  }
}
