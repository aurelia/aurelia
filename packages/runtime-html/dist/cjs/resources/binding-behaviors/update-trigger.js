"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTriggerBindingBehavior = void 0;
const runtime_1 = require("@aurelia/runtime");
const event_delegator_js_1 = require("../../observation/event-delegator.js");
const observer_locator_js_1 = require("../../observation/observer-locator.js");
let UpdateTriggerBindingBehavior = class UpdateTriggerBindingBehavior {
    constructor(observerLocator) {
        this.observerLocator = observerLocator;
    }
    bind(flags, _scope, _hostScope, binding, ...events) {
        if (events.length === 0) {
            throw new Error('The updateTrigger binding behavior requires at least one event name argument: eg <input value.bind="firstName & updateTrigger:\'blur\'">');
        }
        if (binding.mode !== runtime_1.BindingMode.twoWay && binding.mode !== runtime_1.BindingMode.fromView) {
            throw new Error('The updateTrigger binding behavior can only be applied to two-way/ from-view bindings on input/select elements.');
        }
        // ensure the binding's target observer has been set.
        const targetObserver = this.observerLocator.getObserver(binding.target, binding.targetProperty);
        if (!targetObserver.handler) {
            throw new Error('The updateTrigger binding behavior can only be applied to two-way/ from-view bindings on input/select elements.');
        }
        binding.targetObserver = targetObserver;
        // stash the original element subscribe function.
        const originalHandler = targetObserver.handler;
        targetObserver.originalHandler = originalHandler;
        // replace the element subscribe function with one that uses the correct events.
        targetObserver.handler = new event_delegator_js_1.EventSubscriber(new observer_locator_js_1.NodeObserverConfig({
            default: originalHandler.config.default,
            events,
            readonly: originalHandler.config.readonly
        }));
    }
    unbind(flags, _scope, _hostScope, binding) {
        // restore the state of the binding.
        binding.targetObserver.handler.dispose();
        binding.targetObserver.handler = binding.targetObserver.originalHandler;
        binding.targetObserver.originalHandler = null;
    }
};
UpdateTriggerBindingBehavior = __decorate([
    runtime_1.bindingBehavior('updateTrigger'),
    __param(0, runtime_1.IObserverLocator)
], UpdateTriggerBindingBehavior);
exports.UpdateTriggerBindingBehavior = UpdateTriggerBindingBehavior;
//# sourceMappingURL=update-trigger.js.map