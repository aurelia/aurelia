import { AccessorType, connectable, ExpressionKind, IndexMap, LifecycleFlags } from '@aurelia/runtime';
import { astEvaluator, BindingTargetSubscriber } from './binding-utils';
import { State } from '../templating/controller';
import { BindingMode } from './interfaces-bindings';

import type { ITask, QueueTaskOptions, TaskQueue } from '@aurelia/platform';
import type { IServiceLocator } from '@aurelia/kernel';
import type {
  AccessorOrObserver,
  ForOfStatement,
  IObserver,
  IObserverLocator,
  IsBindingBehavior,
  Scope,
} from '@aurelia/runtime';
import type { IAstBasedBinding, IBindingController } from './interfaces-bindings';

// BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
const { oneTime, toView, fromView } = BindingMode;

// pre-combining flags for bitwise checks is a minor perf tweak
const toViewOrOneTime = toView | oneTime;
const updateTaskOpts: QueueTaskOptions = {
  reusable: false,
  preempt: true,
};

export interface PropertyBinding extends IAstBasedBinding {}

export class PropertyBinding implements IAstBasedBinding {
  public interceptor: this = this;

  public isBound: boolean = false;
  public $scope?: Scope = void 0;

  public targetObserver?: AccessorOrObserver = void 0;

  private task: ITask | null = null;
  private targetSubscriber: BindingTargetSubscriber | null = null;

  /**
   * A semi-private property used by connectable mixin
   *
   * @internal
   */
  public readonly oL: IObserverLocator;
  /** @internal */
  private readonly _controller: IBindingController;
  /** @internal */
  private readonly _taskQueue: TaskQueue;

  public constructor(
    controller: IBindingController,
    public locator: IServiceLocator,
    observerLocator: IObserverLocator,
    taskQueue: TaskQueue,
    public ast: IsBindingBehavior | ForOfStatement,
    public target: object,
    public targetProperty: string,
    public mode: BindingMode,
  ) {
    this._controller = controller;
    this._taskQueue = taskQueue;
    this.oL = observerLocator;
  }

  public updateTarget(value: unknown): void {
    this.targetObserver!.setValue(value, this.target, this.targetProperty);
  }

  public updateSource(value: unknown): void {
    this.ast.assign(this.$scope!, this, value);
  }

  public handleChange(newValue: unknown, _previousValue: unknown): void {
    if (!this.isBound) {
      return;
    }

    // Alpha: during bind a simple strategy for bind is always flush immediately
    // todo:
    //  (1). determine whether this should be the behavior
    //  (2). if not, then fix tests to reflect the changes/platform to properly yield all with aurelia.start()
    const shouldQueueFlush = this._controller.state !== State.activating && (this.targetObserver!.type & AccessorType.Layout) > 0;
    const obsRecord = this.obs;
    let shouldConnect: boolean = false;

    // if the only observable is an AccessScope then we can assume the passed-in newValue is the correct and latest value
    if (this.ast.$kind !== ExpressionKind.AccessScope || obsRecord.count > 1) {
      // todo: in VC expressions, from view also requires connect
      shouldConnect = this.mode > oneTime;
      if (shouldConnect) {
        obsRecord.version++;
      }
      newValue = this.ast.evaluate(this.$scope!, this, this.interceptor);
      if (shouldConnect) {
        obsRecord.clear();
      }
    }

    if (shouldQueueFlush) {
      // Queue the new one before canceling the old one, to prevent early yield
      task = this.task;
      this.task = this._taskQueue.queueTask(() => {
        this.interceptor.updateTarget(newValue);
        this.task = null;
      }, updateTaskOpts);
      task?.cancel();
      task = null;
    } else {
      this.interceptor.updateTarget(newValue);
    }
  }

  public handleCollectionChange(_indexMap: IndexMap): void {
    if (!this.isBound) {
      return;
    }
    const shouldQueueFlush = this._controller.state !== State.activating && (this.targetObserver!.type & AccessorType.Layout) > 0;
    this.obs.version++;
    const newValue = this.ast.evaluate(this.$scope!, this, this.interceptor);
    this.obs.clear();
    if (shouldQueueFlush) {
      // Queue the new one before canceling the old one, to prevent early yield
      task = this.task;
      this.task = this._taskQueue.queueTask(() => {
        this.interceptor.updateTarget(newValue);
        this.task = null;
      }, updateTaskOpts);
      task?.cancel();
      task = null;
    } else {
      this.interceptor.updateTarget(newValue);
    }
  }

  public $bind(flags: LifecycleFlags, scope: Scope): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind(flags | LifecycleFlags.fromBind);
    }

    this.$scope = scope;

    let ast = this.ast;
    if (ast.hasBind) {
      ast.bind(flags, scope, this.interceptor);
    }

    const observerLocator = this.oL;
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

    // during bind, binding behavior might have changed ast
    // deepscan-disable-next-line
    ast = this.ast;
    const interceptor = this.interceptor;
    const shouldConnect = ($mode & toView) > 0;

    if ($mode & toViewOrOneTime) {
      interceptor.updateTarget(
        ast.evaluate(scope, this, shouldConnect ? interceptor : null),
      );
    }

    if ($mode & fromView) {
      (targetObserver as IObserver).subscribe(this.targetSubscriber ??= new BindingTargetSubscriber(interceptor));
      if (!shouldConnect) {
        interceptor.updateSource(targetObserver.getValue(this.target, this.targetProperty));
      }
    }

    this.isBound = true;
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this.isBound) {
      return;
    }

    if (this.ast.hasUnbind) {
      this.ast.unbind(flags, this.$scope!, this.interceptor);
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
    this.obs.clearAll();

    this.isBound = false;
  }
}

connectable(PropertyBinding);
astEvaluator(true, false)(PropertyBinding);

let task: ITask | null = null;
