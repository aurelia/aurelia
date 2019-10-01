import { __decorate } from "tslib";
import { PLATFORM } from '@aurelia/kernel';
import { PropertyBinding } from '../../binding/property-binding';
import { BindingMode } from '../../flags';
import { bindingBehavior } from '../binding-behavior';
/** @internal */
export function throttle(newValue) {
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
        const timeoutId = PLATFORM.global.setTimeout(() => {
            state.timeoutId = -1;
            state.last = +new Date();
            this.throttledMethod(state.newValue);
        }, state.delay - elapsed);
        state.timeoutId = timeoutId;
    }
}
let ThrottleBindingBehavior = class ThrottleBindingBehavior {
    bind(flags, scope, binding, delay = 200) {
        let methodToThrottle;
        if (binding instanceof PropertyBinding) {
            if (binding.mode === BindingMode.twoWay) {
                methodToThrottle = 'updateSource';
            }
            else {
                methodToThrottle = 'updateTarget';
            }
        }
        else {
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
            timeoutId: -1
        };
    }
    unbind(flags, scope, binding) {
        // restore the state of the binding.
        const methodToRestore = binding.throttledMethod.originalName;
        binding[methodToRestore] = binding.throttledMethod;
        binding.throttledMethod = null;
        PLATFORM.global.clearTimeout(binding.throttleState.timeoutId);
        binding.throttleState = null;
    }
};
ThrottleBindingBehavior = __decorate([
    bindingBehavior('throttle')
], ThrottleBindingBehavior);
export { ThrottleBindingBehavior };
//# sourceMappingURL=throttle.js.map