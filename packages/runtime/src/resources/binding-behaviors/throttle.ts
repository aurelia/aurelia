import { PLATFORM } from '@aurelia/kernel';
import { PropertyBinding } from '../../binding/property-binding';
import { BindingMode, LifecycleFlags } from '../../flags';
import { IBinding } from '../../lifecycle';
import { IScope } from '../../observation';
import { bindingBehavior } from '../binding-behavior';

export type ThrottleableBinding = IBinding & {
  throttledMethod: ((value: unknown) => unknown) & { originalName: string };
  throttleState: {
    delay: number;
    timeoutId: number;
    last: number;
    newValue?: unknown;
  };
};

/** @internal */
export function throttle(this: ThrottleableBinding, newValue: unknown): void {
  const state = this.throttleState;
  const elapsed = +new Date() - state.last;

  if (elapsed >= state.delay) {
    PLATFORM.global.clearTimeout(state.timeoutId);
    state.timeoutId = -1;
    state.last = +new Date();
    this.throttledMethod(newValue);
    return;
  }

  state.newValue = newValue;

  if (state.timeoutId === -1) {
    const timeoutId = PLATFORM.global.setTimeout(
      () => {
        state.timeoutId = -1;
        state.last = +new Date();
        this.throttledMethod(state.newValue);
      },
      state.delay - elapsed
    );
    state.timeoutId = timeoutId;
  }
}

@bindingBehavior('throttle')
export class ThrottleBindingBehavior {
  public bind(flags: LifecycleFlags, scope: IScope, binding: ThrottleableBinding, delay: number = 200): void {
    let methodToThrottle: string;

    if (binding instanceof PropertyBinding) {
      if (binding.mode === BindingMode.twoWay) {
        methodToThrottle = 'updateSource';
      } else {
        methodToThrottle = 'updateTarget';
      }
    } else {
      methodToThrottle = 'callSource';
    }

    // stash the original method and it's name.
    // note: a generic name like "originalMethod" is not used to avoid collisions
    // with other binding behavior types.
    binding.throttledMethod = binding[methodToThrottle as keyof ThrottleableBinding] as ThrottleableBinding['throttledMethod'];
    binding.throttledMethod.originalName = methodToThrottle;

    // replace the original method with the throttling version.
    (binding as typeof binding & { [key: string]: typeof throttle})[methodToThrottle] = throttle as ThrottleableBinding['throttledMethod'];

    // create the throttle state.
    binding.throttleState = {
      delay: delay,
      last: 0,
      timeoutId: -1
    };
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: ThrottleableBinding): void {
    // restore the state of the binding.
    const methodToRestore = binding.throttledMethod.originalName;
    (binding as typeof binding & { [key: string]: ThrottleableBinding['throttledMethod'] })[methodToRestore] = binding.throttledMethod;
    binding.throttledMethod = null!;
    PLATFORM.global.clearTimeout(binding.throttleState.timeoutId);
    binding.throttleState = null!;
  }
}
