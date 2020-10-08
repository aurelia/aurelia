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
  IAccessor,
} from '../observation';
import { IObserverLocator } from '../observation/observer-locator';
import { Interpolation, IsExpression } from './ast';
import {
  connectable,
  IConnectableBinding,
  IPartialConnectableBinding,
} from './connectable';

const { toView, oneTime } = BindingMode;

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
    const staticParts = this.interpolation.parts;
    const results: unknown[] = [];
    let len = 0;
    let interceptedBinding: ContentBinding | undefined;
    for (let i = 0, ii = staticParts.length; i < ii; i++) {
      if (i % 2 === 0) {
        results[len++] = staticParts[i];
      } else {
        const pseudoBinding = this.partBindings[i];
        if (interceptedBinding === void 0 && pseudoBinding.interceptor !== pseudoBinding) {
          interceptedBinding = pseudoBinding;
        }
        results[len++] = pseudoBinding.value;
      }
    }

    this.task?.cancel();
    if (interceptedBinding !== void 0 && interceptedBinding.updateTarget !== interceptedBinding.interceptor.updateTarget) {
      interceptedBinding.interceptor.updateTarget(results.join(''), flags);
      return;
    }

    const targetObserver = this.targetObserver;
    // Alpha: during bind a simple strategy for bind is always flush immediately
    // todo:
    //  (1). determine whether this should be the behavior
    //  (2). if not, then fix tests to reflect the changes/scheduler to properly yield all with aurelia.start().wait()
    const shouldQueueFlush = (flags & LifecycleFlags.fromBind) === 0 && (targetObserver.type & AccessorType.Layout) > 0;
    if (shouldQueueFlush) {
      this.task = this.$scheduler.queueRenderTask(() => {
        (targetObserver as unknown as INodeAccessor).flushChanges(flags);
        this.task = null;
      }, queueTaskOptions);
    }
    targetObserver.setValue(results.join(''), flags | LifecycleFlags.noTargetObserverQueue);
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
    const parts = this.partBindings;
    for (let i = 0, ii = parts.length; i < ii; ++i) {
      parts[i].interceptor.$unbind(flags);
    }
    if (task != null) {
      task.cancel();
      this.task = null;
    }
  }

  public dispose(): void {
    this.interceptor = (void 0)!;
    this.interpolation = (void 0)!;
    this.locator = (void 0)!;
    this.target = (void 0)!;
  }
}

// a pseudo binding, part of a larger interpolation binding
// employed to support full expression per expression part of an interpolation
// note: ContentBinding name is used so signal that in a future version, we may add support
// for more than just string part in interpolation.
// consider the following example:
// <div>${start} to ${end}</div>
// `start` and `end` could be more than strings
// if `start` returns `<span>Start</span>`, `end` returns `<span>End</span>`
// the final result:
// <div><span>Start</span> to <span>End</span>
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

  // if the source expression supplies a target observer
  // the master MultiInterpolationBinding will use this target observer to update
  // instead of its own default targetObserver
  public targetObserver?: IBindingTargetAccessor;

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
      newValue = sourceExpression.evaluate(flags, this.$scope!, this.$hostScope, this.locator, this.interceptor);
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

    if (this.targetObserver?.bind) {
      this.targetObserver.bind(flags);
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

    if (this.targetObserver?.unbind) {
      this.targetObserver.unbind(flags);
    }

    this.$scope = void 0;
    this.$hostScope = null;
    this.interceptor.unobserve(true);
  }
}

export interface InterpolationBinding extends IConnectableBinding {}

@connectable()
export class InterpolationBinding implements IPartialConnectableBinding {
  public interceptor: this = this;

  public id!: number;
  public $scope?: IScope;
  public $hostScope: IScope | null = null;
  public $scheduler: IScheduler;
  public task: ITask | null = null;
  public isBound: boolean = false;

  public targetObserver: IBindingTargetAccessor;
  public value: unknown;

  public constructor(
    public sourceExpression: IsExpression,
    public interpolation: Interpolation,
    public target: object,
    public targetProperty: string,
    public mode: BindingMode,
    public observerLocator: IObserverLocator,
    public locator: IServiceLocator,
    public isFirst: boolean,
  ) {
    connectable.assignIdTo(this);

    this.$scheduler = locator.get(IScheduler);
    this.targetObserver = observerLocator.getAccessor(LifecycleFlags.none, target, targetProperty);
  }

  public updateTarget(value: unknown, flags: LifecycleFlags): void {
    this.targetObserver.setValue(value, flags | LifecycleFlags.updateTargetInstance);
  }

  public handleChange(_newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    const targetObserver = this.targetObserver;
    // Alpha: during bind a simple strategy for bind is always flush immediately
    // todo:
    //  (1). determine whether this should be the behavior
    //  (2). if not, then fix tests to reflect the changes/scheduler to properly yield all with aurelia.start().wait()
    const shouldQueueFlush = (flags & LifecycleFlags.fromBind) === 0 && (targetObserver.type & AccessorType.Layout) > 0;
    const newValue = this.interpolation.evaluate(flags, this.$scope!, this.$hostScope, this.locator, null);
    const oldValue = targetObserver.getValue();
    const interceptor = this.interceptor;

    // todo(fred): maybe let the observer decides whether it updates
    if (newValue !== oldValue) {
      if (shouldQueueFlush) {
        flags |= LifecycleFlags.noTargetObserverQueue;

        this.task?.cancel();
        this.task = this.$scheduler.queueRenderTask(() => {
          (targetObserver as Partial<INodeAccessor>).flushChanges?.(flags);
          this.task = null;
        }, queueTaskOptions);
      }

      interceptor.updateTarget(newValue, flags);
    }

    // todo: merge this with evaluate above
    if ((this.mode & oneTime) === 0) {
      this.version++;
      this.sourceExpression.connect(flags, this.$scope!, this.$hostScope, interceptor);
      interceptor.unobserve(false);
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

    const sourceExpression = this.sourceExpression;
    if (sourceExpression.hasBind) {
      sourceExpression.bind(flags, scope, hostScope, this.interceptor as IIndexable & this);
    }

    const targetObserver = this.targetObserver;
    const mode = this.mode;

    if (mode !== BindingMode.oneTime && targetObserver.bind) {
      targetObserver.bind(flags);
    }

    // since the interpolation already gets the whole value, we only need to let the first
    // text binding do the update if there are multiple
    if (this.isFirst) {
      this.interceptor.updateTarget(this.interpolation.evaluate(flags, scope, hostScope, this.locator, null), flags);
    }
    if ((mode & toView) > 0) {
      sourceExpression.connect(flags, scope, hostScope, this.interceptor);
    }
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;

    const sourceExpression = this.sourceExpression;
    const targetObserver = this.targetObserver;
    const task = this.task;

    if (sourceExpression.hasUnbind) {
      sourceExpression.unbind(flags, this.$scope!, this.$hostScope, this.interceptor);
    }

    if (targetObserver.unbind) {
      targetObserver.unbind(flags);
    }

    if (task != null) {
      task.cancel();
      this.task = null;
    }

    this.$scope = void 0;
    this.interceptor.unobserve(true);
  }

  public dispose(): void {
    this.interceptor = (void 0)!;
    this.sourceExpression = (void 0)!;
    this.locator = (void 0)!;
    this.targetObserver = (void 0)!;
  }
}
