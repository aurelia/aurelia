import { IPlatform } from '@aurelia/kernel';
import { bindingBehavior, BindingInterceptor, LifecycleFlags } from '@aurelia/runtime';

import type { ITask, QueueTaskOptions, TaskQueue } from '@aurelia/kernel';
import type { BindingBehaviorExpression, IInterceptableBinding, IsAssign, Scope } from '@aurelia/runtime';

export class DebounceBindingBehavior extends BindingInterceptor {
  private readonly taskQueue: TaskQueue;
  private readonly opts: QueueTaskOptions = { delay: 0 };
  private readonly firstArg: IsAssign | null = null;
  private task: ITask | null = null;

  public constructor(
    binding: IInterceptableBinding,
    expr: BindingBehaviorExpression,
  ) {
    super(binding, expr);
    this.taskQueue = binding.locator.get(IPlatform).taskQueue;
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
    // Queue the new one before canceling the old one, to prevent early yield
    const task = this.task;
    this.task = this.taskQueue.queueTask(() => {
      this.task = null;
      return callback();
    }, this.opts);
    task?.cancel();
  }

  public $bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null): void {
    if (this.firstArg !== null) {
      const delay = Number(this.firstArg.evaluate(flags, scope, hostScope, this.locator, null));
      if (!isNaN(delay)) {
        this.opts.delay = delay;
      }
    }
    this.binding.$bind(flags, scope, hostScope);
  }

  public $unbind(flags: LifecycleFlags): void {
    this.task?.cancel();
    this.task = null;
    this.binding.$unbind(flags);
  }
}

bindingBehavior('debounce')(DebounceBindingBehavior);
