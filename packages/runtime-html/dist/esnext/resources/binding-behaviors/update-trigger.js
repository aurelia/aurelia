import { __decorate, __param } from "tslib";
import { Reporter } from '@aurelia/kernel';
import { BindingMode, IDOM, IObserverLocator, bindingBehavior } from '@aurelia/runtime';
import { EventSubscriber } from '../../observation/event-manager';
let UpdateTriggerBindingBehavior = class UpdateTriggerBindingBehavior {
    constructor(observerLocator) {
        this.observerLocator = observerLocator;
    }
    bind(flags, scope, binding, ...events) {
        if (events.length === 0) {
            throw Reporter.error(9);
        }
        if (binding.mode !== BindingMode.twoWay && binding.mode !== BindingMode.fromView) {
            throw Reporter.error(10);
        }
        this.persistentFlags = flags & 2080374799 /* persistentBindingFlags */;
        // ensure the binding's target observer has been set.
        const targetObserver = this.observerLocator.getObserver(this.persistentFlags | flags, binding.target, binding.targetProperty);
        if (!targetObserver.handler) {
            throw Reporter.error(10);
        }
        binding.targetObserver = targetObserver;
        // stash the original element subscribe function.
        targetObserver.originalHandler = binding.targetObserver.handler;
        // replace the element subscribe function with one that uses the correct events.
        targetObserver.handler = new EventSubscriber(binding.locator.get(IDOM), events);
    }
    unbind(flags, scope, binding) {
        // restore the state of the binding.
        binding.targetObserver.handler.dispose();
        binding.targetObserver.handler = binding.targetObserver.originalHandler;
        binding.targetObserver.originalHandler = null;
    }
};
UpdateTriggerBindingBehavior = __decorate([
    bindingBehavior('updateTrigger'),
    __param(0, IObserverLocator)
], UpdateTriggerBindingBehavior);
export { UpdateTriggerBindingBehavior };
//# sourceMappingURL=update-trigger.js.map