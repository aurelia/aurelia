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
}

bindingBehavior('debounce')(DebounceBindingBehavior);
