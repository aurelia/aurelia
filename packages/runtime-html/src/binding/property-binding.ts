import { AccessorType, astAssign, astBind, astEvaluate, astUnbind, connectable, ISubscriber } from '@aurelia/runtime';
import { State } from '../templating/controller';
import { implementAstEvaluator, BindingTargetSubscriber, IFlushQueue, mixingBindingLimited, mixinBindingUseScope } from './binding-utils';
import { BindingMode } from './interfaces-bindings';

import type { IServiceLocator } from '@aurelia/kernel';
import type { ITask, QueueTaskOptions, TaskQueue } from '@aurelia/platform';
import type {
  AccessorOrObserver,
  ForOfStatement,
  IObserver,
  IObserverLocator,
  IsBindingBehavior,
  Scope
} from '@aurelia/runtime';
import type { IAstBasedBinding, IBindingController } from './interfaces-bindings';
import { createError } from '../utilities';

const updateTaskOpts: QueueTaskOptions = {
  reusable: false,
  preempt: true,
};

export interface PropertyBinding extends IAstBasedBinding {}

export class PropertyBinding implements IAstBasedBinding {
  public isBound: boolean = false;
  public scope?: Scope = void 0;

  public targetObserver?: AccessorOrObserver = void 0;

  private task: ITask | null = null;

  /** @internal */
  private _targetSubscriber: ISubscriber | null = null;

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
    astAssign(this.ast, this.scope!, this, value);
  }

  public handleChange(): void {
    if (!this.isBound) {
      return;
    }

    const shouldQueueFlush = this._controller.state !== State.activating && (this.targetObserver!.type & AccessorType.Layout) > 0;
    const shouldConnect = this.mode > BindingMode.oneTime;
    if (shouldConnect) {
      this.obs.version++;
    }
    const newValue = astEvaluate(this.ast, this.scope!, this, this);
    if (shouldConnect) {
      this.obs.clear();
    }

    if (shouldQueueFlush) {
      // Queue the new one before canceling the old one, to prevent early yield
      task = this.task;
      this.task = this._taskQueue.queueTask(() => {
        this.updateTarget(newValue);
        this.task = null;
      }, updateTaskOpts);
      task?.cancel();
      task = null;
    } else {
      this.updateTarget(newValue);
    }
  }

  // todo: based off collection and handle update accordingly instead off always start
  public handleCollectionChange(): void {
    this.handleChange();
  }

  public $bind(scope: Scope): void {
    if (this.isBound) {
      if (this.scope === scope) {
        return;
      }
      this.$unbind();
    }
    this.scope = scope;

    astBind(this.ast, scope, this);

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

    const shouldConnect = ($mode & BindingMode.toView) > 0;

    if ($mode & (BindingMode.toView | BindingMode.oneTime)) {
      this.updateTarget(
        astEvaluate(this.ast, this.scope, this, shouldConnect ? this : null),
      );
    }

    if ($mode & BindingMode.fromView) {
      (targetObserver as IObserver).subscribe(this._targetSubscriber ??= new BindingTargetSubscriber(this, this.locator.get(IFlushQueue)));
      if (!shouldConnect) {
        this.updateSource(targetObserver.getValue(this.target, this.targetProperty));
      }
    }

    this.isBound = true;
  }

  public $unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;

    astUnbind(this.ast, this.scope!, this);

    this.scope = void 0;

    if (this._targetSubscriber) {
      (this.targetObserver as IObserver).unsubscribe(this._targetSubscriber);
      this._targetSubscriber = null;
    }
    if (task != null) {
      task.cancel();
      task = this.task = null;
    }
    this.obs.clearAll();
  }

  /**
   * Provide a subscriber for target change observation.
   *
   * Binding behaviors can use this to setup custom observation handling during bind lifecycle
   * to alter the update source behavior during bind phase of this binding.
   */
  public useTargetSubscriber(subscriber: ISubscriber) {
    if (this._targetSubscriber != null) {
      throw createError(`AURxxxx: binding already has a target subscriber`);
    }
    this._targetSubscriber = subscriber;
  }
}

mixinBindingUseScope(PropertyBinding);
mixingBindingLimited(PropertyBinding, (propBinding: PropertyBinding) => (propBinding.mode & BindingMode.fromView) ? 'updateSource' : 'updateTarget');
connectable(PropertyBinding);
implementAstEvaluator(true, false)(PropertyBinding);

let task: ITask | null = null;
