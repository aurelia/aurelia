import { IDisposable, IPlatform, emptyArray, resolve } from '@aurelia/kernel';
import { BindingBehaviorStaticAuDefinition } from '../binding-behavior';

import { type BindingBehaviorInstance, type IBinding, type IRateLimitOptions, type Scope } from '@aurelia/runtime';
import { isString } from '../../utilities';

const bindingHandlerMap: WeakMap<IBinding, IDisposable> = new WeakMap();
const defaultDelay = 200;

export class DebounceBindingBehavior implements BindingBehaviorInstance {
  public static readonly $au: BindingBehaviorStaticAuDefinition = {
    type: 'binding-behavior',
    name: 'debounce',
  };
  /** @internal */
  private readonly _platform = resolve(IPlatform);

  public bind(scope: Scope, binding: IBinding, delay?: number, signals?: string | string[]) {
    const opts: IRateLimitOptions = {
      type: 'debounce',
      delay: delay ?? defaultDelay,
      now: this._platform.performanceNow,
      queue: this._platform.taskQueue,
      signals: isString(signals) ? [signals] : (signals ?? emptyArray),
    };
    const handler = binding.limit?.(opts);
    if (handler == null) {
      /* istanbul ignore next */
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
