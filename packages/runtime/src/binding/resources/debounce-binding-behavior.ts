import { IRegistry } from '../../../kernel';
import { IScope, LifecycleFlags } from '../../observation';
import { Binding, IBinding } from '../binding';
import { bindingBehavior } from '../binding-behavior';
import { BindingMode } from '../binding-mode';

// defaults to nodejs setTimeout type otherwise
declare var setTimeout: typeof window['setTimeout'];

export type DebounceableBinding = IBinding & {
  debouncedMethod: ((newValue: unknown, oldValue: unknown, flags: LifecycleFlags) => void) & { originalName: string };
  debounceState: {
    callContextToDebounce: LifecycleFlags;
    delay: number;
    timeoutId: number;
    oldValue: unknown;
  };
};

const unset = {};

/*@internal*/
export function debounceCallSource(this: DebounceableBinding, newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void {
  const state = this.debounceState;
  clearTimeout(state.timeoutId);
  state.timeoutId = setTimeout(() => this.debouncedMethod(newValue, oldValue, flags), state.delay);
}

/*@internal*/
export function debounceCall(this: DebounceableBinding, newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void {
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
  // To disambiguate between "number" and "NodeJS.Timer" we cast it to an unknown, so we can subsequently cast it to number.
  const timeoutId: unknown = setTimeout(
    () => {
      const ov = state.oldValue;
      state.oldValue = unset;
      this.debouncedMethod(newValue, ov, flags);
    },
    state.delay
  );
  state.timeoutId = timeoutId as number;
}

const fromView = BindingMode.fromView;

@bindingBehavior('debounce')
export class DebounceBindingBehavior {
  public static register: IRegistry['register'];

  public bind(flags: LifecycleFlags, scope: IScope, binding: DebounceableBinding, delay: number = 200): void {
    let methodToDebounce;
    let callContextToDebounce;
    let debouncer;

    if (binding instanceof Binding) {
      methodToDebounce = 'handleChange';
      debouncer = debounceCall;
      callContextToDebounce = binding.mode & fromView ? LifecycleFlags.updateSourceExpression : LifecycleFlags.updateTargetInstance;
    } else {
      methodToDebounce = 'callSource';
      debouncer = debounceCallSource;
      callContextToDebounce = LifecycleFlags.updateTargetInstance;
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

  public unbind(flags: LifecycleFlags, scope: IScope, binding: DebounceableBinding): void {
    // restore the state of the binding.
    const methodToRestore = binding.debouncedMethod.originalName;
    binding[methodToRestore] = binding.debouncedMethod;
    binding.debouncedMethod = null;
    clearTimeout(binding.debounceState.timeoutId);
    binding.debounceState = null;
  }
}
