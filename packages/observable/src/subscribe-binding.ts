import { AccessorType, connectable, IAccessor } from '@aurelia/runtime';
import { LifecycleFlags } from "@aurelia/runtime-html";
import type { IServiceLocator, ITask, QueueTaskOptions, TaskQueue } from "@aurelia/kernel";
import type {
  AnyBindingExpression,
  Scope,
  IObserverLocator,
  ISubscriber
} from '@aurelia/runtime';
import type { IAstBasedBinding } from "@aurelia/runtime-html";

export interface SubscribeBinding extends IAstBasedBinding { }

export class SubscribeBinding implements ISubscriber {
  public interceptor = this;
  public value: any;
  public $scope?: Scope;
  public isBound = false;

  private task: ITask | null = null;
  private targetObserver: IAccessor | null = null;

  public persistentFlags: LifecycleFlags = LifecycleFlags.none;

  public constructor(
    public sourceExpression: AnyBindingExpression,
    public target: any,
    public prop: string,
    public locator: IServiceLocator,
    public readonly oL: IObserverLocator,
    /** @internal */ private readonly _taskQueue: TaskQueue,
  ) { }

  public updateTarget(value: unknown, flags: LifecycleFlags): void {
    flags |= this.persistentFlags;
    this.targetObserver!.setValue(value, flags, this.target, this.prop);
  }

  public updateSource() {
    throw new Error('Stream binding is one way.');
  }

  public handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void {
    if (!this.isBound)
      return;
    this.obs.version++;
    newValue = this.sourceExpression.evaluate(flags, this.$scope!, this.locator, this);
    this.obs.clear();

    const shouldQueueFlush = (flags & LifecycleFlags.fromBind) === 0 && (this.targetObserver!.type & AccessorType.Layout) > 0;
    let task: ITask | null;
    if (shouldQueueFlush) {
      // Queue the new one before canceling the old one, to prevent early yield
      task = this.task;
      this.task = this._taskQueue.queueTask(() => {
        this.interceptor.updateTarget(newValue, flags);
        this.task = null;
      }, updateTaskOpts);
      task?.cancel();
    } else {
      this.interceptor.updateTarget(newValue, flags);
    }
  }

  public $bind(flags: LifecycleFlags, scope: Scope): void {
    if (this.isBound) {
      if (scope === this.$scope) {
        return;
      }
      this.interceptor.$unbind(flags | LifecycleFlags.fromBind);
    }
    this.isBound = true;
    this.$scope = scope;
    this.targetObserver = this.oL.getAccessor(this.target, this.prop);
    this.interceptor.updateTarget(
      this.value = this.sourceExpression.evaluate(flags, scope, this.locator, this),
      flags,
    );
    this.target[this.prop] = this.value;
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

    const task = this.task;
    if (task != null) {
      task.cancel();
      this.task = null;
    }
    this.obs.clearAll();

    this.isBound = false;
  }
}
connectable(SubscribeBinding);

const updateTaskOpts: QueueTaskOptions = {
  reusable: false,
  preempt: true,
};
