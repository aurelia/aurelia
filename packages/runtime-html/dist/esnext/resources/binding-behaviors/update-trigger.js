var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
    __param(0, IObserverLocator),
    __metadata("design:paramtypes", [Object])
], UpdateTriggerBindingBehavior);
export { UpdateTriggerBindingBehavior };
//# sourceMappingURL=update-trigger.js.map