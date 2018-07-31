import { Binding } from '../binding';
import { bindingBehavior } from '../binding-behavior';
import { IScope, sourceContext, targetContext } from '../binding-context';
import { BindingFlags } from '../binding-flags';
import { BindingMode } from '../binding-mode';
import { Call } from '../call';
import { Listener } from '../listener';

type DebounceableBinding = (Binding | Call | Listener) & {
  debouncedMethod: ((context: string, newValue: any, oldValue: any) => void) & { originalName: string };
  debounceState: {
    callContextToDebounce: string,
    delay: number,
    timeoutId: any,
    oldValue: any
  }
};

const unset = {};

function debounceCallSource(event: Event) {
  const state = this.debounceState;
  clearTimeout(state.timeoutId);
  state.timeoutId = setTimeout(() => this.debouncedMethod(event), state.delay);
}

function debounceCall(this: DebounceableBinding, context: string, newValue: any, oldValue: any) {
  const state = this.debounceState;
  clearTimeout(state.timeoutId);
  if (context !== state.callContextToDebounce) {
    state.oldValue = unset;
    this.debouncedMethod(context, newValue, oldValue);
    return;
  }
  if (state.oldValue === unset) {
    state.oldValue = oldValue;
  }
  state.timeoutId = setTimeout(() => {
    const ov = state.oldValue;
    state.oldValue = unset;
    this.debouncedMethod(context, newValue, ov);
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
      methodToDebounce = 'call';
      debouncer = debounceCall;
      callContextToDebounce = binding.mode & fromView ? targetContext : sourceContext;
    } else {
      methodToDebounce = 'callSource';
      debouncer = debounceCallSource;
      callContextToDebounce = sourceContext;
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
