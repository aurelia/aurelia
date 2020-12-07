import { IPlatform } from '@aurelia/kernel';
import { bindingBehavior, BindingInterceptor, LifecycleFlags } from '@aurelia/runtime';

import type { ITask, QueueTaskOptions, TaskQueue } from '@aurelia/kernel';
import type { BindingBehaviorExpression, IInterceptableBinding, IsAssign, Scope } from '@aurelia/runtime';

export class ThrottleBindingBehavior extends BindingInterceptor {
  private readonly taskQueue: TaskQueue;
  private readonly platform: IPlatform;
  private readonly opts: QueueTaskOptions = { delay: 0 };
  private readonly firstArg: IsAssign | null = null;
  private task: ITask | null = null;
  private lastCall: number = 0;

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

  public handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void {
    this.queueTask(() => this.binding.handleChange!(newValue, previousValue, flags));
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
      if (!isNaN(delay)) {
        this.opts.delay = delay;
      }
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
