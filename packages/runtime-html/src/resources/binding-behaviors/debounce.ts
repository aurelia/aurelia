import { IPlatform } from '@aurelia/kernel';
import { bindingBehavior, BindingInterceptor, IInterceptableBinding } from '../binding-behavior';

import type { ITask, QueueTaskOptions, TaskQueue } from '@aurelia/platform';
import { astEvaluate, type BindingBehaviorExpression, type IsAssign, type Scope } from '@aurelia/runtime';

const defaultDelay = 200;

//
// A binding behavior that prevents
// - (v1 + v2) the view-model from being updated in two-way binding, OR
// - (v1) the the view from being updated in to-view binding,
// until a specified interval has passed without any changes
//
export class DebounceBindingBehavior extends BindingInterceptor {
  /** @internal */
  private readonly _taskQueue: TaskQueue;
  /** @internal */
  private readonly _opts: QueueTaskOptions = { delay: defaultDelay };
  /** @internal */
  private readonly _firstArg: IsAssign | null = null;
  /** @internal */
  private _task: ITask | null = null;

  public constructor(
    binding: IInterceptableBinding,
    expr: BindingBehaviorExpression,
  ) {
    super(binding, expr);
    this._taskQueue = binding.get(IPlatform).taskQueue;
    if (expr.args.length > 0) {
      this._firstArg = expr.args[0];
    }
  }

  public callSource(args: object): unknown {
    this.queueTask(() => this.binding.callSource!(args));
    return void 0;
  }

  public handleChange(newValue: unknown, oldValue: unknown): void {
    // when source has changed before the latest debounced value from target
    // then discard that value, and take latest value from source only
    if (this._task !== null) {
      this._task.cancel();
      this._task = null;
    }
    this.binding.handleChange(newValue, oldValue);
  }

  public updateSource(newValue: unknown): void {
    this.queueTask(() => this.binding.updateSource!(newValue));
  }

  private queueTask(callback: () => void): void {
    // Queue the new one before canceling the old one, to prevent early yield
    const task = this._task;
    this._task = this._taskQueue.queueTask(() => {
      this._task = null;
      return callback();
    }, this._opts);
    task?.cancel();
  }

  public $bind(scope: Scope): void {
    if (this._firstArg !== null) {
      const delay = Number(astEvaluate(this._firstArg, scope, this, null));
      this._opts.delay = isNaN(delay) ? defaultDelay : delay;
    }
    this.binding.$bind(scope);
  }

  public $unbind(): void {
    this._task?.cancel();
    this._task = null;
    this.binding.$unbind();
  }
}

bindingBehavior('debounce')(DebounceBindingBehavior);
