import { AccessorType, BindingMode, connectable, ExpressionKind, LifecycleFlags } from '@aurelia/runtime';

import type { IServiceLocator, ITask, QueueTaskOptions, TaskQueue } from '@aurelia/kernel';
import type {
  AccessorOrObserver,
  ForOfStatement,
  IConnectableBinding,
  IObserver,
  IObserverLocator,
  IPartialConnectableBinding,
  IsBindingBehavior,
  ISubscriber,
  Scope,
} from '@aurelia/runtime';

// BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
const { oneTime, toView, fromView } = BindingMode;

// pre-combining flags for bitwise checks is a minor perf tweak
const toViewOrOneTime = toView | oneTime;

export interface PropertyBinding extends IConnectableBinding {}

const updateTaskOpts: QueueTaskOptions = {
  reusable: false,
  preempt: true,
};

export class PropertyBinding implements IPartialConnectableBinding {
  public interceptor: this = this;

  public isBound: boolean = false;
  public $scope?: Scope = void 0;
  public $hostScope: Scope | null = null;

  public targetObserver?: AccessorOrObserver = void 0;

  public persistentFlags: LifecycleFlags = LifecycleFlags.none;

  private task: ITask | null = null;
  private targetSubscriber: BindingTargetSubscriber | null = null;

  public constructor(
    public sourceExpression: IsBindingBehavior | ForOfStatement,
    public target: object,
    public targetProperty: string,
    public mode: BindingMode,
    public observerLocator: IObserverLocator,
    public locator: IServiceLocator,
    private readonly taskQueue: TaskQueue,
  ) {
    connectable.assignIdTo(this);
  }

  public updateTarget(value: unknown, flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    this.targetObserver!.setValue(value, flags, this.target, this.targetProperty);
  }

  public updateSource(value: unknown, flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    this.sourceExpression.assign!(flags, this.$scope!, this.$hostScope, this.locator, value);
  }

  public handleChange(newValue: unknown, _previousValue: unknown, flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    flags |= this.persistentFlags;

    const targetObserver = this.targetObserver!;
    const interceptor = this.interceptor;
    const sourceExpression = this.sourceExpression;
    const $scope = this.$scope;
    const locator = this.locator;

    // Alpha: during bind a simple strategy for bind is always flush immediately
    // todo:
    //  (1). determine whether this should be the behavior
    //  (2). if not, then fix tests to reflect the changes/platform to properly yield all with aurelia.start()
    const shouldQueueFlush = (flags & LifecycleFlags.fromBind) === 0 && (targetObserver.type & AccessorType.Layout) > 0;
    const obsRecord = this.obs;

    // if the only observable is an AccessScope then we can assume the passed-in newValue is the correct and latest value
    if (sourceExpression.$kind !== ExpressionKind.AccessScope || obsRecord.count > 1) {
      // todo: in VC expressions, from view also requires connect
      const shouldConnect = this.mode > oneTime;
      if (shouldConnect) {
        obsRecord.version++;
      }
      newValue = sourceExpression.evaluate(flags, $scope!, this.$hostScope, locator, interceptor);
      if (shouldConnect) {
        obsRecord.clear(false);
      }
    }

    if (shouldQueueFlush) {
      this.task?.cancel();
      this.task = this.taskQueue.queueTask(() => {
        interceptor.updateTarget(newValue, flags);
        this.task = null;
      }, updateTaskOpts);
    } else {
      interceptor.updateTarget(newValue, flags);
    }
    return;
  }

  public $bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind(flags | LifecycleFlags.fromBind);
    }
    // Force property binding to always be strict
    flags |= LifecycleFlags.isStrictBindingStrategy;

    // Store flags which we can only receive during $bind and need to pass on
    // to the AST during evaluate/connect/assign
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;

    this.$scope = scope;
    this.$hostScope = hostScope;

    let sourceExpression = this.sourceExpression;
    if (sourceExpression.hasBind) {
      sourceExpression.bind(flags, scope, hostScope, this.interceptor);
    }

    const $mode = this.mode;
    let targetObserver = this.targetObserver;
    if (!targetObserver) {
      const observerLocator = this.observerLocator;
      if ($mode & fromView) {
        targetObserver = observerLocator.getObserver(this.target, this.targetProperty);
      } else {
        targetObserver = observerLocator.getAccessor(this.target, this.targetProperty);
      }
      this.targetObserver = targetObserver;
    }

    // during bind, binding behavior might have changed sourceExpression
    // deepscan-disable-next-line
    sourceExpression = this.sourceExpression;
    const interceptor = this.interceptor;

    const shouldConnect = ($mode & toView) > 0;
    if ($mode & toViewOrOneTime) {
      interceptor.updateTarget(
        sourceExpression.evaluate(flags, scope, this.$hostScope, this.locator, shouldConnect ? interceptor : null),
        flags,
      );
    }
    if ($mode & fromView) {
      (targetObserver as IObserver).subscribe(this.targetSubscriber ??= new BindingTargetSubscriber(interceptor));
      if (!shouldConnect) {
        interceptor.updateSource(targetObserver.getValue(this.target, this.targetProperty), flags);
      }
    }

    this.isBound = true;
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    this.persistentFlags = LifecycleFlags.none;

    if (this.sourceExpression.hasUnbind) {
      this.sourceExpression.unbind(flags, this.$scope!, this.$hostScope, this.interceptor);
    }

    this.$scope = void 0;
    this.$hostScope = null;

    const task = this.task;

    if (this.targetSubscriber) {
      (this.targetObserver as IObserver).unsubscribe(this.targetSubscriber);
    }
    if (task != null) {
      task.cancel();
      this.task = null;
    }
    this.obs.clear(true);

    this.isBound = false;
  }
}

connectable(PropertyBinding);

/**
 * A subscriber that is used for subcribing to target observer & invoking `updateSource` on a PropertyBinding
 */
class BindingTargetSubscriber implements ISubscriber {
  public constructor(
    private readonly b: PropertyBinding,
  ) {}

  // deepscan-disable-next-line
  public handleChange(value: unknown, _: unknown, flags: LifecycleFlags) {
    const b = this.b;
    if (value !== b.sourceExpression.evaluate(flags, b.$scope!, b.$hostScope, b.locator, null)) {
      b.updateSource(value, flags);
    }
  }
}
