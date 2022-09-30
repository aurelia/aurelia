import { IDisposable, IPlatform } from '@aurelia/kernel';
import { bindingBehavior } from '../binding-behavior';

import { type BindingBehaviorInstance, type IBinding, type IRateLimitOptions, type Scope } from '@aurelia/runtime';

const bindingHandlerMap: WeakMap<IBinding, IDisposable> = new WeakMap();
const defaultDelay = 200;

export class DebounceBindingBehavior implements BindingBehaviorInstance {
  /** @internal */
  protected static inject = [IPlatform];
  /** @internal */
  private readonly _platform: IPlatform;

  public constructor(platform: IPlatform) {
    this._platform = platform;
  }

  public bind(scope: Scope, binding: IBinding, delay?: number) {
    delay = Number(delay);
    const opts: IRateLimitOptions = {
      type: 'debounce',
      delay: delay > 0 ? delay : defaultDelay,
      now: this._platform.performanceNow,
      queue: this._platform.taskQueue,
    };
    const handler = binding.limit?.(opts);
    if (handler == null) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn(`Binding ${binding.constructor.name} does not support debounce rate limiting`);
      }
    } else {
      bindingHandlerMap.set(binding, handler);
    }
  }

  public unbind(scope: Scope, binding: IBinding) {
    bindingHandlerMap.get(binding)?.dispose();
    bindingHandlerMap.delete(binding);
  }
  // /** @internal */
  // private readonly _taskQueue: TaskQueue;
  // /** @internal */
  // private readonly _opts: QueueTaskOptions = { delay: defaultDelay };
  // /** @internal */
  // private readonly _firstArg: IsAssign | null = null;
  // /** @internal */
  // private _task: ITask | null = null;

  // public constructor(
  //   binding: IInterceptableBinding,
  //   expr: BindingBehaviorExpression,
  // ) {
  //   super(binding, expr);
  //   this._taskQueue = binding.get(IPlatform).taskQueue;
  //   if (expr.args.length > 0) {
  //     this._firstArg = expr.args[0];
  //   }
  // }

  // public callSource(args: object): unknown {
  //   this.queueTask(() => this.binding.callSource!(args));
  //   return void 0;
  // }

  // public handleChange(newValue: unknown, oldValue: unknown): void {
  //   // when source has changed before the latest debounced value from target
  //   // then discard that value, and take latest value from source only
  //   if (this._task !== null) {
  //     this._task.cancel();
  //     this._task = null;
  //   }
  //   this.binding.handleChange(newValue, oldValue);
  // }

  // public updateSource(newValue: unknown): void {
  //   this.queueTask(() => this.binding.updateSource!(newValue));
  // }

  // private queueTask(callback: () => void): void {
  //   // Queue the new one before canceling the old one, to prevent early yield
  //   const task = this._task;
  //   this._task = this._taskQueue.queueTask(() => {
  //     this._task = null;
  //     return callback();
  //   }, this._opts);
  //   task?.cancel();
  // }

  // public $bind(scope: Scope): void {
  //   if (this._firstArg !== null) {
  //     const delay = Number(astEvaluate(this._firstArg, scope, this, null));
  //     this._opts.delay = isNaN(delay) ? defaultDelay : delay;
  //   }
  //   this.binding.$bind(scope);
  // }

  // public $unbind(): void {
  //   this._task?.cancel();
  //   this._task = null;
  //   this.binding.$unbind();
  // }
}

bindingBehavior('debounce')(DebounceBindingBehavior);
