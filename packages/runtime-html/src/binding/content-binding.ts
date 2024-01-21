import {
  IAstEvaluator,
  IConnectableBinding,
  astBind,
  astEvaluate,
  astUnbind,
  connectable
} from '@aurelia/runtime';
import { activating } from '../templating/controller';
import { toView } from './interfaces-bindings';
import type { IServiceLocator } from '@aurelia/kernel';
import type { ITask, QueueTaskOptions, TaskQueue } from '@aurelia/platform';
import type {
  IBinding, ICollectionSubscriber, IObserverLocator,
  IsExpression, Scope
} from '@aurelia/runtime';
import type { IPlatform } from '../platform';
import { isArray, safeString } from '../utilities';
import type { BindingMode, IBindingController } from './interfaces-bindings';
import { mixinUseScope, mixingBindingLimited, mixinAstEvaluator } from './binding-utils';

const queueTaskOptions: QueueTaskOptions = {
  reusable: false,
  preempt: true,
};

export interface ContentBinding extends IAstEvaluator, IConnectableBinding {}

/**
 * A binding for handling the element content interpolation
 */

export class ContentBinding implements IBinding, ICollectionSubscriber {
  public isBound: boolean = false;

  // at runtime, mode may be overriden by binding behavior
  // but it wouldn't matter here, just start with something for later check
  public readonly mode: BindingMode = toView;

  /** @internal */
  public _scope?: Scope;

  /** @internal */
  public _task: ITask | null = null;

  /**
   * A semi-private property used by connectable mixin
   *
   * @internal
   */
  public readonly oL: IObserverLocator;
  /** @internal */
  private readonly _taskQueue: TaskQueue;

  /** @internal */
  public readonly l: IServiceLocator;

  /** @internal */
  private _value: unknown = '';
  /** @internal */
  private readonly _controller: IBindingController;
  /** @internal */
  private _needsRemoveNode: boolean = false;
  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  public strict = true;

  public constructor(
    controller: IBindingController,
    locator: IServiceLocator,
    observerLocator: IObserverLocator,
    taskQueue: TaskQueue,
    private readonly p: IPlatform,
    public readonly ast: IsExpression,
    public readonly target: Text,
  ) {
    this.l = locator;
    this._controller = controller;
    this.oL = observerLocator;
    this._taskQueue = taskQueue;
  }

  public updateTarget(value: unknown): void {
    const target = this.target;
    const oldValue = this._value;
    this._value = value;
    if (this._needsRemoveNode) {
      (oldValue as Node).parentNode?.removeChild(oldValue as Node);
      this._needsRemoveNode = false;
    }
    if (value instanceof this.p.Node) {
      target.parentNode?.insertBefore(value, target);
      value = '';
      this._needsRemoveNode = true;
    }
    // console.log({ value, type: typeof value });
    target.textContent = safeString(value ?? '');
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
    if (newValue === this._value) {
      // in a frequent update, e.g collection mutation in a loop
      // value could be changing frequently and previous update task may be stale at this point
      // cancel if any task going on because the latest value is already the same
      this._task?.cancel();
      this._task = null;
      return;
    }
    const shouldQueueFlush = this._controller.state !== activating;
    if (shouldQueueFlush) {
      this._queueUpdate(newValue);
    } else {
      this.updateTarget(newValue);
    }
  }

  public handleCollectionChange(): void {
    if (!this.isBound) {
      /* istanbul-ignore-next */
      return;
    }
    this.obs.version++;
    const v = this._value = astEvaluate(
      this.ast,
      this._scope!,
      this,
      (this.mode & toView) > 0 ? this : null
    );
    this.obs.clear();
    if (isArray(v)) {
      this.observeCollection(v);
    }
    const shouldQueueFlush = this._controller.state !== activating;
    if (shouldQueueFlush) {
      this._queueUpdate(v);
    } else {
      this.updateTarget(v);
    }
  }

  public bind(_scope: Scope): void {
    if (this.isBound) {
      if (this._scope === _scope) {
      /* istanbul-ignore-next */
        return;
      }
      this.unbind();
    }
    this._scope = _scope;

    astBind(this.ast, _scope, this);

    const v = this._value = astEvaluate(
      this.ast,
      this._scope,
      this,
      (this.mode & toView) > 0 ? this : null
    );
    if (isArray(v)) {
      this.observeCollection(v);
    }
    this.updateTarget(v);

    this.isBound = true;
  }

  public unbind(): void {
    if (!this.isBound) {
      /* istanbul-ignore-next */
      return;
    }
    this.isBound = false;

    astUnbind(this.ast, this._scope!, this);
    if (this._needsRemoveNode) {
      (this._value as Node).parentNode?.removeChild(this._value as Node);
    }

    // TODO: should existing value (either connected node, or a string)
    // be removed when this binding is unbound?
    // this.updateTarget('');
    this._scope = void 0;
    this.obs.clearAll();
    this._task?.cancel();
    this._task = null;
  }

  // queue a force update
  /** @internal */
  private _queueUpdate(newValue: unknown): void {
    const task = this._task;
    this._task = this._taskQueue.queueTask(() => {
      this._task = null;
      this.updateTarget(newValue);
    }, queueTaskOptions);
    task?.cancel();
  }
}

mixinUseScope(ContentBinding);
mixingBindingLimited(ContentBinding, () => 'updateTarget');
connectable()(ContentBinding);
mixinAstEvaluator(void 0, false)(ContentBinding);
