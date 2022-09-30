import { IPlatform, type IDisposable } from '@aurelia/kernel';
import { TaskQueue } from '@aurelia/platform';
import { BindingBehaviorInstance, type IBinding, type IRateLimitOptions, type Scope } from '@aurelia/runtime';
import { bindingBehavior } from '../binding-behavior';

const bindingHandlerMap: WeakMap<IBinding, IDisposable> = new WeakMap();
const defaultDelay = 200;

export class ThrottleBindingBehavior implements BindingBehaviorInstance {
  /** @internal */
  protected static inject = [IPlatform];
  /** @internal */
  private readonly _now: () => number;
  /** @internal */
  private readonly _taskQueue: TaskQueue;

  public constructor(platform: IPlatform) {
    this._now = platform.performanceNow;
    this._taskQueue = platform.taskQueue;
  }

  public bind(scope: Scope, binding: IBinding, delay?: number) {
    delay = Number(delay);
    const opts: IRateLimitOptions = {
      type: 'throttle',
      delay: delay > 0 ? delay : defaultDelay,
      now: this._now,
      queue: this._taskQueue,
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

  // todo: observe and update rate
}

bindingBehavior('throttle')(ThrottleBindingBehavior);
