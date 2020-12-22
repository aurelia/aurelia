"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelfBindingBehavior = exports.handleSelfEvent = void 0;
const runtime_1 = require("@aurelia/runtime");
/** @internal */
function handleSelfEvent(event) {
    const target = event.composedPath()[0];
    if (this.target !== target) {
        return;
    }
    return this.selfEventCallSource(event);
}
exports.handleSelfEvent = handleSelfEvent;
let SelfBindingBehavior = class SelfBindingBehavior {
    bind(flags, _scope, _hostScope, binding) {
        if (!binding.callSource || !binding.targetEvent) {
            throw new Error('Self binding behavior only supports events.');
        }
        binding.selfEventCallSource = binding.callSource;
        binding.callSource = handleSelfEvent;
    }
    unbind(flags, _scope, _hostScope, binding) {
        binding.callSource = binding.selfEventCallSource;
        binding.selfEventCallSource = null;
    }
};
SelfBindingBehavior = __decorate([
    runtime_1.bindingBehavior('self')
], SelfBindingBehavior);
exports.SelfBindingBehavior = SelfBindingBehavior;
//# sourceMappingURL=self.js.map