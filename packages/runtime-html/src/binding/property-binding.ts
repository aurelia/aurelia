import { AccessorType, connectable } from '@aurelia/runtime';
import { IFlushQueue, astEvaluator, BindingTargetSubscriber } from './binding-utils';
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

  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

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

  public handleChange(): void {
    if (!this.isBound) {
      return;
    }

    const shouldQueueFlush = this._controller.state !== State.activating && (this.targetObserver!.type & AccessorType.Layout) > 0;
    const obsRecord = this.obs;
    let shouldConnect: boolean = false;

    shouldConnect = this.mode > BindingMode.oneTime;
    if (shouldConnect) {
      obsRecord.version++;
    }
    const newValue = this.ast.evaluate(this.$scope!, this, this.interceptor);
    if (shouldConnect) {
      obsRecord.clear();
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

  // todo: based off collection and handle update accordingly instead off always start
  public handleCollectionChange(): void {
    this.handleChange();
  }

  public $bind(scope: Scope): void {
    if (this.isBound) {
      if (this.$scope === scope) {
        return;
      }
      this.interceptor.$unbind();
    }

    this.$scope = scope;

    let ast = this.ast;
    if (ast.hasBind) {
      ast.bind(scope, this.interceptor);
    }

    const observerLocator = this.oL;
    const $mode = this.mode;
    let targetObserver = this.targetObserver;
    if (!targetObserver) {
      if ($mode & BindingMode.fromView) {
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
    const shouldConnect = ($mode & BindingMode.toView) > 0;

    if ($mode & (BindingMode.toView | BindingMode.oneTime)) {
      interceptor.updateTarget(
        ast.evaluate(scope, this, shouldConnect ? interceptor : null),
      );
    }

    if ($mode & BindingMode.fromView) {
      (targetObserver as IObserver).subscribe(this.targetSubscriber ??= new BindingTargetSubscriber(interceptor, this.locator.get(IFlushQueue)));
      if (!shouldConnect) {
        interceptor.updateSource(targetObserver.getValue(this.target, this.targetProperty));
      }
    }

    this.isBound = true;
  }

  public $unbind(): void {
    if (!this.isBound) {
      return;
    }

    if (this.ast.hasUnbind) {
      this.ast.unbind(this.$scope!, this.interceptor);
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
