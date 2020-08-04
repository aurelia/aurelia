import { LifecycleFlags } from '../../flags';
import { IScope } from '../../observation';
import { bindingBehavior, BindingInterceptor, IInterceptableBinding } from '../binding-behavior';
import { ITask, IScheduler, ITaskQueue, QueueTaskOptions, Now } from '@aurelia/scheduler';
import { BindingBehaviorExpression } from '../../binding/ast';
import { IsAssign } from '../../ast';

@bindingBehavior('throttle')
export class ThrottleBindingBehavior extends BindingInterceptor {
  private readonly taskQueue: ITaskQueue;
  private readonly now: Now;
  private readonly opts: QueueTaskOptions = { delay: 0 };
  private readonly firstArg: IsAssign | null = null;
  private task: ITask | null = null;
  private lastCall: number = 0;

  public constructor(
    binding: IInterceptableBinding,
    expr: BindingBehaviorExpression,
  ) {
    super(binding, expr);
    this.taskQueue = binding.locator.get(IScheduler).getPostRenderTaskQueue();
    this.now = binding.locator.get(Now);
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
    const now = this.now;
    const nextDelay = this.lastCall + opts.delay! - now();

    if (nextDelay > 0) {
      if (this.task !== null) {
        this.task.cancel();
      }

      opts.delay = nextDelay;
      this.task = this.taskQueue.queueTask(() => {
        this.lastCall = now();
        callback();
      }, opts);
    } else {
      this.lastCall = now();
      callback();
    }
  }

  public $bind(flags: LifecycleFlags, scope: IScope, part?: string | undefined): void {
    if (this.firstArg !== null) {
      const delay = Number(this.firstArg.evaluate(flags, scope, this.locator, part));
      if (!isNaN(delay)) {
        this.opts.delay = delay;
      }
    }
    this.binding.$bind(flags, scope, part);
  }
}
