import { IPlatform } from '@aurelia/kernel';
import { bindingBehavior, BindingInterceptor, IInterceptableBinding } from '../binding-behavior';

import type { ITask, QueueTaskOptions, TaskQueue } from '@aurelia/platform';
import type { BindingBehaviorExpression, IsAssign, Scope } from '@aurelia/runtime';

const defaultDelay = 200;

// A binding behavior that limits
// - (v1) the rate at which the view-model is updated in two-way bindings, OR
// - (v1 + v2) the rate at which the view is updated in to-view binding scenarios.
export class ThrottleBindingBehavior extends BindingInterceptor {
  /** @internal */
  private readonly _taskQueue: TaskQueue;
  /** @internal */
  private readonly _platform: IPlatform;
  /** @internal */
  private readonly _opts: QueueTaskOptions = { delay: defaultDelay };
  /** @internal */
  private readonly _firstArg: IsAssign | null = null;
  /** @internal */
  private _task: ITask | null = null;
  /** @internal */
  private _lastCall: number = 0;
  /** @internal */
  private _delay: number = 0;

  public constructor(
    binding: IInterceptableBinding,
    expr: BindingBehaviorExpression,
  ) {
    super(binding, expr);
    this._platform = binding.get(IPlatform);
    this._taskQueue = this._platform.taskQueue;
    if (expr.args.length > 0) {
      this._firstArg = expr.args[0];
    }
  }

  public callSource(args: object): unknown {
    this._queueTask(() => this.binding.callSource!(args));
    return void 0;
  }

  public handleChange(newValue: unknown, oldValue: unknown): void {
    // when source has changed before the latest throttled value from target
    // then discard that value, and take latest value from source only
    if (this._task !== null) {
      this._task.cancel();
      this._task = null;
      this._lastCall = this._platform.performanceNow();
    }
    this.binding.handleChange(newValue, oldValue);
  }

  public updateSource(newValue: unknown): void {
    this._queueTask(() => this.binding.updateSource!(newValue));
  }

  /** @internal */
  private _queueTask(callback: () => void): void {
    const opts = this._opts;
    const platform = this._platform;
    const nextDelay = this._lastCall + opts.delay! - platform.performanceNow();

    if (nextDelay > 0) {
      // Queue the new one before canceling the old one, to prevent early yield
      const task = this._task;
      opts.delay = nextDelay;
      this._task = this._taskQueue.queueTask(() => {
        this._lastCall = platform.performanceNow();
        this._task = null;
        opts.delay = this._delay;
        callback();
      }, opts);

      task?.cancel();
    } else {
      this._lastCall = platform.performanceNow();
      callback();
    }
  }

  public $bind(scope: Scope): void {
    if (this._firstArg !== null) {
      const delay = Number(this._firstArg.evaluate(scope, this, null));
      this._opts.delay = this._delay = isNaN(delay) ? defaultDelay : delay;
    }
    super.$bind(scope);
  }

  public $unbind(): void {
    this._task?.cancel();
    this._task = null;
    super.$unbind();
  }
}

bindingBehavior('throttle')(ThrottleBindingBehavior);
