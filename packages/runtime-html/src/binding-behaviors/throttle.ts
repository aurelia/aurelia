import { IPlatform } from '@aurelia/kernel';
import { bindingBehavior, BindingInterceptor, BindingMode, LifecycleFlags } from '@aurelia/runtime';

import type { ITask, QueueTaskOptions, TaskQueue } from '@aurelia/kernel';
import type { BindingBehaviorExpression, IInterceptableBinding, IsAssign, Scope } from '@aurelia/runtime';

const defaultDelay = 200;

// A binding behavior that limits
// - (v1) the rate at which the view-model is updated in two-way bindings, OR
// - (v1 + v2) the rate at which the view is updated in to-view binding scenarios.
export class ThrottleBindingBehavior extends BindingInterceptor {
  private readonly taskQueue: TaskQueue;
  private readonly platform: IPlatform;
  private readonly opts: QueueTaskOptions = { delay: 0 };
  private readonly firstArg: IsAssign | null = null;
  private task: ITask | null = null;
  private lastCall: number = 0;
  private delay: number = 0;

  public constructor(
    binding: IInterceptableBinding,
    expr: BindingBehaviorExpression,
  ) {
    super(binding, expr);
    this.platform = binding.locator.get(IPlatform);
    this.taskQueue = this.platform.macroTaskQueue;
    if (expr.args.length > 0) {
      this.firstArg = expr.args[0];
    }
  }

  public callSource(args: object): unknown {
    this.queueTask(() => this.binding.callSource!(args));
    return void 0;
  }

  public handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void {
    // when source has changed before the latest throttled value from target
    // then discard that value, and take latest value from source only
    if (this.task !== null) {
      this.task.cancel();
      this.task = null;
      this.lastCall = this.platform.performanceNow();
    }
    this.binding.handleChange(newValue, oldValue, flags);
  }

  public updateSource(newValue: unknown, flags: LifecycleFlags): void {
    this.queueTask(() => this.binding.updateSource!(newValue, flags));
  }

  private queueTask(callback: () => void): void {
    const opts = this.opts;
    const platform = this.platform;
    const nextDelay = this.lastCall + opts.delay! - platform.performanceNow();

    if (nextDelay > 0) {
      if (this.task !== null) {
        this.task.cancel();
      }

      opts.delay = nextDelay;
      this.task = this.taskQueue.queueTask(() => {
        this.lastCall = platform.performanceNow();
        this.task = null;
        opts.delay = this.delay;
        callback();
      }, opts);
    } else {
      this.lastCall = platform.performanceNow();
      callback();
    }
  }

  public $bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null): void {
    if (this.firstArg !== null) {
      const delay = Number(this.firstArg.evaluate(flags,  scope,  hostScope,  this.locator, null));
      this.opts.delay = this.delay = isNaN(delay) ? defaultDelay : delay;
    }
    this.binding.$bind(flags, scope, hostScope);
  }

  public $unbind(flags: LifecycleFlags): void {
    this.task?.cancel();
    this.task = null;
    super.$unbind(flags);
  }
}

bindingBehavior('throttle')(ThrottleBindingBehavior);
