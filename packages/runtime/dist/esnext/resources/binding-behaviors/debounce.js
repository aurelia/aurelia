import { PLATFORM } from '@aurelia/kernel';
import { Binding } from '../../binding/binding';
import { BindingMode } from '../../flags';
import { BindingBehaviorResource } from '../binding-behavior';
const unset = {};
/** @internal */
export function debounceCallSource(newValue, oldValue, flags) {
    const state = this.debounceState;
    PLATFORM.global.clearTimeout(state.timeoutId);
    state.timeoutId = PLATFORM.global.setTimeout(() => { this.debouncedMethod(newValue, oldValue, flags); }, state.delay);
}
/** @internal */
export function debounceCall(newValue, oldValue, flags) {
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
    const timeoutId = PLATFORM.global.setTimeout(() => {
        const ov = state.oldValue;
        state.oldValue = unset;
        this.debouncedMethod(newValue, ov, flags);
    }, state.delay);
    state.timeoutId = timeoutId;
}
const fromView = BindingMode.fromView;
export class DebounceBindingBehavior {
    bind(flags, scope, binding, delay = 200) {
        let methodToDebounce;
        let callContextToDebounce;
        let debouncer;
        if (binding instanceof Binding) {
            methodToDebounce = 'handleChange';
            debouncer = debounceCall;
            callContextToDebounce = binding.mode & fromView ? 32 /* updateSourceExpression */ : 16 /* updateTargetInstance */;
        }
        else {
            methodToDebounce = 'callSource';
            debouncer = debounceCallSource;
            callContextToDebounce = 16 /* updateTargetInstance */;
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
    unbind(flags, scope, binding) {
        // restore the state of the binding.
        const methodToRestore = binding.debouncedMethod.originalName;
        binding[methodToRestore] = binding.debouncedMethod;
        binding.debouncedMethod = null;
        PLATFORM.global.clearTimeout(binding.debounceState.timeoutId);
        binding.debounceState = null;
    }
}
BindingBehaviorResource.define('debounce', DebounceBindingBehavior);
//# sourceMappingURL=debounce.js.map