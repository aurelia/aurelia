import {BindingMode} from '../binding/binding-mode';
import { Binding } from '../binding/binding';
import { Call } from '../binding/call';
import { Listener } from '../binding/listener';
import { IScope } from '../binding/binding-context';
import { bindingBehavior } from '../decorators';

type ThrottleableBinding = (Binding | Call | Listener) & {
  throttledMethod: ((value) => any) & { originalName: string };
  throttleState: {
    delay: number,
    timeoutId: any,
    last: any,
    newValue?: any
  }
};

function throttle(this: ThrottleableBinding, newValue: any) {
  let state = this.throttleState;
  let elapsed = +new Date() - state.last;
  
  if (elapsed >= state.delay) {
    clearTimeout(state.timeoutId);
    state.timeoutId = null;
    state.last = +new Date();
    this.throttledMethod(newValue);
    return;
  }

  state.newValue = newValue;

  if (state.timeoutId === null) {
    state.timeoutId = setTimeout(() => {
        state.timeoutId = null;
        state.last = +new Date();
        this.throttledMethod(state.newValue);
      }, state.delay - elapsed);
  }
}

@bindingBehavior('throttle')
export class ThrottleBindingBehavior {
  bind(binding: ThrottleableBinding, scope: IScope, delay = 200) {
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

  unbind(binding: ThrottleableBinding, scope: IScope) {
    // restore the state of the binding.
    let methodToRestore = binding.throttledMethod.originalName;
    binding[methodToRestore] = binding.throttledMethod;
    binding.throttledMethod = null;
    clearTimeout(binding.throttleState.timeoutId);
    binding.throttleState = null;
  }
}
