import { AccessorType, BindingMode, connectable, ExpressionKind, LifecycleFlags } from '@aurelia/runtime';
import { BindingTargetSubscriber } from './binding-utils.js';

import type { IServiceLocator, ITask, QueueTaskOptions, TaskQueue } from '@aurelia/kernel';
import type {
  AccessorOrObserver,
  ForOfStatement,
  IConnectableBinding,
  IObserver,
  IObserverLocator,
  IPartialConnectableBinding,
  IsBindingBehavior,
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
  }

  public updateTarget(value: unknown, flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    this.targetObserver!.setValue(value, flags, this.target, this.targetProperty);
  }

  public updateSource(value: unknown, flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    this.sourceExpression.assign!(flags, this.$scope!, this.locator, value);
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
    let shouldConnect: boolean = false;

    // if the only observable is an AccessScope then we can assume the passed-in newValue is the correct and latest value
    if (sourceExpression.$kind !== ExpressionKind.AccessScope || obsRecord.count > 1) {
      // todo: in VC expressions, from view also requires connect
      shouldConnect = this.mode > oneTime;
      if (shouldConnect) {
        obsRecord.version++;
      }
      newValue = sourceExpression.evaluate(flags, $scope!, locator, interceptor);
      if (shouldConnect) {
        obsRecord.clear(false);
      }
    }

    if (shouldQueueFlush) {
      // Queue the new one before canceling the old one, to prevent early yield
      task = this.task;
      this.task = this.taskQueue.queueTask(() => {
        interceptor.updateTarget(newValue, flags);
        this.task = null;
      }, updateTaskOpts);
      task?.cancel();
      task = null;
    } else {
      interceptor.updateTarget(newValue, flags);
    }
  }

  public $bind(flags: LifecycleFlags, scope: Scope): void {
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

    let sourceExpression = this.sourceExpression;
    if (sourceExpression.hasBind) {
      sourceExpression.bind(flags, scope, this.interceptor);
    }

    const observerLocator = this.observerLocator;
    const $mode = this.mode;
    let targetObserver = this.targetObserver;
    if (!targetObserver) {
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
        sourceExpression.evaluate(flags, scope, this.locator, shouldConnect ? interceptor : null),
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
      this.sourceExpression.unbind(flags, this.$scope!, this.interceptor);
    }

    this.$scope = void 0;

    task = this.task;
    if (this.targetSubscriber) {
      (this.targetObserver as IObserver).unsubscribe(this.targetSubscriber);
    }
    if (task != null) {
      task.cancel();
      task = this.task = null;
    }
    this.obs.clear(true);

    this.isBound = false;
  }
}

connectable(PropertyBinding);

let task: ITask | null = null;
