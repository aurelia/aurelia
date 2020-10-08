import { IIndexable, IServiceLocator } from '@aurelia/kernel';
import {
  IScheduler,
  ITask,
  QueueTaskOptions,
} from '@aurelia/scheduler';
import {
  BindingMode,
  LifecycleFlags,
  ExpressionKind,
} from '../flags';
import { IBinding } from '../lifecycle';
import {
  IBindingTargetAccessor,
  IScope,
  AccessorType,
  INodeAccessor,
} from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import { Interpolation, IsExpression } from './ast';
import {
  connectable,
  IConnectableBinding,
} from './connectable';

const { toView } = BindingMode;

const queueTaskOptions: QueueTaskOptions = {
  reusable: false,
  preempt: true,
};

// a pseudo binding to manage multiple InterpolationBinding s
// ========
// Note: the child expressions of an Interpolation expression are full Aurelia expressions, meaning they may include
// value converters and binding behaviors.
// Each expression represents one ${interpolation}, and for each we create a child TextBinding unless there is only one,
// in which case the renderer will create the TextBinding directly
export class MultiInterpolationBinding implements IBinding {
  public interceptor: this = this;

  public isBound: boolean = false;
  public $scope?: IScope = void 0;

  public partBindings: ContentBinding[];

  private targetObserver: IBindingTargetAccessor;
  private task: ITask | null = null;

  public constructor(
    public observerLocator: IObserverLocator,
    public interpolation: Interpolation,
    public target: object,
    public targetProperty: string,
    public mode: BindingMode,
    public locator: IServiceLocator,
    public $scheduler: IScheduler,
  ) {
    this.targetObserver = observerLocator.getAccessor(LifecycleFlags.none, target, targetProperty);
    const expressions = interpolation.expressions;
    const partBindings = this.partBindings = Array(expressions.length);
    for (let i = 0, ii = expressions.length; i < ii; ++i) {
      partBindings[i] = new ContentBinding(expressions[i], target, targetProperty, locator, observerLocator, this);
    }
  }

  public updateTarget(value: unknown, flags: LifecycleFlags): void {
    const partBindings = this.partBindings;
    const staticParts = this.interpolation.parts;
    const results: unknown[] = [staticParts[0]];
    let len = 0;
    for (let i = 0, ii = partBindings.length; ii > i; ++i) {
      results[len++] = partBindings[i].value;
      results[len++] = staticParts[i + 1];
    }

    const targetObserver = this.targetObserver;
    // Alpha: during bind a simple strategy for bind is always flush immediately
    // todo:
    //  (1). determine whether this should be the behavior
    //  (2). if not, then fix tests to reflect the changes/scheduler to properly yield all with aurelia.start().wait()
    const shouldQueueFlush = (flags & LifecycleFlags.fromBind) === 0 && (targetObserver.type & AccessorType.Layout) > 0;
    if (shouldQueueFlush) {
      flags |= LifecycleFlags.noTargetObserverQueue;
      this.task?.cancel();
      this.task = this.$scheduler.queueRenderTask(() => {
        (targetObserver as unknown as INodeAccessor).flushChanges?.(flags);
        this.task = null;
      }, queueTaskOptions);
    }
    targetObserver.setValue(results.join(''), flags);
  }

  public $bind(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind(flags);
    }
    this.isBound = true;
    this.$scope = scope;
    const partBindings = this.partBindings;
    for (let i = 0, ii = partBindings.length; ii > i; ++i) {
      partBindings[i].$bind(flags, scope, hostScope);
    }
    this.updateTarget(void 0, flags);
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    this.$scope = void 0;
    const task = this.task;
    const partBindings = this.partBindings;
    for (let i = 0, ii = partBindings.length; i < ii; ++i) {
      partBindings[i].interceptor.$unbind(flags);
    }
    if (task != null) {
      task.cancel();
      this.task = null;
    }
  }

  public dispose(): void {
    this.interceptor
      = this.interpolation
      = this.locator
      = this.target
      = (void 0)!;
  }
}

// a pseudo binding, part of a larger interpolation binding
// employed to support full expression per expression part of an interpolation
// note: ContentBinding name is used so signal that in a future version, we may add support
// for more than just string part in interpolation.
// consider the following example:
// <div>${start} to ${end}</div>
// `start` and `end` could be more than strings
// if `start` returns <span>Start</span>, `end` returns <span>End</span> (html elements)
// then the final result:
// <div><span>Start</span> to <span>End</span></div>
// this composability is similar to how FAST is doing, and quite familiar with VDOM libs component props
export interface ContentBinding extends IConnectableBinding {}

@connectable()
export class ContentBinding implements ContentBinding {
  public interceptor: this = this;

  // at runtime, mode may be overriden by binding behavior
  // but it wouldn't matter here, just start with something for later check
  public readonly mode: BindingMode = BindingMode.toView;
  public value: unknown = '';
  public isBound: boolean = false;
  public $scope?: IScope = void 0;
  public $hostScope: IScope | null = null;

  public constructor(
    public readonly sourceExpression: IsExpression,
    public readonly target: object,
    public readonly targetProperty: string,
    public readonly locator: IServiceLocator,
    public readonly observerLocator: IObserverLocator,
    public readonly owner: MultiInterpolationBinding,
  ) {

  }

  // deepscan-disable-next-line
  public updateTarget(value: unknown, flags: LifecycleFlags): void {
    // intentionally empty
    // used to support typing
  }

  public handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }
    const sourceExpression = this.sourceExpression;
    const canOptimize = sourceExpression.$kind !== ExpressionKind.AccessScope || this.observerSlots > 1;
    if (!canOptimize) {
      const shouldConnect = (this.mode & toView) > 0;
      if (shouldConnect) {
        this.version++;
      }
      newValue = sourceExpression.evaluate(flags, this.$scope!, this.$hostScope, this.locator, shouldConnect ? this.interceptor : null);
      if (shouldConnect) {
        this.interceptor.unobserve(false);
      }
    }
    if (newValue != this.value) {
      this.value = newValue;
      this.owner.updateTarget(newValue, flags);
    }
  }

  public $bind(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind(flags);
    }

    this.isBound = true;
    this.$scope = scope;
    this.$hostScope = hostScope;

    if (this.sourceExpression.hasBind) {
      this.sourceExpression.bind(flags, scope, hostScope, this.interceptor as IIndexable & this);
    }

    this.value = this.sourceExpression.evaluate(
      flags,
      scope,
      hostScope,
      this.locator,
      (this.mode & toView) > 0 ?  this.interceptor : null,
    );
  }

  public $unbind(flags: LifecycleFlags) : void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;

    if (this.sourceExpression.hasUnbind) {
      this.sourceExpression.unbind(flags, this.$scope!, this.$hostScope, this.interceptor);
    }

    this.$scope = void 0;
    this.$hostScope = null;
    this.interceptor.unobserve(true);
  }
}
