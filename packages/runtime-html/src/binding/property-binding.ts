import { AccessorType, astAssign, astBind, astEvaluate, astUnbind, connectable, IAstEvaluator, IBinding, IConnectableBinding, ISubscriber } from '@aurelia/runtime';
import { State } from '../templating/controller';
import { BindingTargetSubscriber, IFlushQueue, mixinAstEvaluator, mixinUseScope, mixingBindingLimited } from './binding-utils';
import { fromView, oneTime, toView } from './interfaces-bindings';

import type { IServiceLocator } from '@aurelia/kernel';
import type { ITask, QueueTaskOptions, TaskQueue } from '@aurelia/platform';
import type {
  AccessorOrObserver,
  ForOfStatement,
  IObserver,
  IObserverLocator,
  IsBindingBehavior,
  Scope,
} from '@aurelia/runtime';
import type { BindingMode, IBindingController } from './interfaces-bindings';
import { createMappedError, ErrorNames } from '../errors';

export interface PropertyBinding extends IAstEvaluator, IConnectableBinding {}

export class PropertyBinding implements IBinding {
  public isBound: boolean = false;

  /** @internal */
  public _scope?: Scope = void 0;

  /** @internal */
  private _targetObserver?: AccessorOrObserver = void 0;

  /** @internal */
  private _task: ITask | null = null;

  /** @internal */
  private _targetSubscriber: ISubscriber | null = null;

  /**
   * A semi-private property used by connectable mixin
   *
   * @internal
   */
  public readonly oL: IObserverLocator;

  /** @internal */
  public l: IServiceLocator;

  /** @internal */
  private readonly _controller: IBindingController;

  /** @internal */
  private readonly _taskQueue: TaskQueue;

  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  public constructor(
    controller: IBindingController,
    locator: IServiceLocator,
    observerLocator: IObserverLocator,
    taskQueue: TaskQueue,
    public ast: IsBindingBehavior | ForOfStatement,
    public target: object,
    public targetProperty: string,
    public mode: BindingMode,
  ) {
    this.l = locator;
    this._controller = controller;
    this._taskQueue = taskQueue;
    this.oL = observerLocator;
  }

  public updateTarget(value: unknown): void {
    this._targetObserver!.setValue(value, this.target, this.targetProperty);
  }

  public updateSource(value: unknown): void {
    astAssign(this.ast, this._scope!, this, value);
  }

  public handleChange(): void {
    if (!this.isBound) {
      /* istanbul-ignore-next */
      return;
    }

    this.obs.version++;
    const newValue = astEvaluate(
      this.ast,
      this._scope!,
      this,
      // should observe?
      (this.mode & toView) > 0 ? this : null
    );
    this.obs.clear();

    const shouldQueueFlush = this._controller.state !== State.activating && (this._targetObserver!.type & AccessorType.Layout) > 0;
    if (shouldQueueFlush) {
      // Queue the new one before canceling the old one, to prevent early yield
      task = this._task;
      this._task = this._taskQueue.queueTask(() => {
        this.updateTarget(newValue);
        this._task = null;
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

  public bind(scope: Scope): void {
    if (this.isBound) {
      if (this._scope === scope) {
      /* istanbul-ignore-next */
        return;
      }
      this.unbind();
    }
    this._scope = scope;

    astBind(this.ast, scope, this);

    const observerLocator = this.oL;
    const $mode = this.mode;
    let targetObserver = this._targetObserver;
    if (!targetObserver) {
      if ($mode & fromView) {
        targetObserver = observerLocator.getObserver(this.target, this.targetProperty);
      } else {
        targetObserver = observerLocator.getAccessor(this.target, this.targetProperty);
      }
      this._targetObserver = targetObserver;
    }

    const shouldConnect = ($mode & toView) > 0;

    if ($mode & (toView | oneTime)) {
      this.updateTarget(
        astEvaluate(this.ast, this._scope, this, shouldConnect ? this : null),
      );
    }

    if ($mode & fromView) {
      (targetObserver as IObserver).subscribe(this._targetSubscriber ??= new BindingTargetSubscriber(this, this.l.get(IFlushQueue)));
      if (!shouldConnect) {
        this.updateSource(targetObserver.getValue(this.target, this.targetProperty));
      }
    }

    this.isBound = true;
  }

  public unbind(): void {
    if (!this.isBound) {
      /* istanbul-ignore-next */
      return;
    }
    this.isBound = false;

    astUnbind(this.ast, this._scope!, this);

    this._scope = void 0;

    if (this._targetSubscriber) {
      (this._targetObserver as IObserver).unsubscribe(this._targetSubscriber);
      this._targetSubscriber = null;
    }
    this._task?.cancel();
    this._task = null;
    this.obs.clearAll();
  }

  /**
   * Start using a given observer to listen to changes on the target of this binding
   */
  public useTargetObserver(observer: IObserver): void {
    (this._targetObserver as IObserver)?.unsubscribe(this);
    (this._targetObserver = observer).subscribe(this);
  }

  /**
   * Provide a subscriber for target change observation.
   *
   * Binding behaviors can use this to setup custom observation handling during bind lifecycle
   * to alter the update source behavior during bind phase of this binding.
   */
  public useTargetSubscriber(subscriber: ISubscriber): void {
    if (this._targetSubscriber != null) {
      throw createMappedError(ErrorNames.binding_already_has_target_subscriber);
    }
    this._targetSubscriber = subscriber;
  }
}

mixinUseScope(PropertyBinding);
mixingBindingLimited(PropertyBinding, (propBinding: PropertyBinding) => (propBinding.mode & fromView) ? 'updateSource' : 'updateTarget');
connectable(PropertyBinding);
mixinAstEvaluator(true, false)(PropertyBinding);

let task: ITask | null = null;

const updateTaskOpts: QueueTaskOptions = {
  reusable: false,
  preempt: true,
};
