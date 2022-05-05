import { IPlatform } from '@aurelia/kernel';
import { bindingBehavior, BindingInterceptor, LifecycleFlags } from '@aurelia/runtime';

import type { ITask, QueueTaskOptions, TaskQueue } from '@aurelia/platform';
import type { BindingBehaviorExpression, IInterceptableBinding, IsAssign, Scope } from '@aurelia/runtime';

const defaultDelay = 200;

// A binding behavior that limits
// - (v1) the rate at which the view-model is updated in two-way bindings, OR
// - (v1 + v2) the rate at which the view is updated in to-view binding scenarios.
export class ThrottleBindingBehavior extends BindingInterceptor {
  private readonly _taskQueue: TaskQueue;
  private readonly _platform: IPlatform;
  private readonly opts: QueueTaskOptions = { delay: defaultDelay };
  private readonly firstArg: IsAssign | null = null;
  private task: ITask | null = null;
  private lastCall: number = 0;
  private delay: number = 0;

  public constructor(
    binding: IInterceptableBinding,
    expr: BindingBehaviorExpression,
  ) {
    super(binding, expr);
    this._platform = binding.locator.get(IPlatform);
    this._taskQueue = this._platform.taskQueue;
    if (expr.args.length > 0) {
      this.firstArg = expr.args[0];
    }
  }

  public callSource(args: object): unknown {
    this._queueTask(() => this.binding.callSource!(args));
    return void 0;
  }

  public handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void {
    // when source has changed before the latest throttled value from target
    // then discard that value, and take latest value from source only
    if (this.task !== null) {
      this.task.cancel();
      this.task = null;
      this.lastCall = this._platform.performanceNow();
    }
    this.binding.handleChange(newValue, oldValue, flags);
  }

  public updateSource(newValue: unknown, flags: LifecycleFlags): void {
    this._queueTask(() => this.binding.updateSource!(newValue, flags));
  }

  private _queueTask(callback: () => void): void {
    const opts = this.opts;
    const platform = this._platform;
    const nextDelay = this.lastCall + opts.delay! - platform.performanceNow();

    if (nextDelay > 0) {
      // Queue the new one before canceling the old one, to prevent early yield
      const task = this.task;
      opts.delay = nextDelay;
      this.task = this._taskQueue.queueTask(() => {
        this.lastCall = platform.performanceNow();
        this.task = null;
        opts.delay = this.delay;
        callback();
      }, opts);

      task?.cancel();
    } else {
      this.lastCall = platform.performanceNow();
      callback();
    }
  }

  public $bind(flags: LifecycleFlags, scope: Scope): void {
    if (this.firstArg !== null) {
      const delay = Number(this.firstArg.evaluate(flags, scope, this.locator, null));
      this.opts.delay = this.delay = isNaN(delay) ? defaultDelay : delay;
    }
    this.binding.$bind(flags, scope);
  }

  public $unbind(flags: LifecycleFlags): void {
    this.task?.cancel();
    this.task = null;
    super.$unbind(flags);
  }
}

bindingBehavior('throttle')(ThrottleBindingBehavior);
