import { IScope, LifecycleFlags } from '../../observation';
import { Binding } from '../binding';
import { bindingBehavior } from '../binding-behavior';
import { BindingMode } from '../binding-mode';
import { Call } from '../call';
import { Listener } from '../listener';

export type ThrottleableBinding = (Binding | Call | Listener) & {
  throttledMethod: ((value: any) => any) & { originalName: string };
  throttleState: {
    delay: number;
    timeoutId: any;
    last: any;
    newValue?: any;
  };
};

/*@internal*/
export function throttle(this: ThrottleableBinding, newValue: any): void {
  const state = this.throttleState;
  const elapsed = +new Date() - state.last;

  if (elapsed >= state.delay) {
    clearTimeout(state.timeoutId);
    state.timeoutId = null;
    state.last = +new Date();
    this.throttledMethod(newValue);
    return;
  }

  state.newValue = newValue;

  if (state.timeoutId === null) {
    state.timeoutId = setTimeout(
      () => {
        state.timeoutId = null;
        state.last = +new Date();
        this.throttledMethod(state.newValue);
      },
      state.delay - elapsed
    );
  }
}

@bindingBehavior('throttle')
export class ThrottleBindingBehavior {
  public bind(flags: LifecycleFlags, scope: IScope, binding: ThrottleableBinding, delay: number = 200): void {
    let methodToThrottle: string;

    if (binding instanceof Binding) {
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
    binding.throttledMethod = binding[methodToThrottle];
    binding.throttledMethod.originalName = methodToThrottle;

    // replace the original method with the throttling version.
    binding[methodToThrottle] = throttle;

    // create the throttle state.
    binding.throttleState = {
      delay: delay,
      last: 0,
      timeoutId: null
    };
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: ThrottleableBinding): void {
    // restore the state of the binding.
    const methodToRestore = binding.throttledMethod.originalName;
    binding[methodToRestore] = binding.throttledMethod;
    binding.throttledMethod = null;
    clearTimeout(binding.throttleState.timeoutId);
    binding.throttleState = null;
  }
}
