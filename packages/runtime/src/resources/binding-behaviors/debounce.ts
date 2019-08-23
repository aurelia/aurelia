import { PLATFORM } from '@aurelia/kernel';
import { PropertyBinding } from '../../binding/property-binding';
import { BindingMode, LifecycleFlags } from '../../flags';
import { IBinding } from '../../lifecycle';
import { IScope } from '../../observation';
import { bindingBehavior } from '../binding-behavior';

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

/** @internal */
export function debounceCallSource(this: DebounceableBinding, newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void {
  const state = this.debounceState;
  PLATFORM.global.clearTimeout(state.timeoutId);
  state.timeoutId = PLATFORM.global.setTimeout(() => { this.debouncedMethod(newValue, oldValue, flags); }, state.delay);
}

/** @internal */
export function debounceCall(this: DebounceableBinding, newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void {
  const state = this.debounceState;
  PLATFORM.global.clearTimeout(state.timeoutId);
  if (!(flags & state.callContextToDebounce)) {
    state.oldValue = unset;
    this.debouncedMethod(newValue, oldValue, flags);
    return;
  }
  if (state.oldValue === unset) {
    state.oldValue = oldValue;
  }
  const timeoutId = PLATFORM.global.setTimeout(
    () => {
      const ov = state.oldValue;
      state.oldValue = unset;
      this.debouncedMethod(newValue, ov, flags);
    },
    state.delay
  );
  state.timeoutId = timeoutId;
}

const fromView = BindingMode.fromView;

@bindingBehavior('debounce')
export class DebounceBindingBehavior {
  public bind(flags: LifecycleFlags, scope: IScope, binding: DebounceableBinding, delay: number = 200): void {
    let methodToDebounce;
    let callContextToDebounce;
    let debouncer: typeof debounceCall | typeof debounceCallSource;

    if (binding instanceof PropertyBinding) {
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
    binding.debouncedMethod = binding[methodToDebounce as keyof DebounceableBinding] as DebounceableBinding['debouncedMethod'];
    binding.debouncedMethod.originalName = methodToDebounce;

    // replace the original method with the debouncing version.
    (binding as typeof binding & { [key: string]: typeof debouncer })[methodToDebounce] = debouncer;

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
    (binding as typeof binding & { [key: string]: DebounceableBinding['debouncedMethod'] })[methodToRestore] = binding.debouncedMethod;
    binding.debouncedMethod = null!;
    PLATFORM.global.clearTimeout(binding.debounceState.timeoutId);
    binding.debounceState = null!;
  }
}
