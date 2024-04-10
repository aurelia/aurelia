import { IPlatform, type IDisposable, emptyArray, resolve } from '@aurelia/kernel';
import { TaskQueue } from '@aurelia/platform';
import { BindingBehaviorInstance, type IBinding, type IRateLimitOptions, type Scope } from '@aurelia/runtime';
import { BindingBehaviorStaticAuDefinition, behaviorTypeName } from '../binding-behavior';
import { isString } from '../../utilities';

const bindingHandlerMap: WeakMap<IBinding, IDisposable> = new WeakMap();
const defaultDelay = 200;

export class ThrottleBindingBehavior implements BindingBehaviorInstance {
  public static readonly $au: BindingBehaviorStaticAuDefinition = {
    type: behaviorTypeName,
    name: 'throttle',
  };
  /** @internal */
  private readonly _now: () => number;
  /** @internal */
  private readonly _taskQueue: TaskQueue;

  public constructor() {
    ({ performanceNow: this._now, taskQueue: this._taskQueue } = resolve(IPlatform));
  }

  public bind(scope: Scope, binding: IBinding, delay?: number, signals?: string | string[]) {
    const opts: IRateLimitOptions = {
      type: 'throttle',
      delay: delay ?? defaultDelay,
      now: this._now,
      queue: this._taskQueue,
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
