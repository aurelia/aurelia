import { Binding } from '../binding';
import { bindingBehavior } from '../binding-behavior';
import { IScope } from '../binding-context';
import { BindingFlags } from '../binding-flags';
import { BindingMode } from '../binding-mode';
import { Call } from '../call';
import { Listener } from '../listener';

export type DebounceableBinding = (Binding | Call | Listener) & {
  debouncedMethod: ((newValue: any, oldValue: any, flags: BindingFlags) => void) & { originalName: string };
  debounceState: {
    callContextToDebounce: BindingFlags,
    delay: number,
    timeoutId: any,
    oldValue: any
  }
};

const unset = {};

/*@internal*/
export function debounceCallSource(event: Event) {
  const state = this.debounceState;
  clearTimeout(state.timeoutId);
  state.timeoutId = setTimeout(() => this.debouncedMethod(event), state.delay);
}

/*@internal*/
export function debounceCall(this: DebounceableBinding, newValue: any, oldValue: any, flags: BindingFlags) {
  const state = this.debounceState;
  clearTimeout(state.timeoutId);
  if (!(flags & state.callContextToDebounce)) {
    state.oldValue = unset;
    this.debouncedMethod(newValue, oldValue, flags);
    return;
  }
  if (state.oldValue === unset) {
    state.oldValue = oldValue;
  }
  state.timeoutId = setTimeout(() => {
    const ov = state.oldValue;
    state.oldValue = unset;
    this.debouncedMethod(newValue, ov, flags);
  }, state.delay);
}

const fromView = BindingMode.fromView;

@bindingBehavior('debounce')
export class DebounceBindingBehavior {
  public bind(flags: BindingFlags, scope: IScope, binding: DebounceableBinding, delay = 200) {
    let methodToDebounce;
    let callContextToDebounce;
    let debouncer;

    if (binding instanceof Binding) {
      methodToDebounce = 'handleChange';
      debouncer = debounceCall;
      callContextToDebounce = binding.mode & fromView ? BindingFlags.updateSourceExpression : BindingFlags.updateTargetInstance;
    } else {
      methodToDebounce = 'callSource';
      debouncer = debounceCallSource;
      callContextToDebounce = BindingFlags.updateTargetInstance;
    }

    // stash the original method and it's name.
    // note: a generic name like "originalMethod" is not used to avoid collisions
    // with other binding behavior types.
    binding.debouncedMethod = binding[methodToDebounce];
    binding.debouncedMethod.originalName = methodToDebounce;

    // replace the original method with the debouncing version.
    binding[methodToDebounce] = debouncer;

    // create the debounce state.
    binding.debounceState = {
      callContextToDebounce,
      delay,
      timeoutId: 0,
      oldValue: unset
    };
  }

  public unbind(flags: BindingFlags, scope: IScope, binding: DebounceableBinding) {
    // restore the state of the binding.
    const methodToRestore = binding.debouncedMethod.originalName;
    binding[methodToRestore] = binding.debouncedMethod;
    binding.debouncedMethod = null;
    clearTimeout(binding.debounceState.timeoutId);
    binding.debounceState = null;
  }
}
